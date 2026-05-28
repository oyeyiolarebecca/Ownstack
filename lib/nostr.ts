import { nip19 } from "nostr-tools";

export async function loginWithNostr() {
  if (typeof window === "undefined" || !window.nostr) {
    throw new Error(
      "Nostr extension not found. Please install Alby or nos2x."
    );
  }

  try {
    const pubkey = await window.nostr.getPublicKey();
    const npub = nip19.npubEncode(pubkey);
    
    // Store in localStorage for session persistence
    localStorage.setItem("nostr_pubkey", pubkey);
    localStorage.setItem("nostr_npub", npub);
    
    return { pubkey, npub };
  } catch (error) {
    console.error("Nostr login failed:", error);
    throw error;
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
