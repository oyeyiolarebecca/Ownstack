"""Bitnob API client (HMAC-SHA256 signed requests).

Auth scheme (per https://docs.bitnob.com/docs/authentication):
  Headers on every request:
    x-auth-client     = BITNOB_CLIENT_ID
    x-auth-timestamp  = Unix epoch ms as string
    x-auth-nonce      = fresh UUID v4 per request
    x-auth-signature  = base64(HMAC_SHA256(secret, clientId + METHOD + path + timestamp + body))

  Notes:
    - `path` is the path + query string (no host).
    - `body` is the EXACT raw bytes sent. We pre-serialize JSON with no extra
      whitespace and then both sign and send those exact bytes.
    - Empty body uses '' in the signing string.
    - Timestamp must be within +/- 5 minutes of Bitnob's server clock.

If credentials are missing or every endpoint 401s, falls back to a
deterministic MOCK so the demo loop never breaks.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import secrets
import time
import uuid
from dataclasses import dataclass
from typing import Any

import httpx

from .config import get_settings

log = logging.getLogger("ownstack.bitnob")


@dataclass
class VirtualAccount:
    account_number: str
    bank_name: str
    account_name: str
    reference: str
    is_mock: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "account_number": self.account_number,
            "bank_name": self.bank_name,
            "account_name": self.account_name,
            "reference": self.reference,
            "is_mock": self.is_mock,
        }


# Path candidates for NUBAN provisioning. Bitnob has shipped this under
# several names; we try each until one works.
_NUBAN_PATH_CANDIDATES = [
    "/api/v1/customers/virtual-accounts",
    "/api/v1/virtual-accounts",
    "/api/v1/addresses/generate",
]


class BitnobClient:
    def __init__(self) -> None:
        s = get_settings()
        self.base_url = s.BITNOB_BASE_URL.rstrip("/")
        self.client_id = s.BITNOB_CLIENT_ID or ""
        # Accept either BITNOB_SECRET (preferred) or BITNOB_API_KEY (legacy/alt name in dashboard)
        self.secret = s.BITNOB_SECRET or s.BITNOB_API_KEY or ""
        self._client = httpx.AsyncClient(timeout=20.0)

    async def close(self) -> None:
        await self._client.aclose()

    def _has_creds(self) -> bool:
        return bool(self.client_id and self.secret)

    def _sign(self, method: str, path: str, body_bytes: bytes) -> dict[str, str]:
        timestamp = str(int(time.time() * 1000))
        nonce = str(uuid.uuid4())
        body_str = body_bytes.decode("utf-8") if body_bytes else ""
        signing_string = f"{self.client_id}{method.upper()}{path}{timestamp}{body_str}"
        digest = hmac.new(
            key=self.secret.encode("utf-8"),
            msg=signing_string.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        signature = base64.b64encode(digest).decode("ascii")
        return {
            "x-auth-client": self.client_id,
            "x-auth-timestamp": timestamp,
            "x-auth-nonce": nonce,
            "x-auth-signature": signature,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    async def _request(self, method: str, path: str, body: dict[str, Any] | None = None) -> httpx.Response:
        # IMPORTANT: serialize once and reuse the exact bytes for both signing and sending.
        body_bytes = b""
        if body is not None:
            body_bytes = json.dumps(body, separators=(",", ":")).encode("utf-8")
        headers = self._sign(method, path, body_bytes)
        url = f"{self.base_url}{path}"
        return await self._client.request(method.upper(), url, headers=headers, content=body_bytes)

    async def healthcheck(self) -> dict[str, Any]:
        """GET /api/v1/wallets - cheapest authenticated endpoint."""
        if not self._has_creds():
            return {"ok": False, "reason": "missing_client_id_or_secret"}
        try:
            r = await self._request("GET", "/api/v1/wallets")
            return {"ok": r.is_success, "status": r.status_code, "body_snippet": r.text[:200]}
        except httpx.HTTPError as e:
            return {"ok": False, "reason": str(e)}

    async def create_virtual_account(
        self,
        *,
        invoice_id: int,
        customer_name: str,
        merchant_email: str | None = None,
        amount_ngn: float | None = None,
    ) -> VirtualAccount:
        """Provision a virtual NUBAN tied to this invoice.

        Tries known endpoint paths in order. Falls back to a deterministic mock
        if none of them succeed.
        """
        payload: dict[str, Any] = {
            "customer_email": merchant_email or "demo@ownstack.app",
            "customer_name": customer_name,
            "reference": f"ownstack-inv-{invoice_id}",
        }
        if amount_ngn is not None:
            payload["amount"] = amount_ngn

        if self._has_creds():
            for path in _NUBAN_PATH_CANDIDATES:
                try:
                    r = await self._request("POST", path, payload)
                    if r.is_success:
                        return _parse_virtual_account(r.json(), fallback_ref=payload["reference"])
                    log.warning("bitnob %s -> %s %s", path, r.status_code, r.text[:200])
                except httpx.HTTPError as e:
                    log.warning("bitnob %s network error: %s", path, e)
                    continue

        # ---- Mock fallback -------------------------------------------------
        seed = hashlib.sha256(f"ownstack-{invoice_id}".encode()).hexdigest()
        account_number = "9" + seed[:9]
        return VirtualAccount(
            account_number=account_number,
            bank_name="Wema Bank (Sandbox)",
            account_name=f"OwnStack/{customer_name[:20]}",
            reference=f"ownstack-inv-{invoice_id}-{secrets.token_hex(3)}",
            is_mock=True,
        )


def _parse_virtual_account(body: dict[str, Any], *, fallback_ref: str) -> VirtualAccount:
    data = body.get("data", body) or {}
    account_number = (
        data.get("account_number") or data.get("accountNumber") or data.get("nuban") or ""
    )
    bank_name = (
        data.get("bank_name") or data.get("bankName") or data.get("bank") or "Bitnob Partner Bank"
    )
    account_name = (
        data.get("account_name") or data.get("accountName") or data.get("name") or "OwnStack Merchant"
    )
    reference = (
        data.get("reference") or data.get("ref") or data.get("id") or fallback_ref
    )
    return VirtualAccount(
        account_number=str(account_number),
        bank_name=str(bank_name),
        account_name=str(account_name),
        reference=str(reference),
        is_mock=False,
    )


# Singleton --------------------------------------------------------------------
_client: BitnobClient | None = None


def get_bitnob() -> BitnobClient:
    global _client
    if _client is None:
        _client = BitnobClient()
    return _client
