"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import RecentInvoices from "@/components/RecentInvoices";
import ActivityFeed from "@/components/ActivityFeed";
import RevenueChart from "@/components/RevenueChart";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Skeleton, StatsSkeleton, InvoiceSkeleton } from "@/components/Skeleton";
import { getStoredNostrUser, publishInvoiceEvent } from "@/lib/nostr";
import { BusinessProfile, Invoice } from "@/lib/types";
import MobileHeader from "@/components/MobileHeader";
import { defaultNostrProfile, loadLocalInvoices, loadLocalVaultDocuments, normalizeProfile, saveLocalInvoices } from "@/lib/businessData";

export default function DashboardPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [vaultCount, setVaultCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const nostrUser = getStoredNostrUser();

        if (!user && !nostrUser) {
          router.push("/login");
          return;
        }

        if (user) {
          const [
            { data: profileData },
            { data: invoiceData, error: invoiceError },
            { count: vaultDocumentCount },
          ] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("invoices").select("*").eq("user_id", user.id).order("id", { ascending: false }),
            supabase.from("vault_documents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
          ]);

          if (invoiceError) throw invoiceError;
          if (!mounted) return;
          if (profileData) setProfile(normalizeProfile(profileData));
          setInvoices(invoiceData || []);
          setVaultCount(vaultDocumentCount || 0);
          return;
        }

        if (nostrUser && mounted) {
          const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
          setProfile(localProfile ? normalizeProfile(JSON.parse(localProfile)) : defaultNostrProfile(nostrUser));
          setInvoices(loadLocalInvoices(nostrUser.pubkey));
          setVaultCount(loadLocalVaultDocuments(nostrUser.pubkey).length);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorMsg(`Loading failed: ${message}.`);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, [router]);

  // Supabase Realtime for live updates (filtered to current user)
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Nostr-only users don't use Realtime

      channel = supabase
        .channel("invoice-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "invoices",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedInv = payload.new as Invoice;
            setInvoices((current) =>
              current.map((inv) => (inv.id === updatedInv.id ? { ...inv, ...updatedInv } : inv))
            );
          }
        )
        .subscribe();
    }

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  async function updateInvoiceStatus(id: number, newStatus: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();

    if (user) {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        setInvoices((current) => current.map((inv) => inv.id === id ? { ...inv, status: newStatus } : inv));
        return;
      }
    }

    if (nostrUser) {
      const updatedInvoices = loadLocalInvoices(nostrUser.pubkey).map((inv) =>
        inv.id === id ? { ...inv, status: newStatus } : inv
      );
      saveLocalInvoices(nostrUser.pubkey, updatedInvoices);
      setInvoices(updatedInvoices);

      // Critical MVP feature: Publish proof of sale to Nostr
      if (newStatus === "Paid") {
          const inv = updatedInvoices.find(i => i.id === id);
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
            <DashboardHeader />

            {errorMsg && (
              <div className="mt-8 p-6 bg-white border border-red-100 rounded-[32px] shadow-sm flex items-start gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-red-50 p-3 rounded-2xl text-xl">!</div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">Something went wrong</h3>
                  <p className="text-slate-500 mt-1 leading-relaxed">{errorMsg}</p>
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => window.location.reload()} className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm">
                      Try Again
                    </button>
                    <button onClick={() => setErrorMsg(null)} className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="space-y-8 animate-in fade-in duration-700">
                <StatsSkeleton />
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <InvoiceSkeleton />
                  </div>
                  <div className="space-y-8">
                    <Skeleton className="h-[400px] rounded-[32px]" />
                    <Skeleton className="h-[200px] rounded-[32px]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <StatsCards invoices={invoices} />
                <div className="grid lg:grid-cols-3 gap-8 mt-8">
                  <div className="lg:col-span-2">
                    <RecentInvoices invoices={invoices} onUpdateStatus={updateInvoiceStatus} limit={5} />
                  </div>
                  <div>
                    <ActivityFeed invoices={invoices} />
                  </div>
                </div>
                <div className="mt-8">
                  <RevenueChart invoices={invoices} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
