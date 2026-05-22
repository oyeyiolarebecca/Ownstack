"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import MobileHeader from "@/components/MobileHeader";

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        business_name: "",
        category: "",
        lightning_username: "",
        avatar_url: "",
    });

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

    async function saveProfile() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const nostrUser = getStoredNostrUser();

        try {
            if (user) {
                const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile });
                if (error) throw error;
            }
            if (nostrUser) {
                localStorage.setItem(`profile_${nostrUser.pubkey}`, JSON.stringify(profile));
            }
            alert("Settings updated!");
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
                <Sidebar profile={profile} />
                <div className="flex-1 flex flex-col min-w-0">
                    <MobileHeader />
                    <div className="p-4 md:p-8">
                        <div>
                            <p className="text-slate-500">Platform preferences</p>
                            <h1 className="text-4xl font-bold text-[#0F172A] mt-2">Settings</h1>
                        </div>

                        <div className="mt-10 bg-white/80 backdrop-blur-md border border-white rounded-[32px] p-8 shadow-sm max-w-3xl">
                            <div className="space-y-8">
                                {/* BUSINESS NAME */}
                                <div>
                                    <label className="text-sm font-medium text-[#0F172A]">Business Name</label>
                                    <input
                                        type="text"
                                        value={profile.business_name}
                                        onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                                        className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                                    />
                                </div>

                                {/* OWNER NAME */}
                                <div>
                                    <label className="text-sm font-medium text-[#0F172A]">Owner Name</label>
                                    <input
                                        type="text"
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                                    />
                                </div>

                                {/* LIGHTNING ADDRESS */}
                                <div>
                                    <label className="text-sm font-medium text-[#0F172A]">Lightning Address</label>
                                    <input
                                        type="text"
                                        value={profile.lightning_username}
                                        onChange={(e) => setProfile({ ...profile, lightning_username: e.target.value })}
                                        className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                                    />
                                </div>

                                {/* BUTTON */}
                                <button
                                    onClick={saveProfile}
                                    disabled={loading}
                                    className="bg-black hover:bg-[#111111] text-white transition px-6 py-4 rounded-3xl font-semibold"
                                >
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </ProtectedRoute>
    );
}