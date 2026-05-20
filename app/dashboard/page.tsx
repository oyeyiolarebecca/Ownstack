"use client";

import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import RecentInvoices from "@/components/RecentInvoices";
import ActivityFeed from "@/components/ActivityFeed";
import RevenueChart from "@/components/RevenueChart";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Skeleton, StatsSkeleton, InvoiceSkeleton } from "@/components/Skeleton";
import { getStoredNostrUser } from "@/lib/nostr";

import { Invoice } from "@/lib/types";

export default function DashboardPage() {

  const router = useRouter();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      console.log("Starting dashboard initialization...");
      setIsLoading(true);
      setErrorMsg(null);

      // Timeout after 10 seconds
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setErrorMsg("Loading is taking longer than expected. Please check your connection.");
      }, 10000);

      try {
        console.log("Loading dashboard data...");
        // Run checks and data fetch in parallel
        await Promise.all([checkUser(), fetchInvoices(), fetchProfile()]);
        console.log("Dashboard data loaded successfully.");

        clearTimeout(timeoutId);
      } catch (err: any) {
        console.error("Loading failed:", err.message || err);
        setErrorMsg(`Loading failed: ${err.message || "Unknown error"}.`);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const nostrUser = getStoredNostrUser();

    if (!user && !nostrUser) {
      router.push("/login");
    }
  }

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const nostrUser = getStoredNostrUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        return;
      }
    }

    if (nostrUser) {
      const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
      if (localProfile) {
        setProfile(JSON.parse(localProfile));
      } else {
        // Default Nostr profile
        setProfile({
          full_name: "Nostr User",
          business_name: "My Bitcoin Business",
          category: "Merchant",
          lightning_username: "user@getalby.com",
          avatar_url: "",
        });
      }
    }
  }

  async function fetchInvoices() {
    console.log("Fetching invoices...");

    // 1. Try Supabase for legacy users
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("id", { ascending: false });

      if (!error && data) {
        setInvoices(data);
        return;
      }
    }

    // 2. Fallback to LocalStorage for Nostr or if Supabase fails (Ownership First!)
    const nostrUser = getStoredNostrUser();
    const storageKey = nostrUser ? `invoices_${nostrUser.pubkey}` : "invoices";
    const localInvoices = localStorage.getItem(storageKey);

    if (localInvoices) {
      setInvoices(JSON.parse(localInvoices));
    } else {
      setInvoices([]);
    }
  }

  async function updateInvoiceStatus(id: number, newStatus: string) {
    // 1. Update Supabase if user exists
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", id);

      if (!error) {
        setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
        return;
      }
    }

    // 2. Update LocalStorage for Nostr users
    const nostrUser = getStoredNostrUser();
    const storageKey = nostrUser ? `invoices_${nostrUser.pubkey}` : "invoices";
    const localInvoices = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updatedInvoices = localInvoices.map((inv: any) =>
      inv.id === id ? { ...inv, status: newStatus } : inv
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedInvoices));
    setInvoices(updatedInvoices);
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex">

        <Sidebar profile={profile} />

        <div className="flex-1 p-8">

          <DashboardHeader />

          {errorMsg && (
            <div className="mt-8 p-6 bg-white border border-red-100 rounded-[32px] shadow-sm flex items-start gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-red-50 p-3 rounded-2xl text-xl">
                🚨
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-lg">Something went wrong</h3>
                <p className="text-slate-500 mt-1 leading-relaxed">{errorMsg}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition shadow-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setErrorMsg(null)}
                    className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                  >
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

      </main>
    </ProtectedRoute>
  );
}