export async function requestWebLNPayment(invoice: string) {
  if (typeof window === "undefined" || !window.webln) {
    throw new Error("WebLN provider not found. Please install Alby.");
  }

  await window.webln.enable();
  return await window.webln.sendPayment(invoice);
}

export async function getLightningInvoice(lightningAddress: string, amountSats: number) {
  try {
    // Basic validation
    if (!lightningAddress || !lightningAddress.includes("@")) {
        throw new Error("Invalid Lightning Address format. Please use 'user@domain.com'.");
    }

    const [username, domain] = lightningAddress.split("@");
    if (!username || !domain) throw new Error("Invalid Lightning Address parts");

    const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${username}`;
    const lnurlResponse = await fetch(lnurlpUrl);
    
    if (!lnurlResponse.ok) {
        throw new Error(`LNURL provider returned status ${lnurlResponse.status}`);
    }

    const contentType = lnurlResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        throw new Error("LNURL provider did not return JSON. Is the address correct?");
    }

    const lnurlData = await lnurlResponse.json();

    if (!lnurlData.callback) throw new Error("LNURL callback not found");

    const amountMsats = amountSats * 1000;
    const separator = lnurlData.callback.includes("?") ? "&" : "?";
    const invoiceResponse = await fetch(
      `${lnurlData.callback}${separator}amount=${amountMsats}`
    );
    
    if (!invoiceResponse.ok) {
        throw new Error("Failed to fetch BOLT11 invoice from callback");
    }

    const invoiceData = await invoiceResponse.json();
    return invoiceData.pr; // Payment Request (BOLT11)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Lightning invoice error";
    console.warn("Lightning Invoice Error:", message);
    throw error;
  }
}

declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(invoice: string): Promise<{ preimage: string }>;
      makeInvoice(args: Record<string, unknown>): Promise<{ paymentHash: string; paymentRequest: string }>;
    };
  }
}
