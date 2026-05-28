"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import InvoiceForm, { InvoiceFormData } from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import { getStoredNostrUser } from "@/lib/nostr";
import Link from "next/link";
import MobileHeader from "@/components/MobileHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BusinessProfile, Invoice } from "@/lib/types";
import {
  defaultNostrProfile,
  loadLocalInvoices,
  normalizeProfile,
  saveLocalInvoices,
  savePublicInvoice,
  localToSats,
  getInvoiceProofId,
} from "@/lib/businessData";

export default function InvoicePage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(normalizeProfile(data));
        return;
      }

      if (nostrUser) {
        const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
        setProfile(localProfile ? normalizeProfile(JSON.parse(localProfile)) : defaultNostrProfile(nostrUser));
      }
    }

    loadProfile();
  }, []);

  const [invoiceData, setInvoiceData] = useState<InvoiceFormData>({
    customer: "",
    service: "",
    localAmount: "",
    currency: "NGN",
    paymentMethod: "bank_transfer",
  });
  const [savedInvoiceId, setSavedInvoiceId] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function saveInvoice() {
    if (!invoiceData.customer.trim() || !invoiceData.service.trim() || Number(invoiceData.localAmount) <= 0) {
      alert("Add a customer, service, and valid local amount first.");
      return;
    }

    setIsSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();
    const activeProfile = profile ? normalizeProfile(profile) : nostrUser ? defaultNostrProfile(nostrUser) : null;

    const satsAmount = localToSats(invoiceData.localAmount, invoiceData.currency);

    const newInvoice: Invoice = {
      id: Date.now(),
      customer: invoiceData.customer.trim(),
      service: invoiceData.service.trim(),
      amount: satsAmount,
      local_amount: Number(invoiceData.localAmount),
      currency: invoiceData.currency,
      sats_amount: satsAmount,
      payment_method: invoiceData.paymentMethod,
      status: "Pending",
      created_at: new Date().toISOString(),
      user_id: user?.id,
      owner_pubkey: nostrUser?.pubkey,
      lightning_address: activeProfile?.lightning_username || "ownstack@getalby.com",
      profile: activeProfile || undefined,
    };

    try {
      if (user) {
        const supabasePayload = {
          customer: newInvoice.customer,
          service: newInvoice.service,
          amount: newInvoice.amount,
          local_amount: newInvoice.local_amount,
          currency: newInvoice.currency,
          sats_amount: newInvoice.sats_amount,
          payment_method: newInvoice.payment_method,
          status: newInvoice.status,
          user_id: user.id,
          lightning_address: newInvoice.lightning_address,
        };
        const { data, error } = await supabase
          .from("invoices")
          .insert([supabasePayload])
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const savedInvoice = { ...newInvoice, ...data, profile: activeProfile || undefined } as Invoice;
          savePublicInvoice(savedInvoice);
          setSavedInvoiceId(String(savedInvoice.id));

          // Call backend for NUBAN allocation
          const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          try {
              fetch(`${API}/invoices/allocate-nuban`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ invoice_id: data.id })
              }).catch(e => console.error("NUBAN allocation fetch failed:", e));
          } catch (e) {
              console.error("NUBAN allocation error:", e);
          }
        }
      }

      if (nostrUser) {
        const existingInvoices = loadLocalInvoices(nostrUser.pubkey);
        
        // Initial save
        saveLocalInvoices(nostrUser.pubkey, [newInvoice, ...existingInvoices]);
        savePublicInvoice(newInvoice);
        setSavedInvoiceId(String(newInvoice.id));

        // Call backend for NUBAN allocation if needed
        if (newInvoice.payment_method === "bank_transfer") {
            const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            try {
                const response = await fetch(`${API}/invoices/allocate-nuban`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        invoice_id: newInvoice.id,
                        customer_name: newInvoice.customer,
                        amount_ngn: newInvoice.local_amount
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const updatedInvoice = {
                        ...newInvoice,
                        virtual_account_number: data.account_number,
                        virtual_account_bank: data.bank_name,
                        virtual_account_name: data.account_name,
                        bitnob_reference: data.reference,
                    };
                    // Save the updated version
                    const updatedList = [updatedInvoice, ...existingInvoices];
                    saveLocalInvoices(nostrUser.pubkey, updatedList);
                    savePublicInvoice(updatedInvoice);
                }
            } catch (e) {
                console.error("Nostr NUBAN allocation error:", e);
            }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error saving invoice:", error);
      alert(`Failed to save invoice: ${message}`);
    } finally {
      setIsSaving(false);
    }
  }

  function copyLink() {
    if (!savedInvoiceId) return;
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${savedInvoiceId}`);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex flex-col md:flex-row">
        <Sidebar profile={profile} />

        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <div className="p-4 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500">Manage payments</p>
                <h1 className="text-black font-bold mt-2">Create Invoice</h1>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mt-10 relative">
              {savedInvoiceId && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500 rounded-[32px]">
                  <div className="bg-white border border-slate-200 p-10 rounded-[40px] shadow-2xl max-w-md w-full text-center scale-up-center animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                      ₿
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Invoice Created</h2>
                    <p className="text-slate-500 mt-2">Your invoice is live with local payment options and a Lightning QR.</p>
                    <div className="mt-5 inline-flex rounded-full bg-lime-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-lime-700">
                      Proof ID {getInvoiceProofId(savedInvoiceId)}
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                      <code className="text-xs text-slate-500 truncate text-left flex-1">
                        /invoice/{savedInvoiceId}
                      </code>
                      <button
                        onClick={copyLink}
                        className="shrink-0 bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                      >
                        {isCopying ? "Copied" : "Copy Link"}
                      </button>
                    </div>

                    <div className="mt-8 grid gap-3">
                      <Link
                        href={`/invoice/${savedInvoiceId}`}
                        className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold rounded-2xl transition"
                      >
                        View Public Invoice
                      </Link>
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href="/dashboard"
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/vault"
                          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition"
                        >
                          Add Receipt
                        </Link>
                      </div>
                      <button
                        onClick={() => {
                          setSavedInvoiceId(null);
                          setInvoiceData({ customer: "", service: "", localAmount: "", currency: "NGN", paymentMethod: "bank_transfer" });
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
                isSaving={isSaving}
              />

              <InvoicePreview
                invoiceData={{
                  customer: invoiceData.customer,
                  service: invoiceData.service,
                  amount: String(localToSats(invoiceData.localAmount, invoiceData.currency)),
                  localAmount: invoiceData.localAmount,
                  currency: invoiceData.currency,
                  paymentMethod: invoiceData.paymentMethod,
                }}
                lightningAddress={profile?.lightning_username || "ownstack@getalby.com"}
              />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
