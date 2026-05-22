"use client";

import QRCode from "react-qr-code";
import { useState, useEffect } from "react";
import { getLightningInvoice } from "@/lib/lightning";

interface InvoicePreviewProps {
  invoiceData: {
    customer: string;
    service: string;
    amount: string;
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
  const [paymentRequest, setPaymentRequest] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettled, setIsSettled] = useState(status === "Paid" || status === "Completed");

  useEffect(() => {
    if (status === "Paid" || status === "Completed") {
      setIsSettled(true);
    }
  }, [status]);

  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceData.amount || Number(invoiceData.amount) <= 0) return;

      setIsLoading(true);
      try {
        const pr = await getLightningInvoice(lightningAddress, Number(invoiceData.amount));
        setPaymentRequest(pr);
        // Reset settlement state when amount changes
        setIsSettled(false);
      } catch (err) {
        console.error("Failed to fetch LN invoice:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceData.amount, lightningAddress]);

  // Mock polling for settlement
  useEffect(() => {
    if (paymentRequest && !isSettled) {
      const interval = setInterval(() => {
        // In a real app, you would call an API here to check if the BOLT11 is paid
        console.log("Checking settlement for:", paymentRequest);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [paymentRequest, isSettled]);

  const qrValue = paymentRequest ? `lightning:${paymentRequest}` : `lightning:mock-${invoiceData.customer}-${invoiceData.amount}`;
  return (
    <div
      className="
        bg-gradient-to-br
        from-white
        to-lime-50
        border
        border-gray-200
        rounded-3xl
        p-8
        shadow-sm
      "
    >

      {/* TOP */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-slate-500 font-medium">
            Invoice Preview
          </p>

          <h2 className="text-4xl font-bold text-[#0F172A] mt-3">
            {invoiceData.amount || "0"} sats
          </h2>
        </div>

        <div
          className={`
            px-4
            py-2
            rounded-full
            text-sm
            font-medium
            ${isSettled ? "bg-lime-100 text-lime-700" : "bg-yellow-100 text-yellow-700"}
          `}
        >
          {isSettled ? "Paid" : "Pending"}
        </div>

      </div>

      {/* QR */}
      <div
        className="
          bg-white
          border
          border-gray-200
          rounded-3xl
          p-8
          flex
          flex-col
          items-center
          justify-center
          mt-10
          relative
          min-h-[300px]
          overflow-hidden
        "
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-lime-200 border-t-lime-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Generating Lightning Invoice...</p>
          </div>
        ) : isSettled ? (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center text-5xl">
              ✅
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#0F172A]">Payment Received!</h3>
              <p className="text-slate-500 mt-2">The sats have been settled.</p>
            </div>
          </div>
        ) : (
          <>
            <QRCode
              value={qrValue}
              size={220}
            />
            {!paymentRequest && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                <p className="text-slate-600 text-xs font-bold uppercase tracking-wider bg-white/90 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                  Mock QR (Enter Amount)
                </p>
              </div>
            )}
            {paymentRequest && (
              <button 
                onClick={() => {
                  setIsSettled(true);
                  if (onSettled) onSettled();
                }}
                className="absolute bottom-4 bg-slate-900/10 hover:bg-slate-900/20 text-slate-600 px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2"
              >
                <span>Verify Payment</span>
                <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
              </button>
            )}
          </>
        )}
      </div>

      {/* DETAILS */}
      <div className="mt-10 space-y-6">

        <div className="flex justify-between items-center">
          <p className="text-slate-500">
            Customer
          </p>

          <p className="font-semibold text-[#0F172A]">
            {invoiceData.customer || "Unknown"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-slate-500">
            Service
          </p>

          <p className="font-semibold text-[#0F172A]">
            {invoiceData.service || "No Service"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-slate-500">
            Lightning Address
          </p>

          <p className="font-semibold text-[#0F172A]">
            {lightningAddress}
          </p>
        </div>

      </div>

    </div>
  );
}