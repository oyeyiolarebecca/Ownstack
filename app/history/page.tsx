"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import RecentInvoices from "@/components/RecentInvoices";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getStoredNostrUser } from "@/lib/nostr";
import { InvoiceSkeleton } from "@/components/Skeleton";

interface Invoice {
  id: number;
  customer: string;
  service: string;
  amount: number;
  status: string;
}

import MobileHeader from "@/components/MobileHeader";

export default function HistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await Promise.all([fetchInvoices(), fetchProfile()]);
      setIsLoading(false);
    }
    init();

    // Subscribe to real-time updates for invoices
    const subscription = supabase
      .channel('history-updates')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'invoices' }, (payload: any) => {
        console.log('History real-time update:', payload);
        if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Invoice;
          setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
        } else if (payload.eventType === 'INSERT') {
          const newInvoice = payload.new as Invoice;
          setInvoices(prev => [newInvoice, ...prev]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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

  async function fetchInvoices() {
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();

    if (user) {
        const { data } = await supabase.from("invoices").select("*").order("id", { ascending: false });
        if (data) {
            setInvoices(data);
            return;
        }
    }

    const storageKey = nostrUser ? `invoices_${nostrUser.pubkey}` : "invoices";
    const localInvoices = localStorage.getItem(storageKey);
    if (localInvoices) setInvoices(JSON.parse(localInvoices));
  }

  async function updateInvoiceStatus(id: number, newStatus: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();

    if (user) {
        await supabase.from("invoices").update({ status: newStatus }).eq("id", id);
    }

    const storageKey = nostrUser ? `invoices_${nostrUser.pubkey}` : "invoices";
    const localInvoices = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = localInvoices.map((inv: any) => inv.id === id ? { ...inv, status: newStatus } : inv);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setInvoices(updated);
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
