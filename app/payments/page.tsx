"use client";

import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import MobileHeader from "@/components/MobileHeader";

export default function PaymentsPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function init() {
            setIsLoading(true);
            await Promise.all([fetchProfile(), fetchInvoices()]);
            setIsLoading(false);
        }
        init();
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
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : invoices.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-slate-400">No transactions recorded yet.</p>
                                    </div>
                                ) : (
                                    invoices.map((payment, index) => (
                                        <div key={payment.id || index} className="flex items-center justify-between border border-gray-100 rounded-3xl p-5 hover:bg-slate-50 transition">
                                            <div>
                                                <h3 className="font-semibold text-[#0F172A]">{payment.customer}</h3>
                                                <p className="text-slate-500 mt-1">{payment.amount} sats • {payment.service}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-full text-sm font-medium ${payment.status === "Completed" || payment.status === "Paid" ? "bg-lime-100 text-lime-700" : "bg-yellow-100 text-yellow-700"}`}>
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