"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import RecentInvoices from "@/components/RecentInvoices";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getStoredNostrUser, publishInvoiceEvent } from "@/lib/nostr";
import { InvoiceSkeleton } from "@/components/Skeleton";
import MobileHeader from "@/components/MobileHeader";
import { BusinessProfile, Invoice } from "@/lib/types";
import { defaultNostrProfile, loadLocalInvoices, normalizeProfile, saveLocalInvoices } from "@/lib/businessData";

export default function HistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();

      if (user) {
        const [{ data: profileData }, { data: invoiceData }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).single(),
          supabase.from("invoices").select("*").eq("user_id", user.id).order("id", { ascending: false }),
        ]);

        if (!mounted) return;
        if (profileData) setProfile(normalizeProfile(profileData));
        setInvoices(invoiceData || []);
      } else if (nostrUser) {
        const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
        if (!mounted) return;
        setProfile(localProfile ? normalizeProfile(JSON.parse(localProfile)) : defaultNostrProfile(nostrUser));
        setInvoices(loadLocalInvoices(nostrUser.pubkey));
      }

      if (mounted) setIsLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  async function updateInvoiceStatus(id: Invoice["id"], newStatus: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();

    if (user) {
      await supabase.from("invoices").update({ status: newStatus }).eq("id", id).eq("user_id", user.id);
      setInvoices((current) => current.map((invoice) => invoice.id === id ? { ...invoice, status: newStatus } : invoice));
      return;
    }

    if (nostrUser) {
      const updated = loadLocalInvoices(nostrUser.pubkey).map((inv) => inv.id === id ? { ...inv, status: newStatus } : inv);
      saveLocalInvoices(nostrUser.pubkey, updated);
      setInvoices(updated);

      // Critical MVP feature: Publish proof of sale to Nostr
      if (newStatus === "Paid") {
          const inv = updated.find(i => i.id === id);
          if (inv) {
              publishInvoiceEvent({
                  id: inv.id,
                  customer: inv.customer,
                  amount_ngn: Number(inv.local_amount || inv.amount),
                  status: inv.status
              });
          }
      }
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex flex-col md:flex-row">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <div className="p-4 md:p-8">
            <div>
              <p className="text-slate-500">Transaction log</p>
              <h1 className="text-4xl font-bold text-[#0F172A] mt-2">History</h1>
            </div>

            <div className="mt-10">
              {isLoading ? (
                <InvoiceSkeleton />
              ) : (
                <RecentInvoices invoices={invoices} onUpdateStatus={updateInvoiceStatus} />
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
