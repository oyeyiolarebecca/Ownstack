"use client";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";

export default function PaymentsPage() {
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

    const payments = [
        {
            customer: "David",
            amount: "25,000 sats",
            status: "Completed",
        },
        {
            customer: "Sarah",
            amount: "12,000 sats",
            status: "Pending",
        },
        {
            customer: "Michael",
            amount: "48,000 sats",
            status: "Completed",
        },
    ];

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-lime-50 flex">
                <Sidebar profile={profile} />
                <div className="flex-1 p-8">
                    <div>
                        <p className="text-slate-500">Payment management</p>
                        <h1 className="text-4xl font-bold text-[#0F172A] mt-2">Payments</h1>
                    </div>
                    <div className="mt-10 bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-8 shadow-sm">
                        <div className="space-y-5">
                            {payments.map((payment, index) => (
                                <div key={index} className="flex items-center justify-between border border-gray-100 rounded-3xl p-5">
                                    <div>
                                        <h3 className="font-semibold text-[#0F172A]">{payment.customer}</h3>
                                        <p className="text-slate-500 mt-1">{payment.amount}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${payment.status === "Completed" ? "bg-lime-100 text-lime-700" : "bg-yellow-100 text-yellow-700"}`}>
                                        {payment.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}