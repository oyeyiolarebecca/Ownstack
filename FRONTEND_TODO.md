# OwnStack Frontend — Tasks & Backend Integration

Hand-off doc for the frontend developer. Everything backend-side is **done
and tested end-to-end**. This file lists exactly what needs to change in
the Next.js app to wire it up.

The current frontend was built to take Lightning payments. OwnStack now
takes **Naira bank transfers** as the primary payment method (via Bitnob
virtual accounts), with Lightning kept as a secondary option.

> **Demo path:** customer copies a Nigerian bank account number from the
> invoice page → transfers Naira from their bank app → backend webhook
> flips the invoice to Paid → merchant dashboard updates live.

---

## 1. Backend contract (already running)

Base URL during dev: `http://localhost:8000`

All endpoints return JSON. There is no auth between frontend and FastAPI
yet (CORS is open to `http://localhost:3000`); we assume the frontend is
trusted and Supabase RLS is the real authorisation boundary.

### `GET /health`
Sanity check.

### `POST /invoices/allocate-nuban`
Provision (or fetch the existing) virtual Naira bank account for an
invoice and persist it on the invoice row in Supabase.

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
  "account_number": "9858712345",
  "bank_name": "Wema Bank",
  "account_name": "OwnStack/Mama Tunde",
  "reference": "ownstack-inv-1-d8fff3",
  "is_mock": false
}
```

Notes:
- Idempotent. Calling it twice for the same `invoice_id` returns the
  same NUBAN.
- `is_mock: true` means the Bitnob call failed and a deterministic
  fallback was generated. Display the NUBAN anyway — the simulator
  below will still flip the invoice to Paid.
- Side effect: writes `virtual_account_number`, `virtual_account_bank`,
  `virtual_account_name`, `bitnob_reference`, `amount_ngn` to the
  `invoices` row.

### `POST /webhooks/bitnob/simulate`  *(demo only)*
Pretend Bitnob just confirmed a payment. Use this to demo the live UI
flip without doing a real bank transfer.

Request:
```json
{ "invoice_id": 1 }
```

Response:
```json
{ "matched": true, "invoice_id": 1, "status": "Paid" }
```

The Supabase Realtime channel already in the dashboard will pick up the
change and re-render — no extra polling needed.

### `POST /webhooks/bitnob`
Called by Bitnob, not the frontend. Listed here only so you know it
exists.

---

## 2. Supabase schema changes (already applied)

The migration in `backend/migrations/001_ownstack_schema.sql` has run.
The `invoices` table now has these additional columns the frontend
can read or display:

| Column | Type | Purpose |
|---|---|---|
| `user_id` | uuid | Auto-filled from `auth.uid()` on insert. Don't send it from the client — a trigger sets it. |
| `amount_ngn` | numeric | Naira amount of the invoice. **Primary unit going forward.** |
| `satoshis_equivalent` | bigint | Optional sats equivalent, if computed. |
| `virtual_account_number` | text | The NUBAN to show the customer. |
| `virtual_account_bank` | text | e.g. "Wema Bank". |
| `virtual_account_name` | text | Account holder name to display. |
| `bitnob_reference` | text | Bitnob's reference for the account. |
| `tx_type` | text | `INCOME` / `DEBT` / `WITHDRAWAL`. Default `INCOME`. |
| `nostr_event_id` | text | Kind 31111 event id once published. |
| `paid_at` | timestamptz | Set by webhook when payment lands. |

RLS is on. A merchant can only read/write their own invoices. The public
`/invoice/[id]` page works because we added an anonymous SELECT policy.

---

## 3. Required frontend changes

### 3.1 `.env.local`
Add at the project root:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Use it from any client component:
```ts
const API = process.env.NEXT_PUBLIC_API_URL!;
```

### 3.2 `app/invoice/page.tsx` (Create Invoice)
**Today:** form asks for customer, service, amount (sats). Submits to
Supabase only.

**Change to:**

1. Replace the **amount in sats** input with an **amount in NGN** input.
   Show sats as a small computed hint below if you want (use the
   `NGN_PER_SAT_FALLBACK` rate `1 sat ≈ 1.5 NGN` for now, or hide sats
   entirely for v1).

2. After the Supabase insert succeeds (you already have the new
   invoice's `id`), call:
   ```ts
   await fetch(`${API}/invoices/allocate-nuban`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       invoice_id: data.id,
       customer_name: invoiceData.customer,
       amount_ngn: Number(invoiceData.amount),
       merchant_email: user?.email,
     }),
   });
   ```
   Don't wait on the response for the UI — the row will be re-read
   when the customer opens `/invoice/[id]`.

3. Remove the hardcoded default form values
   (`"David" / "Website Design" / "25000"`). Start empty.

4. The Nostr-only branch (lines that write to `localStorage[\"invoices_$pubkey\"]`)
   should also store the NGN amount. NUBAN allocation does not apply to
   Nostr-only users (no Supabase row → no FastAPI lookup). Either:
   - Skip NUBAN for Nostr-only users (show "Pay with Lightning only"), OR
   - Create a paired Supabase row when the user is also signed in via
     Supabase. Recommended path for the demo is **Supabase + Nostr both
     logged in**.

### 3.3 `components/InvoicePreview.tsx` (Customer-facing payment view)
**Today:** primary CTA is a Lightning QR code.

**Change to:**

1. **Primary panel — Pay by Bank Transfer:**
   - Big, copyable account number
   - Bank name
   - Account name
   - Amount in NGN (large)
   - A "Copy Account Number" button (use `navigator.clipboard`)
   - Read these from the invoice row (`virtual_account_number`,
     `virtual_account_bank`, `virtual_account_name`, `amount_ngn`).
   - If the row's `virtual_account_number` is `null` (which can happen
     for ~1 second between Supabase insert and `/allocate-nuban`
     finishing), show a small "Generating bank details..." spinner.

