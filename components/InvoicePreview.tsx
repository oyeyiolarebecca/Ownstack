"use client";

import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { getLightningInvoice, requestWebLNPayment } from "@/lib/lightning";
import { formatLocalAmount, isPaidStatus, paymentMethodLabels } from "@/lib/businessData";

interface InvoicePreviewProps {
  invoiceData: {
    customer: string;
    service: string;
    amount: string;
    localAmount?: string | number;
    currency?: string;
    paymentMethod?: string;
    virtualAccountNumber?: string;
    virtualAccountBank?: string;
    virtualAccountName?: string;
  };
  lightningAddress?: string;
  status?: string;
  onSettled?: () => void;
}

export default function InvoicePreview({
  invoiceData,
  lightningAddress = "ownstack@getalby.com",
  status,
  onSettled,
}: InvoicePreviewProps) {
  const [paymentRequest, setPaymentRequest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocallySettled, setIsLocallySettled] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const settled = isPaidStatus(status) || isLocallySettled;

  useEffect(() => {
    let cancelled = false;

    async function fetchInvoice() {
      if (!invoiceData.amount || Number(invoiceData.amount) <= 0) {
        setPaymentRequest("");
        return;
      }

      setIsLoading(true);
      setPaymentError(null);

      try {
        const pr = await getLightningInvoice(lightningAddress, Number(invoiceData.amount));
        if (!cancelled) {
          setPaymentRequest(pr);
          setIsLocallySettled(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not generate Lightning invoice";
        if (!cancelled) {
          setPaymentRequest("");
          setPaymentError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchInvoice();

    return () => {
      cancelled = true;
    };
  }, [invoiceData.amount, lightningAddress]);

  async function payWithWebLN() {
    if (!paymentRequest) return;

    try {
      setPaymentError(null);
      await requestWebLNPayment(paymentRequest);
      setIsLocallySettled(true);
      onSettled?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment was not completed";
      setPaymentError(message);
    }
  }

  async function simulateSettlement() {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const invoiceId = (invoiceData as any).id || (invoiceData as any).invoice_id;

    if (API && invoiceId) {
      try {
        await fetch(`${API}/webhooks/bitnob/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice_id: Number(invoiceId) }),
        });
      } catch (err) {
        console.error("Simulation call failed:", err);
      }
    }
    
    setIsLocallySettled(true);
    onSettled?.();
  }

  const qrValue = paymentRequest ? `lightning:${paymentRequest}` : `lightning:demo-${invoiceData.customer}-${invoiceData.amount}`;
  const localAmount = formatLocalAmount(invoiceData.localAmount ?? invoiceData.amount, invoiceData.currency);
  const paymentMethod = paymentMethodLabels[invoiceData.paymentMethod || "lightning"] || "Flexible Payment";

  return (
    <div className="bg-gradient-to-br from-white to-lime-50 border border-gray-200 rounded-3xl p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 font-medium">Invoice Preview</p>
          <h2 className="text-4xl font-bold text-[#0F172A] mt-3">
            {localAmount}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
            ≈ {Number(invoiceData.amount || 0).toLocaleString()} sats
          </p>
        </div>

        <div className={`px-4 py-2 rounded-full text-sm font-medium ${settled ? "bg-lime-100 text-lime-700" : "bg-yellow-100 text-yellow-700"}`}>
          {settled ? "Paid" : "Pending"}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center mt-10 relative min-h-[300px] overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-lime-200 border-t-lime-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Generating Lightning invoice...</p>
          </div>
        ) : settled ? (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center text-5xl">✓</div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#0F172A]">Payment Received</h3>
              <p className="text-slate-500 mt-2">The invoice is marked as paid.</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            {invoiceData.paymentMethod === "bank_transfer" ? (
              <div className="w-full space-y-4">
                <div className="bg-lime-50 rounded-2xl p-6 border border-lime-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-lime-600 mb-4 text-center">NUBAN BANK TRANSFER</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white pb-2">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Bank Name</span>
                      <span className="text-sm font-black text-slate-800 uppercase">{invoiceData.virtualAccountBank || "Bitnob Wema Bank"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white pb-2">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Account Number</span>
                      <span className="text-lg font-black text-lime-700 font-mono tracking-wider">{invoiceData.virtualAccountNumber || "Generating..."}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Account Name</span>
                      <span className="text-sm font-black text-slate-800 uppercase truncate ml-4 font-mono">{invoiceData.virtualAccountName || `OS-${invoiceData.customer.toUpperCase()}`}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed font-mono">
                    {invoiceData.virtualAccountNumber 
                      ? "Transfer the exact NGN amount above. Your payment will be detected and converted to Bitcoin automatically."
                      : "We are generating your unique virtual account. Please refresh in a moment."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <QRCode value={qrValue} size={220} />
                {!paymentRequest && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center p-6 text-center">
                    <p className="text-[#0F172A] text-[10px] font-black uppercase tracking-widest bg-lime-400 px-3 py-1.5 rounded-full border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      Scan to Pay
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {paymentError && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3">
            {paymentError}
          </p>
          {paymentError.includes("Lightning Address") && !lightningAddress.includes("@") && (
            <p className="text-[10px] text-slate-500 px-4">
              Tip: Standard addresses look like <span className="font-bold">user@getalby.com</span>. If you only have a username, try adding <span className="font-bold">@getalby.com</span> in your profile.
            </p>
          )}
        </div>
      )}

      {!settled && (
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <button
            onClick={payWithWebLN}
            disabled={!paymentRequest}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-2xl text-xs font-bold transition"
          >
            Pay with WebLN
          </button>
          <button
            onClick={simulateSettlement}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-3 rounded-2xl text-xs font-bold transition"
          >
            Simulate Paid
          </button>
        </div>
      )}

      <div className="mt-10 space-y-6">
        <div className="flex justify-between items-center gap-4">
          <p className="text-slate-500">Customer</p>
          <p className="font-semibold text-[#0F172A] text-right">{invoiceData.customer || "Unknown"}</p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <p className="text-slate-500">Service</p>
          <p className="font-semibold text-[#0F172A] text-right">{invoiceData.service || "No Service"}</p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <p className="text-slate-500">Payment Method</p>
          <p className="font-semibold text-[#0F172A] text-right">{paymentMethod}</p>
        </div>

        <div className="flex justify-between items-center gap-4">
          <p className="text-slate-500">Lightning Address</p>
          <p className="font-semibold text-[#0F172A] text-right break-all">{lightningAddress}</p>
        </div>
      </div>
    </div>
  );
}
