"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import { useRouter } from "next/navigation";
import { getStoredNostrUser } from "@/lib/nostr";
import Link from "next/link";
import MobileHeader from "@/components/MobileHeader";

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
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);

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
        const { data, error } = await supabase
          .from("invoices")
          .insert([supabasePayload])
          .select()
          .single();

        if (error) throw error;
        if (data) setSavedInvoiceId(data.id);
      }

      if (nostrUser) {
        const storageKey = `invoices_${nostrUser.pubkey}`;
        const existingInvoices = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const id = Date.now();
        const invoicesWithId = [{ ...newInvoice, id }, ...existingInvoices];
        localStorage.setItem(storageKey, JSON.stringify(invoicesWithId));
        setSavedInvoiceId(id.toString());
      }

      // No redirect yet, show share link
    } catch (error: any) {
      console.error("Error saving invoice:", error);
      alert(`Failed to save invoice: ${error.message}`);
    }
  }

  function copyLink() {
    if (!savedInvoiceId) return;
    const url = `${window.location.origin}/invoice/${savedInvoiceId}`;
    navigator.clipboard.writeText(url);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex flex-col md:flex-row">

      <Sidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <div className="p-4 md:p-8">

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

        <div className="grid lg:grid-cols-2 gap-8 mt-10 relative">

          {savedInvoiceId && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 rounded-[32px]">
              <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center scale-up-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                  🎉
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A]">Invoice Created!</h2>
                <p className="text-slate-500 mt-2">Your invoice is now live and ready to be paid.</p>
                
                <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <code className="text-xs text-slate-500 truncate text-left flex-1">
                    {window.location.origin}/invoice/{savedInvoiceId}
                  </code>
                  <button 
                    onClick={copyLink}
                    className="shrink-0 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                  >
                    {isCopying ? "Copied!" : "Copy Link"}
                  </button>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <Link 
                    href="/dashboard"
                    className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition"
                  >
                    Back to Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                        setSavedInvoiceId(null);
                        setInvoiceData({ customer: "", service: "", amount: "" });
                    }}
                    className="text-slate-400 text-sm font-medium hover:text-slate-600 underline"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          )}

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
        </div>
    </main>
  );
}