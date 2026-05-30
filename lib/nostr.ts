import { nip19, SimplePool } from "nostr-tools";

const RELAYS = ["wss://relay.damus.io", "wss://nos.lol"];

export async function getNostrIdentity() {
  if (typeof window === "undefined" || !window.nostr) {
    throw new Error("Nostr extension not found.");
  }
  const pubkey = await window.nostr.getPublicKey();
  const npub = nip19.npubEncode(pubkey);
  return { pubkey, npub };
}

export async function loginWithNostr() {
  if (typeof window === "undefined" || !window.nostr) {
    throw new Error(
      "Nostr extension not found. Please install Alby or nos2x."
    );
  }

  try {
    const { pubkey, npub } = await getNostrIdentity();

    // Store in localStorage for session persistence
    localStorage.setItem("nostr_pubkey", pubkey);
    localStorage.setItem("nostr_npub", npub);

    return { pubkey, npub };
  } catch (error) {
    console.error("Nostr login failed:", error);
    throw error;
  }
}

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

  const signed = (await window.nostr.signEvent(event)) as { id: string };
  const pool = new SimplePool();
  try {
    await Promise.any(pool.publish(RELAYS, signed as any));
  } catch (err) {
    console.warn("Failed to publish to relays:", err);
  } finally {
    pool.close(RELAYS);
  }
  return signed.id;
}

export async function restoreLedgerFromNostr(pubkey: string) {
  const pool = new SimplePool();
  try {
    const events = await pool.querySync(RELAYS, { kinds: [31111], authors: [pubkey] });
    const invoices = events.map((e: any) => {
      const tag = (k: string) => e.tags.find((t: string[]) => t[0] === k)?.[1];
      return {
        id: Number(tag("d")?.replace("ownstack-inv-", "") || Date.now()),
        customer: tag("customer") || "Unknown",
        amount: Number(tag("amount_ngn") || 0),
        amount_ngn: Number(tag("amount_ngn") || 0),
        status: tag("status") || "Paid",
        created_at: new Date(e.created_at * 1000).toISOString(),
      };
    });
    localStorage.setItem(`invoices_${pubkey}`, JSON.stringify(invoices));
    return invoices;
  } finally {
    pool.close(RELAYS);
  }
}

export function getStoredNostrUser() {
  if (typeof window === "undefined") return null;
  const pubkey = localStorage.getItem("nostr_pubkey");
  const npub = localStorage.getItem("nostr_npub");
  if (pubkey && npub) {
    return { pubkey, npub };
  }
  return null;
}

export function logoutNostr() {
  localStorage.removeItem("nostr_pubkey");
  localStorage.removeItem("nostr_npub");
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>;
      signEvent(event: Record<string, unknown>): Promise<Record<string, unknown>>;
    };
  }
}
