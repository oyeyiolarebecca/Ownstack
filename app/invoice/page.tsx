"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import { useRouter } from "next/navigation";
import { getStoredNostrUser } from "@/lib/nostr";

export default function InvoicePage() {

  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();

    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile(data);
    } else if (nostrUser) {
      const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
      if (localProfile) setProfile(JSON.parse(localProfile));
    }
  }

  const [invoiceData, setInvoiceData] = useState({
    customer: "David",
    service: "Website Design",
    amount: "25000",
  });

  async function saveInvoice() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const nostrUser = getStoredNostrUser();

    const newInvoice = {
      customer: invoiceData.customer,
      service: invoiceData.service,
      amount: Number(invoiceData.amount),
      status: "Pending", // Default to Pending for Bitcoin-native verification later
      created_at: new Date().toISOString(),
    };

    try {
      if (user) {
        // Remove created_at from Supabase insert to let the DB handle it
        const { created_at, ...supabasePayload } = newInvoice;
        const { error } = await supabase
          .from("invoices")
          .insert([supabasePayload]);

        if (error) throw error;
      }

      if (nostrUser) {
        const storageKey = `invoices_${nostrUser.pubkey}`;
        const existingInvoices = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const invoicesWithId = [{ ...newInvoice, id: Date.now() }, ...existingInvoices];
        localStorage.setItem(storageKey, JSON.stringify(invoicesWithId));
      }

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      alert(`Failed to save invoice: ${error.message}`);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex">

      <Sidebar profile={profile} />

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
            saveInvoice={saveInvoice}
          />

          <InvoicePreview
            invoiceData={invoiceData}
            lightningAddress={profile?.lightning_username || "ownstack@getalby.com"}
          />

        </div>

      </div>

    </main>
  );
}