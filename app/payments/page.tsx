"use client";

import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import MobileHeader from "@/components/MobileHeader";
import { BusinessProfile, Invoice } from "@/lib/types";
import { defaultNostrProfile, formatLocalAmount, getInvoiceSats, isPaidStatus, loadLocalInvoices, normalizeProfile, paymentMethodLabels } from "@/lib/businessData";

export default function PaymentsPage() {
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

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex flex-col md:flex-row">
        <Sidebar profile={profile} />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileHeader />
          <div className="p-4 md:p-8">
            <div>
              <p className="text-slate-500">Payment management</p>
              <h1 className="text-4xl font-bold text-[#0F172A] mt-2">Payments</h1>
            </div>

            <div className="mt-10 bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-8 shadow-sm">
              <div className="space-y-5">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400">No transactions recorded yet.</p>
                  </div>
                ) : (
                  invoices.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border border-gray-100 rounded-3xl p-5 hover:bg-slate-50 transition">
                      <div>
                        <h3 className="font-semibold text-[#0F172A]">{payment.customer}</h3>
                        <p className="text-slate-500 mt-1">
                          {formatLocalAmount(payment.local_amount ?? payment.amount, payment.currency)} • {payment.service}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {getInvoiceSats(payment).toLocaleString()} sats • {paymentMethodLabels[payment.payment_method || "lightning"] || "Payment"}
                        </p>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${isPaidStatus(payment.status) ? "bg-lime-100 text-lime-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {payment.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