2. **Secondary tab / collapsed section — Pay with Lightning:**
   - Keep the existing LNURL → BOLT11 QR flow exactly as-is for crypto-
     native customers, but hide it behind a small "Pay with Lightning
     instead" toggle/link.

3. **Delete the fake "Verify Payment" button.** Polling already updates
   the status. The button currently just flips local state and is
   misleading.

4. The mock `setInterval` that only `console.log`s — delete it. Status
   updates come from Supabase Realtime (already subscribed in
   `/invoice/[id]/page.tsx`).

### 3.4 `app/invoice/[id]/page.tsx` (Public invoice view)
**Already mostly correct.** Two small changes:

1. After fetch, if `virtual_account_number` is missing, retry the fetch
   every 1 s for up to 10 s before giving up (covers the NUBAN
   allocation race).

2. Add a small **"Simulate Payment"** button visible only when
   `process.env.NODE_ENV !== "production"` that hits
   `POST ${API}/webhooks/bitnob/simulate` with `{ invoice_id }`. This is
   our demo button.

### 3.5 `app/dashboard/page.tsx` (Merchant home)
1. **Replace sats totals with NGN totals.** Sum `amount_ngn` instead of
   `amount`. Format as `₦25,000` not `25,000 sats`.

2. **Fix `RevenueChart`.** Today it shows hardcoded Jan–Jun fake data
   (`components/RevenueChart.tsx`, lines 10–17). Either:
   - Compute monthly buckets from real `invoices` data, OR
   - Hide the chart entirely on the demo dashboard.
   **Do not ship the fake chart.** Judges always ask.

3. **`ActivityFeed`** is fine — it reads from invoices.

### 3.6 `app/history/page.tsx` & `app/payments/page.tsx`
1. Display amounts in NGN (`amount_ngn` field), not sats.
2. Show the virtual account number as a secondary detail.

### 3.7 Nostr publish on `Paid`  *(critical for the pitch)*
Currently `lib/nostr.ts` only handles login via the NIP-07 extension.
There is **no event publishing yet**.

When an invoice flips to `status === "Paid"` in the Realtime callback
on the dashboard (or in `/invoice/[id]/page.tsx`), publish a Kind 31111
event so the merchant has an un-wipeable proof-of-sale.

Required deps already installed: `nostr-tools`.

Suggested helper to add to `lib/nostr.ts`:

