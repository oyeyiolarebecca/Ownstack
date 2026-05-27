# Comprehensive Product Requirements Document (PRD) & Technical Specification

## Product Name: OwnStack

**Tagline:** _Your Business Identity, Your Sovereign Ledger._ **Context:** Developed for the Bitcoin Hackathon 2026.

---

## 0. v1 MVP Adjustments (Hackathon Build)

The body of this PRD below describes the **long-term product vision**. The
hackathon build implements a disciplined subset of it. This section is the
single source of truth for what is actually shipping in the 48-hour MVP.

### 0.1 Stack changes (vision → MVP)

| Concern               | PRD vision                              | MVP reality                               | Why                                                                                                                                                                                 |
| --------------------- | --------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naira payment rail    | Mavapay API                             | **Bitnob API**                            | Bitnob sandbox access secured; first-class Nigerian virtual NUBAN + Lightning support in one provider.                                                                              |
| Self-custodial wallet | Breez SDK (WASM, in-browser)            | **Bitnob-held balance**                   | Breez SDK WASM integration is multi-day work. Deferred to v2.                                                                                                                       |
| Backend cache DB      | FastAPI + PostgreSQL (self-hosted)      | **FastAPI + Supabase** (managed Postgres) | Supabase gives us Postgres, auth, storage, and Realtime push out of the box. Frontend talks to Supabase directly for reads; FastAPI is a thin bridge for Bitnob calls and webhooks. |
| Key restoration       | Phone + PIN + encrypted vault on server | **Nostr browser extension key (NIP-07)**  | Nostr key IS the identity. Simpler, more sovereign, and eliminates a server-side encrypted-blob storage requirement.                                                                |

### 0.2 Features in scope for v1

- Merchant signup / login (Supabase email-password **and** Nostr NIP-07).
- Create invoice in NGN.
- Auto-provision a virtual Naira bank account (NUBAN) per invoice via Bitnob.
- Customer-facing payment page shows NUBAN, bank name, NGN amount, copy button.
- Bitnob webhook flips invoice to `Paid`; Supabase Realtime pushes the change to the merchant's dashboard live.
- Demo-only `/webhooks/bitnob/simulate` endpoint to flip an invoice to Paid without a real bank transfer (so the demo works without ngrok + sandbox bank).
- Sign every Paid invoice as a **Nostr Kind 31111** event and broadcast to public relays.
- Restore-from-Nostr: log in on a new browser with the Nostr key, ledger rebuilds from relays.
- Dashboard, history, profile, settings, mobile-responsive layout (already built by frontend team).

### 0.3 Features explicitly deferred to v2

- Browser self-custodial wallet via Breez SDK.
- Phone + PIN-encrypted vault and SMS OTP restoration (replaced by Nostr key).
- Naira out-ramp / withdrawals to merchant bank account.
- Credit-score export / microloan integrations.
- Localized analytics dashboard.
- Native mobile app.

### 0.4 v1 demo flow (replaces §7.1 below)

1. **Initiation** — merchant logs in, creates an invoice for ₦25,000 to "Mama Tunde", copies the customer-facing link.
2. **Payment** — open the link in a second window (representing the customer); click "Simulate Payment". The merchant's dashboard updates to Paid in real time via Supabase Realtime.
3. **Restoration** — clear the browser session, click "Login with Nostr" on a fresh window. The dashboard's ledger rebuilds from public Nostr relays.

### 0.5 v1 pitch soundbite (replaces §7.2 below)

> _"38 million informal merchants in Nigeria drive their businesses through WhatsApp and bank transfers, but their bookkeeping disappears the moment a phone breaks or a social account is flagged. OwnStack turns every Naira bank transfer into an automatic, un-wipeable Bitcoin-backed business ledger. The customer does what they already do — a normal bank transfer. The merchant gets a sovereign ledger, signed to Nostr and recoverable on any device. No crypto wallets. No QR codes. No platform that can take their history away."_

### 0.6 Live system layout (replaces §3 diagram below)

