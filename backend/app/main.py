"""OwnStack FastAPI bridge.

Responsibilities:
  - Allocate a Bitnob virtual NUBAN for a given invoice and write it back to
    Supabase so the frontend can display it on the customer-facing page.
  - Receive Bitnob payment webhooks, verify the signature, and update the
    Supabase invoice row to status='Paid'. Supabase Realtime then pushes
    the change into the merchant's dashboard live.
  - In DEMO_MODE, expose a /webhooks/bitnob/simulate endpoint that fakes a
    payment success so we can rehearse the demo without a real bank
    transfer.

This service is intentionally thin. The frontend talks to Supabase directly
for everything except the two things above.
"""
from __future__ import annotations

import hashlib
import hmac
import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .bitnob import get_bitnob
from .config import get_settings
from .db import get_supabase

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("ownstack.api")

settings = get_settings()

app = FastAPI(title="OwnStack API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health
@app.get("/health")
async def health() -> dict[str, Any]:
    bitnob_status = await get_bitnob().healthcheck()
    return {
        "ok": True,
        "service": "ownstack-api",
        "demo_mode": settings.DEMO_MODE,
        "bitnob": bitnob_status,
    }


# NUBAN allocation

class AllocateNubanIn(BaseModel):
    invoice_id: int
    customer_name: str = Field(..., min_length=1, max_length=120)
    amount_ngn: float | None = None
    merchant_email: str | None = None


class AllocateNubanOut(BaseModel):
    invoice_id: int
    account_number: str
    bank_name: str
    account_name: str
    reference: str
    is_mock: bool


@app.post("/invoices/allocate-nuban", response_model=AllocateNubanOut)
async def allocate_nuban(body: AllocateNubanIn) -> AllocateNubanOut:
    """Provision a virtual NUBAN for an invoice and persist it on the row.

    Idempotent: if the row already has a virtual_account_number we return
    that one instead of creating another.
    """
    sb = get_supabase()
    if sb:
        existing = (
            sb.table("invoices")
            .select("id,virtual_account_number,virtual_account_bank,virtual_account_name,bitnob_reference")
            .eq("id", body.invoice_id)
            .single()
            .execute()
        )
        row = existing.data or {}
        if row.get("virtual_account_number"):
            return AllocateNubanOut(
                invoice_id=body.invoice_id,
                account_number=row["virtual_account_number"],
                bank_name=row.get("virtual_account_bank") or "",
                account_name=row.get("virtual_account_name") or "",
                reference=row.get("bitnob_reference") or "",
                is_mock=False,
            )

    va = await get_bitnob().create_virtual_account(
        invoice_id=body.invoice_id,
        customer_name=body.customer_name,
        merchant_email=body.merchant_email,
        amount_ngn=body.amount_ngn,
    )

    if sb:
        sb.table("invoices").update(
            {
                "virtual_account_number": va.account_number,
                "virtual_account_bank": va.bank_name,
                "virtual_account_name": va.account_name,
                "bitnob_reference": va.reference,
                "amount_ngn": body.amount_ngn,
            }
        ).eq("id", body.invoice_id).execute()

    return AllocateNubanOut(
        invoice_id=body.invoice_id,
        account_number=va.account_number,
        bank_name=va.bank_name,
        account_name=va.account_name,
        reference=va.reference,
        is_mock=va.is_mock,
    )



# Bitnob webhook

def _verify_bitnob_signature(raw_body: bytes, signature: str | None) -> bool:
    """Bitnob signs webhook bodies with HMAC-SHA512 using the webhook secret.

    If no secret is configured, signature verification is skipped (DEMO_MODE).
    """
    if not settings.BITNOB_WEBHOOK_SECRET:
        return True  # no secret configured -> trust (demo only)
    if not signature:
        return False
    expected = hmac.new(
        key=settings.BITNOB_WEBHOOK_SECRET.encode(),
        msg=raw_body,
        digestmod=hashlib.sha512,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _settle_invoice_from_event(event: dict[str, Any]) -> dict[str, Any]:
    """Take a Bitnob-shaped event and flip the matching invoice to Paid.

    Lookup precedence:
      1. event.data.reference (matches invoices.bitnob_reference)
      2. event.data.accountNumber (matches invoices.virtual_account_number)
      3. event.reference / event.metadata.invoice_id (fallbacks)
    """
    data = event.get("data") or {}
    reference = data.get("reference") or event.get("reference")
    account_number = data.get("accountNumber") or data.get("account_number")
    invoice_id = (event.get("metadata") or {}).get("invoice_id") or data.get("invoice_id")

    sb = get_supabase()
    query = sb.table("invoices").select("id,status,user_id")

    if reference:
        res = query.eq("bitnob_reference", reference).execute()
    elif account_number:
        res = query.eq("virtual_account_number", account_number).execute()
    elif invoice_id:
        res = query.eq("id", int(invoice_id)).execute()
    else:
        raise HTTPException(status_code=400, detail="webhook missing reference/account/invoice_id")

    rows = res.data or []
    if not rows:
        log.warning("webhook: no matching invoice for reference=%s account=%s", reference, account_number)
        return {"matched": False}

    inv = rows[0]
    if inv["status"] in ("Paid", "PAID", "Completed"):
        return {"matched": True, "invoice_id": inv["id"], "noop": True}

    sb.table("invoices").update(
        {"status": "Paid", "paid_at": "now()"}
    ).eq("id", inv["id"]).execute()

    return {"matched": True, "invoice_id": inv["id"], "status": "Paid"}


@app.post("/webhooks/bitnob")
async def bitnob_webhook(
    request: Request,
    x_bitnob_signature: str | None = Header(default=None, alias="X-Bitnob-Signature"),
) -> dict[str, Any]:
    raw = await request.body()
    if not _verify_bitnob_signature(raw, x_bitnob_signature):
        raise HTTPException(status_code=401, detail="invalid signature")

    try:
        event = await request.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid json: {e}")

    event_type = event.get("event") or event.get("type") or ""
    log.info("bitnob webhook received: %s", event_type)

    # We only care about successful inflows.
    success_markers = ("success", "completed", "paid", "received")
    if not any(m in str(event_type).lower() for m in success_markers):
        return {"ignored": True, "event": event_type}

    return await _settle_invoice_from_event(event)


# Demo-mode simulator

class SimulatePaymentIn(BaseModel):
    invoice_id: int


@app.post("/webhooks/bitnob/simulate")
async def simulate_payment(body: SimulatePaymentIn) -> dict[str, Any]:
    """Pretend Bitnob just told us this invoice was paid. DEMO ONLY."""
    if not settings.DEMO_MODE:
        raise HTTPException(status_code=403, detail="DEMO_MODE is off")
    fake_event = {
        "event": "virtualaccount.received",
        "data": {"invoice_id": body.invoice_id},
        "metadata": {"invoice_id": body.invoice_id},
    }
    return await _settle_invoice_from_event(fake_event)