```ts
import { SimplePool } from "nostr-tools";

const RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];

export async function publishInvoiceEvent(invoice: {
  id: number | string;
  customer: string;
  amount_ngn: number;
  status: string;
}) {
  if (typeof window === "undefined" || !window.nostr) return null;

  const event = {
    kind: 31111,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["d", `ownstack-inv-${invoice.id}`],
      ["amount_ngn", String(invoice.amount_ngn)],
      ["customer", invoice.customer],
      ["status", invoice.status],
      ["payment_rail", "bitnob_nuban"],
    ],
    content: `Receipt: ${invoice.status} payment of NGN ${invoice.amount_ngn} from ${invoice.customer}.`,
    pubkey: localStorage.getItem("nostr_pubkey") || "",
  };

  const signed = await window.nostr.signEvent(event);
  const pool = new SimplePool();
  await Promise.any(pool.publish(RELAYS, signed));
  pool.close(RELAYS);
  return signed.id;
}
```

Then after the Realtime update sets a row to Paid, call
`publishInvoiceEvent(invoice)` and (optionally) write the returned id
back to `invoices.nostr_event_id` via a Supabase update.

### 3.8 Restore-from-Nostr on login  *(critical for the pitch)*
After Nostr login succeeds in `app/login/page.tsx`, query the same
relays for the user's past Kind 31111 events and rebuild
`localStorage["invoices_${pubkey}"]` from them.

```ts
import { SimplePool } from "nostr-tools";

const RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];

async function restoreLedgerFromNostr(pubkey: string) {
  const pool = new SimplePool();
  const events = await pool.list(RELAYS, [{ kinds: [31111], authors: [pubkey] }]);
  const invoices = events.map((e) => {
    const tag = (k: string) => e.tags.find((t) => t[0] === k)?.[1];
    return {
      id: tag("d"),
      customer: tag("customer"),
      amount_ngn: Number(tag("amount_ngn") || 0),
      status: tag("status") || "Paid",
      created_at: new Date(e.created_at * 1000).toISOString(),
    };
  });
  localStorage.setItem(`invoices_${pubkey}`, JSON.stringify(invoices));
  pool.close(RELAYS);
}
```

Then redirect to `/dashboard`. This gives us the third demo beat:
"wipe browser, log in on new machine, ledger rebuilds from public
relays."

### 3.9 Cleanup
1. `lib/types.ts` — add the new optional fields to the `Invoice`
   interface (`amount_ngn`, `virtual_account_number`,
   `virtual_account_bank`, `virtual_account_name`, `tx_type`,
   `nostr_event_id`, `paid_at`).
2. `components/Navbar.tsx` line 61 — links to `/sign-in` which doesn't
   exist. Should be `/login`.
3. `app/invoice/page.tsx` and `app/profile/page.tsx` — wrap in
   `ProtectedRoute`. They aren't today.

---

## 4. Out of scope for the hackathon demo

Do **not** spend time on these:

- Breez SDK / browser-side self-custodial wallet (PRD §3, §4.3)
- PIN-encrypted vault + phone OTP restoration (PRD §5) — Nostr key
  replaces this
- Naira out-ramp / withdrawals (PRD §4.3)
- Credit-score export feature
- Localised analytics dashboard

---

## 5. Three-step demo script (for handover alignment)

1. **Initiation** — log in as a merchant, create an invoice for
   ₦25,000, copy the link, paste into a "WhatsApp" tab.
2. **Payment** — open the link in another window, click "Simulate
   Payment" (or, with a real Bitnob webhook, transfer from a sandbox
   bank app). The merchant's dashboard flips live to Paid.
3. **Restoration** — clear localStorage and Supabase session, click
   "Login with Nostr" on the new window, watch the ledger rebuild
   itself from public relays.

If step 3 works end-to-end, you've proven self-sovereign
bookkeeping in under 60 seconds.

---

## 6. Where to ask questions

- Backend behaviour or shape of any API response: see
  `backend/README.md` or read the source — `backend/app/main.py`
  has all four endpoints inline with docstrings.
- Schema details: `backend/migrations/001_ownstack_schema.sql`.
- Pitch / product flow: `README.md` (root) and the OwnStack section of
  `PRD.md`.