```
  [Customer Bank App] ──(Naira Bank Transfer)──> [Bitnob API]
                                                       │
                                       (Converts NGN → BTC sats)
                                                       │
                                                       ▼
  [Next.js + Tailwind UI] <──(Realtime)── [Supabase Postgres] <── [FastAPI Bridge]
            │                                                              ▲
   (Signs Kind 31111)                                                      │
            │                                                  (Bitnob webhook on payment)
            ▼
   [Nostr Relay Network]
  (Decentralized backup)
```

### 0.7 Updated Nostr event tag

The `payment_rail` tag in §6.2 should be `"bitnob_nuban"` (not `"mavapay_nuban_bridge"`) in v1.

### 0.8 Actual database schema

See `backend/migrations/001_ownstack_schema.sql`. It uses two tables:

- `profiles` — keyed by `auth.users.id`; holds `full_name`, `business_name`, `category`, `lightning_username`, `avatar_url`, `merchant_phone`, `nostr_pubkey`.
- `invoices` — extended from the original frontend schema with `user_id`, `amount_ngn`, `satoshis_equivalent`, `virtual_account_number`, `virtual_account_bank`, `virtual_account_name`, `bitnob_reference`, `tx_type`, `nostr_event_id`, `paid_at`.

Row Level Security is on. Merchants can only access their own rows; the public `/invoice/[id]` page works via a single anon SELECT policy.

---

## 1. Executive Summary

OwnStack is a Bitcoin-native, self-sovereign business infrastructure platform designed for informal African entrepreneurs (e.g., fashion designers, market traders, Instagram/WhatsApp vendors) who run operations directly off mobile devices.

By layering **Breez SDK**, the **Nostr protocol**, and the **Mavapay API**, OwnStack eliminates traditional Web3 user experience bottlenecks—such as seed phrase management, complex crypto onboarding, and unfamiliar QR codes. It introduces a friction-free experience: **the customer pays via a standard Naira bank transfer, while the merchant automatically builds a secure, decentralized, un-wipeable business ledger and a self-custodial Bitcoin balance in the background.**

---

## 2. Core Problem & Target Persona Validation

### 2.1. Target User Persona

- **Name:** Zara, an informal custom fashion vendor in Lagos.
- **Channels:** Uses Instagram for marketing, WhatsApp for client communication, and local bank transfers for payments.
- **Workflow:** Manually records order updates, manages customer delivery details, and calculates who owes her money using paper books, chat messages, and phone screenshots.

### 2.2. The Pain Points Addressed

| Problem Space                | The Real-World Impact                                                                                           | OwnStack's Fix                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Data Fragility**           | Lost, stolen, or damaged phones mean losing years of client lists and debt ledgers.                             | Decentralized cloud backup powered by standard **Nostr relays**.                                 |
| **Platform Lock-in**         | Random Meta account flags or bans strip away a vendor's entire business history overnight.                      | Open protocol data architecture; data is decoupled from messaging apps.                          |
| **The "Laziness" Barrier**   | Busy merchants don't have time to manually input complex inventory or sales lines while running active shops.   | **Passive Bookkeeping:** The incoming bank transaction automatically generates the ledger entry. |
| **The Crypto Friction Trap** | Local buyers refuse to download crypto wallets or scan Bitcoin QR codes.                                        | Pure Web2 external layer—buyers use standard NUBAN bank apps.                                    |
| **Credit Invisibility**      | Operating via unorganized, fragmented systems leaves merchants with no verifiable records to secure microloans. | A tamper-proof, exportable financial ledger stamped by a cryptographic key.                      |

---

## 3. High-Level System Architecture

OwnStack coordinates four layers to achieve self-sovereign data backup, instant cross-rail settlement, and high-performance Web2 dashboard updates:

```
  [Customer Bank App] ──(Naira Bank Transfer)──> [Mavapay API Gateway]
                                                           │
                                             (Automated Swap to Lightning Sats)
                                                           │
                                                           ▼
  [Next.js + Tailwind UI] <──(Live Updates)── [FastAPI Webhook Handler]
            │                                              │
     (Decrypted via PIN)                           (Pushes Event Data)
            │                                              │
            ▼                                              ▼
    [Breez SDK (WASM)]                             [Nostr Relay Network]
(Non-Custodial Wallet Engine)                   (Decentralized Data Backup)

```

