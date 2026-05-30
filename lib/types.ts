export interface BusinessProfile {
  full_name: string;
  business_name: string;
  category: string;
  lightning_username: string;
  avatar_url: string;
  bio?: string;
  nostr_npub?: string;
}

export type LocalCurrency = "NGN" | "KES" | "GHS" | "ZAR" | "USD";
export type PaymentMethod = "cash" | "bank_transfer" | "mobile_money" | "lightning";

export interface Invoice {
  id: number | string;
  customer: string;
  service: string;
  amount: number | string;
  status: string;
  local_amount?: number | string;
  currency?: LocalCurrency | string;
  sats_amount?: number | string;
  payment_method?: PaymentMethod | string;
  due_date?: string;
  created_at?: string;
  user_id?: string;
  owner_pubkey?: string;
  lightning_address?: string;
  profile?: BusinessProfile;
  amount_ngn?: number;
  virtual_account_number?: string;
  virtual_account_bank?: string;
  virtual_account_name?: string;
  bitnob_reference?: string;
  tx_type?: string;
  nostr_event_id?: string;
  paid_at?: string;
}

export type VaultDocumentType = "receipt" | "invoice" | "permit" | "contract" | "other";

export interface VaultDocument {
  id: number;
  user_id?: string;
  owner_pubkey?: string;
  title: string;
  document_type: VaultDocumentType | string;
  file_name?: string;
  file_path?: string;
  file_url?: string;
  note?: string;
  amount?: number | string;
  currency?: LocalCurrency | string;
  created_at?: string;
  updated_at?: string;
}

export interface NostrUser {
  pubkey: string;
  npub: string;
}
