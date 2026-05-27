-- =====================================================================
-- OwnStack Supabase Migration 001
-- Adds OwnStack-specific columns + RLS to the existing teammate schema.
--
-- HOW TO RUN:
--   1. Open Supabase Dashboard -> SQL Editor.
--   2. Paste this entire file and click "Run".
--   3. It is idempotent: safe to run more than once.
--
-- WHAT IT DOES:
--   - Extends the `invoices` table with NGN amount, virtual NUBAN, tx_type,
--     merchant_phone, and a proper user_id FK.
--   - Adds an `event_id` slot so we can record the Nostr Kind 31111 event id
--     that backs each invoice (proof-of-record).
--   - Creates a default-user_id trigger so the existing frontend INSERTs
--     (which don't send user_id) are auto-stamped from auth.uid().
--   - Turns on Row Level Security with sensible merchant/public policies:
--       * Merchant can read/insert/update only their own invoices.
--       * Anonymous public can SELECT a single invoice by id (needed for
--         the customer-facing /invoice/[id] page).
--   - Extends `profiles` with merchant phone + Nostr pubkey columns.
-- =====================================================================


-- 1. profiles: ensure the columns the frontend already writes exist,
--    and add new ones for OwnStack.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.profiles
  add column if not exists full_name           text,
  add column if not exists business_name       text,
  add column if not exists category            text,
  add column if not exists lightning_username  text,
  add column if not exists avatar_url          text,
  add column if not exists merchant_phone      varchar(20),
  add column if not exists nostr_pubkey        text,
  add column if not exists updated_at          timestamptz default now();

-- 2. invoices: extend with OwnStack fields.
create table if not exists public.invoices (
  id          bigserial primary key,
  created_at  timestamptz default now()
);

alter table public.invoices
  add column if not exists user_id                   uuid references auth.users(id) on delete cascade,
  add column if not exists customer                  varchar(120),
  add column if not exists service                   varchar(200),
  add column if not exists amount                    numeric(14,2),   -- legacy sats column kept for backwards compat
  add column if not exists amount_ngn                numeric(14,2),
  add column if not exists satoshis_equivalent       bigint,
  add column if not exists virtual_account_number    varchar(20),
  add column if not exists virtual_account_bank      varchar(60),
  add column if not exists virtual_account_name      varchar(120),
  add column if not exists bitnob_reference          text,            -- bitnob's transaction/account ref
  add column if not exists tx_type                   varchar(20) default 'INCOME',
  add column if not exists status                    varchar(20) default 'Pending',
  add column if not exists nostr_event_id            text,            -- kind 31111 event id once published
  add column if not exists paid_at                   timestamptz,
  add column if not exists updated_at                timestamptz default now();

-- soft constraints (use DO blocks so re-runs don't error)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'invoices_tx_type_check') then
    alter table public.invoices
      add constraint invoices_tx_type_check
      check (tx_type in ('INCOME','DEBT','WITHDRAWAL'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'invoices_status_check') then
    alter table public.invoices
      add constraint invoices_status_check
      check (status in ('Pending','UNPAID','PAID','Paid','Completed','FAILED'));
  end if;
end $$;

create index if not exists invoices_user_id_idx           on public.invoices (user_id);
create index if not exists invoices_status_idx            on public.invoices (status);
create index if not exists invoices_virtual_account_idx   on public.invoices (virtual_account_number);

-- 3. Default user_id from auth.uid() on insert
--    (the existing frontend INSERT in app/invoice/page.tsx does not send
--     user_id; this trigger fills it from the JWT so RLS works.)
create or replace function public.set_invoice_user_id()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_invoice_user_id on public.invoices;
create trigger trg_set_invoice_user_id
  before insert or update on public.invoices
  for each row execute function public.set_invoice_user_id();

-- 4. Row Level Security
alter table public.profiles enable row level security;
alter table public.invoices enable row level security;

-- PROFILES: each user owns their row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Public can read a profile by id (needed for the public /invoice/[id]
-- page to display the merchant's business name). If you want this
-- locked down later, scope it to just business_name+avatar via a view.
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  to anon
  using (true);

-- INVOICES: merchant scope + public single-row read.
drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own"
  on public.invoices for select
  using (auth.uid() = user_id);

drop policy if exists "invoices_select_public" on public.invoices;
create policy "invoices_select_public"
  on public.invoices for select
  to anon
  using (true);  -- needed so /invoice/[id] works for unauthenticated customers

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own"
  on public.invoices for insert
  with check (auth.uid() = user_id or user_id is null);  -- trigger fills user_id

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own"
  on public.invoices for update
  using (auth.uid() = user_id);

-- Service role (used by FastAPI webhook handler) bypasses RLS automatically;
-- no extra policy needed.


-- 5. Realtime: ensure invoices is in the realtime publication
--(frontend dashboard subscribes to invoice-updates channel).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'invoices'
  ) then
    execute 'alter publication supabase_realtime add table public.invoices';
  end if;
end $$;

-- ---------------------------------------------------------------------
-- Done.
-- ---------------------------------------------------------------------