### 3.1. Infrastructure Component Roles

- **Frontend Client (Next.js 14+ / Tailwind CSS / Framer Motion):** Provides a high-fidelity dashboard completely denominated in Naira (NGN). It initializes the Breez SDK on the client via WebAssembly.
- **Backend Caching Layer (FastAPI + PostgreSQL):** Receives banking webhooks, keeps user profiles indexed for quick searching, and serves localized analytics.
- **Payment Rail (Mavapay API):** Dynamically allocates virtual Nigerian bank account numbers (NUBAN) mapped to specific business transactions. Converts incoming local bank transfers into Bitcoin Satoshis on the fly.
- **Wallet Rail (Breez SDK - Spark or Liquid):** Operates securely within the client-side browser context via WebAssembly. Receives the incoming Lightning Satoshis streamed by Mavapay, providing the merchant with a self-custodial asset base.
- **Identity & Storage Rail (Nostr Protocol):** Serves as an un-wipeable, global data storage system. Every record logged is formatted as a custom Nostr event, signed by the merchant’s background key, and pushed to open relays.

---

## 4. Operational Workflows & System Logic

### 4.1. Core Automation Flow: Pay-to-Record

```
Step 1: Merchant creates a dynamic Bill inside the app (e.g., ₦20,000 for "Mama Tunde").
Step 2: App generates a unique web link and formats an automated WhatsApp message prompt.
Step 3: Customer opens the link, views the total in NGN, and copies a dedicated Virtual Account Number.
Step 4: Customer completes a standard transfer from their banking app (e.g., GTBank to Wema Bank).
Step 5: Mavapay detects settlement, converts the NGN value to Satoshis, and forwards it to the Breez SDK.
Step 6: Mavapay triggers a payment success webhook to the FastAPI backend.
Step 7: FastAPI processes the metadata, updates PostgreSQL from UNPAID to PAID, and notifies the client.
Step 8: Client app signs the completed record and broadcasts it to the Nostr Relay network.

```

### 4.2. Debt Logging Flow ("Money Outside")

To capture sales made on credit without manual friction:

1. The merchant selects **"Record Debt"**, inputs the customer name/phone, and types the Naira amount.
2. The FastAPI backend flags the database row as `status: UNPAID` and `type: DEBT`.
3. A unique tracking account number is assigned via Mavapay.
4. The merchant forwards a payment link to the client via WhatsApp. When the client transfers funds to that dedicated account number at a later date, the webhook triggers, automatically updating the row status to `PAID` across the database and Nostr storage.

### 4.3. The Naira Out-Ramp Flow (Withdrawal)

When the merchant needs to move funds out of the app and into their personal checking bank account:

1. The merchant enters a withdrawal amount in Naira and selects their primary local bank profile (e.g., _Access Bank - 0011223344_).
2. The FastAPI backend submits a payout request to the **Mavapay/Bitnob Payout API**, which generates an internal Lightning invoice.
3. The embedded client-side **Breez SDK** executes a payment to that Lightning invoice using the merchant's accumulated balances.
4. Upon receiving the Lightning Satoshis, Mavapay settles the corresponding local fiat currency into the merchant's primary bank account via a standard local interbank clearing network.

---

## 5. Seedless Key Management Strategy (The Hybrid PIN Backup)

To protect informal merchants from permanently losing their capital or business data if they misplace a 12-word phrase or private text key, OwnStack uses a **PIN-Encrypted Hybrid Storage** methodology:

```
[Sign Up] ──> Merchant provides Phone Number + 4-Digit Security PIN
                    │
                    ▼
      [Frontend generates random Nostr Keypair and Breez Mnemonic]
                    │
                    ▼
      [Frontend encrypts these Keys locally using the 4-Digit PIN]
                    │
                    ▼
      [Saves only the ENCRYPTED string blob to FastAPI / PostgreSQL]

```

