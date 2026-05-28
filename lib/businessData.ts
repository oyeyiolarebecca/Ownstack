import { BusinessProfile, Invoice, NostrUser, VaultDocument } from "@/lib/types";

export const emptyProfile: BusinessProfile = {
  full_name: "",
  business_name: "",
  category: "",
  lightning_username: "",
  avatar_url: "",
  bio: "",
  nostr_npub: "",
};

export function defaultNostrProfile(nostrUser: NostrUser): BusinessProfile {
  return {
    full_name: "Nostr User",
    business_name: "My Bitcoin Business",
    category: "Merchant",
    lightning_username: "user@getalby.com",
    avatar_url: "",
    bio: "Portable business identity powered by Bitcoin and Nostr.",
    nostr_npub: nostrUser.npub,
  };
}

export function normalizeProfile(profile?: Partial<BusinessProfile> | null): BusinessProfile {
  return {
    ...emptyProfile,
    ...(profile || {}),
  };
}


export const currencyOptions = [
  { code: "NGN", label: "Nigerian naira", symbol: "₦", satsPerUnit: 0.59 },
  { code: "KES", label: "Kenyan shilling", symbol: "KSh", satsPerUnit: 7.4 },
  { code: "GHS", label: "Ghanaian cedi", symbol: "GH₵", satsPerUnit: 63 },
  { code: "ZAR", label: "South African rand", symbol: "R", satsPerUnit: 52 },
  { code: "USD", label: "US dollar", symbol: "$", satsPerUnit: 950 },
] as const;

export const paymentMethodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
  lightning: "Lightning",
};

export function getCurrencyMeta(currency = "NGN") {
  return currencyOptions.find((item) => item.code === currency) || currencyOptions[0];
}

export function localToSats(localAmount: number | string, currency = "NGN") {
  const amount = Number(localAmount || 0);
  const meta = getCurrencyMeta(currency);
  return Math.max(1, Math.round(amount * meta.satsPerUnit));
}

export function formatLocalAmount(amount?: number | string, currency = "NGN") {
  const numericAmount = Number(amount || 0);
  const meta = getCurrencyMeta(currency);
  return `${meta.symbol}${numericAmount.toLocaleString()}`;
}

export function getInvoiceLocalAmount(invoice: Invoice) {
  return Number(invoice.local_amount ?? invoice.amount ?? 0);
}

export function getInvoiceSats(invoice: Invoice) {
  return Number(invoice.sats_amount ?? invoice.amount ?? 0);
}

export function isPaidStatus(status?: string) {
  return status === "Paid" || status === "Completed";
}

export function getInvoiceProofId(id?: string | number) {
  if (!id) return "OS-PENDING";
  const cleanId = String(id).replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `OS-${cleanId.padStart(6, "0")}`;
}

export function invoiceStorageKey(pubkey: string) {
  return `invoices_${pubkey}`;
}

export function vaultStorageKey(pubkey: string) {
  return `vault_${pubkey}`;
}

export function loadLocalVaultDocuments(pubkey: string): VaultDocument[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(vaultStorageKey(pubkey)) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalVaultDocuments(pubkey: string, documents: VaultDocument[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(vaultStorageKey(pubkey), JSON.stringify(documents));
}

export function publicInvoiceStorageKey(id: string | number) {
  return `public_invoice_${id}`;
}

export function loadLocalInvoices(pubkey: string): Invoice[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(invoiceStorageKey(pubkey)) || "[]");
  } catch {
    return [];
  }
}

export function saveLocalInvoices(pubkey: string, invoices: Invoice[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(invoiceStorageKey(pubkey), JSON.stringify(invoices));
}

export function savePublicInvoice(invoice: Invoice) {
  if (typeof window === "undefined") return;
  localStorage.setItem(publicInvoiceStorageKey(invoice.id), JSON.stringify(invoice));
}

export function findLocalInvoiceById(id: string | number): Invoice | null {
  if (typeof window === "undefined") return null;
  const invoiceId = String(id);

  const direct = localStorage.getItem(publicInvoiceStorageKey(invoiceId));
  if (direct) {
    try {
      return JSON.parse(direct);
    } catch {
      return null;
    }
  }

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("invoices_")) continue;

    try {
      const invoices = JSON.parse(localStorage.getItem(key) || "[]") as Invoice[];
      const match = invoices.find((invoice) => String(invoice.id) === invoiceId);
      if (match) return match;
    } catch {
      continue;
    }
  }

  return null;
}

export function updateLocalInvoiceStatus(id: string | number, status: string) {
  if (typeof window === "undefined") return null;
  const invoiceId = String(id);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("invoices_")) continue;

    try {
      const invoices = JSON.parse(localStorage.getItem(key) || "[]") as Invoice[];
      let changed = false;
      const updated = invoices.map((invoice) => {
        if (String(invoice.id) !== invoiceId) return invoice;
        changed = true;
        return { ...invoice, status };
      });

      if (changed) {
        localStorage.setItem(key, JSON.stringify(updated));
        const invoice = updated.find((item) => String(item.id) === invoiceId) || null;
        if (invoice) savePublicInvoice(invoice);
        return invoice;
      }
    } catch {
      continue;
    }
  }

  const publicInvoice = findLocalInvoiceById(invoiceId);
  if (!publicInvoice) return null;
  const updatedInvoice = { ...publicInvoice, status };
  savePublicInvoice(updatedInvoice);
  return updatedInvoice;
}
