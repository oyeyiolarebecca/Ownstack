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
}

export default function InvoicePreview({
  invoiceData,
  lightningAddress = "ownstack@getalby.com",
}: InvoicePreviewProps) {
  const [paymentRequest, setPaymentRequest] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceData.amount || Number(invoiceData.amount) <= 0) return;

      setIsLoading(true);
      try {
        const pr = await getLightningInvoice(lightningAddress, Number(invoiceData.amount));
        setPaymentRequest(pr);
      } catch (err) {
        console.error("Failed to fetch LN invoice:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceData.amount, lightningAddress]);

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
          className="
            px-4
            py-2
            rounded-full
            bg-yellow-100
            text-yellow-700
            text-sm
            font-medium
          "
        >
          Pending
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
        "
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-lime-200 border-t-lime-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Generating Lightning Invoice...</p>
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