### 5.1. The Device Restoration Flow

If a merchant's device drops in a market gutter, they can restore their business profile seamlessly on a new phone:

1. The merchant enters their phone number on the new device.
2. The FastAPI backend transmits a standard OTP code via SMS to confirm ownership of the number.
3. Once validated, the server downloads the _encrypted_ cryptographic key blob to the device's temporary local storage. **(The server cannot read this blob; it does not know the PIN).**
4. The application prompts the merchant: _"Enter your 4-digit PIN."_
5. The frontend decrypts the blob locally, unlocks the background Nostr identity and Breez wallet instance, queries the open relays, and instantly populates the complete ledger history back on screen.

---

## 6. Technical Specifications & Data Mapping

### 6.1. Local Database Caching Layer Schema (PostgreSQL)

While long-term backup stability is guaranteed by Nostr, the FastAPI layer maintains a fast local cache database to load the mobile UI instantly.

```sql
CREATE TABLE merchants (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    encrypted_vault TEXT NOT NULL, -- Encrypted Nostr/Breez private data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id INT REFERENCES merchants(id),
    customer_name VARCHAR(100) NOT NULL,
    amount_ngn NUMERIC(12, 2) NOT NULL,
    satoshis_equivalent INT NOT NULL,
    virtual_account_allocated VARCHAR(20),
    tx_type VARCHAR(20) CHECK (tx_type IN ('INCOME', 'DEBT', 'WITHDRAWAL')),
    status VARCHAR(20) CHECK (status IN ('PENDING', 'PAID', 'UNPAID')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

```

### 6.2. Decentralized Vault Schema (Nostr Custom Event Mapping)

Every transaction event maps directly into a standard Nostr structure using a custom Parameterized Replaceable Event framework (**Kind 31111**), preventing centralized platforms from blocking access to merchant records.

```json
{
  "id": "calculated_event_hash",
  "pubkey": "merchant_nostr_public_key",
  "created_at": 1779676800,
  "kind": 31111,
  "tags": [
    ["d", "tx_unique_uuid_12345"],
    ["amount_ngn", "20000"],
    ["customer", "Mama Tunde"],
    ["status", "PAID"],
    ["payment_rail", "mavapay_nuban_bridge"]
  ],
  "content": "Automated receipt log: Received payment of ₦20,000 from Mama Tunde.",
  "sig": "cryptographic_signature_from_merchant_private_key"
}
```

---

## 7. Hackathon Demo Presentation Matrix

To capture maximum execution marks from the judges, structure your pitch and technical presentation to prove how these protocols function in tandem.

### 7.1. Three-Step Demo Sequence

```
  ┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
  │      1. THE INITIATION    │      │       2. THE PAYMENT      │      │     3. THE RESTORATION    │
  ├───────────────────────────┤      ├───────────────────────────┤      ├───────────────────────────┤
  │ Action: Log an un-typed   │      │ Action: Simulate standard │      │ Action: Wipe the browser, │
  │ bill for ₦25,000 directly │ ───> │ bank transfer to the NUBAN│ ───> │ enter phone number + PIN  │
  │ via a friction-free link  │      │ account details on-screen.│      │ on an entirely new window.│
  │ sent to a WhatsApp chat.  │      │ Result: UI flips live via │      │ Result: Nostr pulls files │
  │                           │      │ webhook automation events.│      │ and rebuilds the ledger.  │
  └───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘

```

### 7.2. Core Pitch Soundbite for the Team

> _"Judges, there are over 38 million informal merchants in Nigeria who drive local commerce directly inside WhatsApp. However, they remain financially invisible because their bookkeeping is trapped inside paper notebooks or volatile text threads that disappear when a phone is lost or an account is flagged._
> _We built OwnStack to turn the massive momentum of Nigeria's instant bank transfer economy into an automated, un-wipeable ledger. By processing traditional bank transfers into self-custodial Bitcoin value under the hood via Mavapay and Breez, and logging proofs directly to the open Nostr protocol, we give these millions of micro-entrepreneurs complete data sovereignty—without forcing them to change a single thing about how they do business today."_
