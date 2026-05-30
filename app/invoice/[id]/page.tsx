"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import InvoicePreview from "@/components/InvoicePreview";
import Link from "next/link";
import { BusinessProfile, Invoice } from "@/lib/types";
import { findLocalInvoiceById, formatLocalAmount, getInvoiceProofId, getInvoiceSats, isPaidStatus, normalizeProfile, paymentMethodLabels, updateLocalInvoiceStatus } from "@/lib/businessData";
import { getStoredNostrUser, publishInvoiceEvent } from "@/lib/nostr";

export default function PublicInvoicePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    if (!id) return;
    const invoiceId = id;

    async function fetchInvoice() {
      setLoading(true);

      try {
        const localInvoice = findLocalInvoiceById(invoiceId);
        if (localInvoice) {
          setInvoice(localInvoice);
          
          // Dynamic profile lookup: Prefer latest profile from localStorage over snapshot
          if (localInvoice.owner_pubkey) {
              const latestProfile = localStorage.getItem(`profile_${localInvoice.owner_pubkey}`);
              if (latestProfile) {
                  setProfile(normalizeProfile(JSON.parse(latestProfile)));
              } else {
                  setProfile(localInvoice.profile ? normalizeProfile(localInvoice.profile) : null);
              }
          } else {
              setProfile(localInvoice.profile ? normalizeProfile(localInvoice.profile) : null);
          }
          return;
        }

        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", invoiceId)
          .single();

        if (error) throw error;
        const remoteInvoice = data as Invoice;
        setInvoice(remoteInvoice);

        if (remoteInvoice.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", remoteInvoice.user_id)
            .single();
          if (profileData) setProfile(normalizeProfile(profileData));
        }
      } catch (err) {
        console.error("Error fetching public invoice:", err);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();

    // Polling for NUBAN if missing
    let pollInterval: NodeJS.Timeout;
    if (id && !invoice?.virtual_account_number && invoice?.payment_method === "bank_transfer") {
        pollInterval = setInterval(() => {
            const updated = findLocalInvoiceById(id);
            if (updated?.virtual_account_number) {
                setInvoice(updated);
                clearInterval(pollInterval);
            }
        }, 3000);
    }

    return () => {
        if (pollInterval) clearInterval(pollInterval);
    };
  }, [id, invoice?.virtual_account_number, invoice?.payment_method]);

  async function handleSettled() {
    if (!id || !invoice) return;

    const paidAt = new Date().toISOString();
    const optimisticInvoice = { ...invoice, status: "Paid", paid_at: paidAt };
    setInvoice(optimisticInvoice);

    const localUpdate = updateLocalInvoiceStatus(id, "Paid");
    if (localUpdate) setInvoice({ ...localUpdate, paid_at: paidAt });

    const { error: rpcError } = await supabase.rpc("mark_invoice_paid", {
      p_invoice_id: Number(id),
    });

    if (rpcError) {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "Paid", paid_at: paidAt })
        .eq("id", id);

      if (error) {
        console.warn("Shared invoice status update failed:", error.message);
      }
    }

    const nostrUser = getStoredNostrUser();
    const canSignMerchantProof = !invoice.owner_pubkey || nostrUser?.pubkey === invoice.owner_pubkey;
    if (nostrUser && canSignMerchantProof) {
      publishInvoiceEvent({
        id: invoice.id,
        customer: invoice.customer,
        amount_ngn: Number(invoice.local_amount || invoice.amount),
        status: "Paid"
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-16 h-16 border-4 border-lime-200 border-t-lime-500 rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-400 font-medium animate-pulse">Loading secure invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-[#0F172A]">404</h1>
        <p className="text-slate-500 mt-4 text-lg">We could not find that invoice.</p>
        <Link href="/" className="mt-8 bg-black text-white px-8 py-4 rounded-3xl font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-6 md:p-12">
      <div className="max-w-4xl w-full">
        <div className="flex items-center gap-2 mb-12 justify-center md:justify-start">
          <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold">₿</div>
          <span className="text-xl font-black text-[#0F172A]">OwnStack</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3">
            <h1 className="text-4xl font-black text-[#0F172A] leading-tight">
              Invoice for {invoice.customer}
            </h1>
            <p className="text-slate-500 text-lg mt-4 leading-relaxed">
              This invoice was generated by <strong>{profile?.business_name || "an OwnStack merchant"}</strong> as a portable business record.
            </p>

            <div className="mt-12 p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full -m-16"></div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Transaction Details</h3>
                  <p className="mt-1 text-xs font-black uppercase tracking-widest text-lime-600">{getInvoiceProofId(invoice.id)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isPaidStatus(invoice.status) ? "bg-lime-100 text-lime-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {invoice.status}
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between border-b border-slate-50 pb-4 gap-4">
                  <span className="text-slate-500">Service</span>
                  <span className="font-bold text-[#0F172A] text-right">{invoice.service}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-4">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-lime-600 font-mono">{formatLocalAmount(invoice.local_amount ?? invoice.amount, invoice.currency)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-4">
                  <span className="text-slate-500">Bitcoin Equivalent</span>
                  <span className="font-bold text-[#0F172A] font-mono">{getInvoiceSats(invoice).toLocaleString()} sats</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-4">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-bold text-[#0F172A]">{paymentMethodLabels[invoice.payment_method || "lightning"] || "Flexible Payment"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-4">
                  <span className="text-slate-500">Date</span>
                  <span className="font-bold text-[#0F172A]">{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "Today"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Proof ID</span>
                  <span className="font-bold text-[#0F172A] font-mono text-right">{getInvoiceProofId(invoice.id)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setInvoice((current) => current ? { ...current } : current)}
                className="flex-1 bg-black hover:bg-slate-800 text-white px-8 py-5 rounded-[24px] font-bold transition active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                Refresh Status
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <InvoicePreview
              invoiceData={{
                id: invoice.id,
                customer: invoice.customer,
                service: invoice.service,
                amount: String(getInvoiceSats(invoice)),
                localAmount: invoice.local_amount ?? invoice.amount,
                currency: invoice.currency,
                paymentMethod: invoice.payment_method,
                virtualAccountNumber: invoice.virtual_account_number,
                virtualAccountBank: invoice.virtual_account_bank,
                virtualAccountName: invoice.virtual_account_name,
              }}
              lightningAddress={profile?.lightning_username || invoice.lightning_address || "ownstack@getalby.com"}
              status={invoice.status}
              onSettled={handleSettled}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
