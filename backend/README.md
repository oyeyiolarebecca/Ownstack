# OwnStack Backend (FastAPI)

Thin bridge between the OwnStack Next.js frontend, Supabase (database +
auth), and Bitnob (Naira virtual accounts + Lightning settlement).

The frontend talks to Supabase directly for everything except the two
things this service does:

1. **Allocate a virtual NUBAN** for an invoice (calls Bitnob, writes the
   account number back to Supabase).
2. **Receive Bitnob payment webhooks** and flip the matching invoice row
   to `status='Paid'`. Supabase Realtime then pushes that change live
   into the merchant's dashboard.

In `DEMO_MODE=true` a `/webhooks/bitnob/simulate` endpoint is exposed so
the demo can fake a successful payment without an actual bank transfer.

---

## 1. Run it locally

### Prereqs
- Python 3.11+
- The Supabase migration already applied (`migrations/001_ownstack_schema.sql`)
- A `.env` file at `backend/.env` (see section 2)

### Boot
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Smoke test
```powershell
# from a second terminal
curl.exe http://localhost:8000/health
```
Expected:
```json
{"ok":true,"service":"ownstack-api","demo_mode":true,"bitnob":{"ok":false,"status":401}}
```
`bitnob.ok` will be `false` until the Bitnob key is verified in the
dashboard. The mock fallback in `app/bitnob.py` keeps the system working
either way.

---

## 2. Environment

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `SUPABASE_URL` | yes | Same URL the frontend uses. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Bypasses RLS. **Never expose to the browser.** |
| `BITNOB_BASE_URL` | yes | `https://sandboxapi.bitnob.co` for sandbox. |
| `BITNOB_API_KEY` | yes | From Bitnob dashboard. |
| `BITNOB_WEBHOOK_SECRET` | optional | If set, real Bitnob webhooks are HMAC-verified. If blank, verification is skipped (demo only). |
| `CORS_ORIGINS` | yes | Comma-separated frontend origins. |
| `DEMO_MODE` | yes | `true` enables the webhook simulator. Set `false` in production. |
| `NGN_PER_SAT_FALLBACK` | optional | Fallback NGN/sat rate if Bitnob quote endpoint fails. |

`.env` is gitignored. Do not commit it.

---

## 3. API contract for the frontend

Base URL during development: `http://localhost:8000`.

### `GET /health`
Returns service status and whether the Bitnob key authenticates.

### `POST /invoices/allocate-nuban`
Provision (or fetch the existing) virtual NUBAN for a given invoice and
persist it on the invoice row.

Request:
```json
{
  "invoice_id": 1,
  "customer_name": "Mama Tunde",
  "amount_ngn": 25000,
  "merchant_email": "merchant@example.com"
}
```

Response:
```json
{
  "invoice_id": 1,
  "account_number": "98587ccf02",
  "bank_name": "Wema Bank (Sandbox)",
  "account_name": "OwnStack/Mama Tunde",
  "reference": "ownstack-inv-1-d8fff3",
  "is_mock": true
}
```

- Idempotent: calling it again for the same `invoice_id` returns the
  same NUBAN.
- `is_mock: true` means the Bitnob call failed and a deterministic
  fallback NUBAN was generated. The frontend can still display it; the
  demo simulator below will still flip the invoice to Paid.
- Side effect: updates `invoices.virtual_account_number`,
  `virtual_account_bank`, `virtual_account_name`, `bitnob_reference`,
  `amount_ngn` for that row.

### `POST /webhooks/bitnob`
Called by Bitnob when a payment lands. Verifies the HMAC-SHA512
signature in the `X-Bitnob-Signature` header against
`BITNOB_WEBHOOK_SECRET`, finds the matching invoice (by
`bitnob_reference`, then `virtual_account_number`, then
`metadata.invoice_id`), and sets `status='Paid'` and `paid_at=now()`.

Not called by the frontend directly.

### `POST /webhooks/bitnob/simulate`  *(DEMO_MODE only)*
Same effect as a real webhook but takes a plain `invoice_id` and skips
signature verification. The frontend's "Mark as paid for demo" button,
if added, should hit this endpoint.

Request:
```json
{ "invoice_id": 1 }
```

Response:
```json
{ "matched": true, "invoice_id": 1, "status": "Paid" }
```

---

## 4. End-to-end demo flow

1. Merchant creates an invoice in the frontend → Supabase inserts a row.
2. Frontend calls `POST /invoices/allocate-nuban` with the new
   invoice id. Backend provisions a NUBAN and writes it back.
3. Frontend renders the customer-facing payment page showing the NUBAN,
   bank name, and NGN amount.
4. Customer pays → Bitnob hits `POST /webhooks/bitnob` →
   backend sets `status='Paid'`.
5. Supabase Realtime pushes the row change into the merchant's
   dashboard. The frontend then signs and broadcasts a Nostr Kind 31111
   event for un-wipeable backup.

For demo without a real transfer, replace step 4 with a `POST
/webhooks/bitnob/simulate` call.

---

## 5. Exposing the webhook publicly (for real Bitnob payments)

Bitnob needs a public HTTPS URL. Use ngrok during dev:

```powershell
# in a separate terminal
ngrok http 8000
```

Copy the `https://xxxx.ngrok.io` URL ngrok prints, then in the Bitnob
dashboard register `https://xxxx.ngrok.io/webhooks/bitnob` as the
webhook endpoint. Reuse the secret Bitnob shows you as
`BITNOB_WEBHOOK_SECRET` in `.env` and restart uvicorn.

---

## 6. Layout

```
backend/
  app/
    __init__.py
    config.py        # env loading (pydantic-settings)
    db.py            # Supabase service-role client (singleton)
    bitnob.py        # Bitnob HTTP client + deterministic mock fallback
    main.py          # FastAPI app + routes
  migrations/
    001_ownstack_schema.sql
  .env.example
  .gitignore
  README.md
  requirements.txt
  run.ps1
```

---

## 7. Known limitations / follow-ups

- **Bitnob key currently returns 401.** Mock fallback handles it
  transparently. Verify the key in the Bitnob dashboard (sandbox vs
  live, active status, KYB approval) before the demo.
- **No `/quote` endpoint yet.** NGN ↔ sats conversion is hardcoded on
  the frontend or computed from `NGN_PER_SAT_FALLBACK`. Add a Bitnob
  quote call here if a live rate is needed.
- **No payouts (Naira out-ramp).** Scope cut for the hackathon.
- **Webhook signature verification is HMAC-SHA512 with the raw body**
  per Bitnob's standard. If Bitnob's actual scheme differs for your
  account, update `_verify_bitnob_signature` in `app/main.py`.
