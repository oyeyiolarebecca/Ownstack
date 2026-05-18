"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";

export default function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState({
    customer: "David",
    service: "Website Design",
    amount: "25000",
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex">

      <Sidebar />

      <div className="flex-1 p-8">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-slate-500">
              Manage payments
            </p>

            <h1 className="text-black font-bold mt-2">
              Create Invoice
            </h1>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">

          <InvoiceForm
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
          />

          <InvoicePreview invoiceData={invoiceData} />

        </div>

      </div>

    </main>
  );
}