"use client";

import { currencyOptions, localToSats, paymentMethodLabels } from "@/lib/businessData";
import { LocalCurrency, PaymentMethod } from "@/lib/types";

interface InvoiceFormData {
  customer: string;
  service: string;
  localAmount: string;
  currency: LocalCurrency;
  paymentMethod: PaymentMethod;
}

interface InvoiceFormProps {
  invoiceData: InvoiceFormData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
  saveInvoice: () => Promise<void>;
  isSaving?: boolean;
}

export default function InvoiceForm({
  invoiceData,
  setInvoiceData,
  saveInvoice,
  isSaving = false,
}: InvoiceFormProps) {
  const satsAmount = localToSats(invoiceData.localAmount, invoiceData.currency);

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
      <div>
        <p className="text-slate-500 font-medium">Payment Details</p>
        <h2 className="text-3xl font-bold text-lime-500 mt-2">Create Invoice</h2>
      </div>

      <div className="space-y-7 mt-10">
        <div>
          <label className="text-slate-500 font-medium text-sm">Customer Name</label>
          <input
            type="text"
            value={invoiceData.customer}
            onChange={(e) => setInvoiceData({ ...invoiceData, customer: e.target.value })}
            placeholder="Enter customer name"
            className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black placeholder:text-slate-400 focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition"
          />
        </div>

        <div>
          <label className="text-[#0F172A] font-medium text-sm">Item / Service</label>
          <input
            type="text"
            value={invoiceData.service}
            onChange={(e) => setInvoiceData({ ...invoiceData, service: e.target.value })}
            placeholder="Website Design"
            className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black placeholder:text-slate-400 focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition"
          />
        </div>

        <div className="grid sm:grid-cols-[1fr_140px] gap-4">
          <div>
            <label className="text-[#0F172A] font-medium text-sm">Local Amount</label>
            <input
              type="number"
              value={invoiceData.localAmount}
              onChange={(e) => setInvoiceData({ ...invoiceData, localAmount: e.target.value })}
              placeholder="25000"
              className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black placeholder:text-slate-400 focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition"
            />
          </div>

          <div>
            <label className="text-[#0F172A] font-medium text-sm">Currency</label>
            <select
              value={invoiceData.currency}
              onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value as LocalCurrency })}
              className="w-full mt-3 border border-gray-200 rounded-2xl px-4 py-4 outline-none bg-white text-black focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition"
            >
              {currencyOptions.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[#0F172A] font-medium text-sm">Expected Payment Method</label>
          <select
            value={invoiceData.paymentMethod}
            onChange={(e) => setInvoiceData({ ...invoiceData, paymentMethod: e.target.value as PaymentMethod })}
            className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black focus:border-lime-400 focus:ring-4 focus:ring-lime-100 transition"
          >
            {Object.entries(paymentMethodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bitcoin equivalent</p>
            <p className="text-xl font-black text-slate-900 mt-1">{satsAmount.toLocaleString()} sats</p>
          </div>
          <div className="text-right text-xs font-medium text-slate-500 max-w-36">
            Customer can still pay locally; Lightning is optional.
          </div>
        </div>

        <button
          onClick={saveInvoice}
          disabled={isSaving}
          className="w-full bg-lime-500 hover:bg-lime-400 text-white transition py-4 rounded-2xl font-semibold mt-4 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "Creating Invoice..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  );
}

export type { InvoiceFormData };
