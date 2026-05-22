"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChangeEvent } from "react";
import { getStoredNostrUser } from "@/lib/nostr";
import BusinessProfileCard from "@/components/BusinessProfileCard";
import MobileHeader from "@/components/MobileHeader";

export default function ProfilePage() {

    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);

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

    async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            setUploadLoading(true);

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                alert("You must be logged in to upload a profile picture");
                return;
            }

            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
        } catch (error: any) {
            console.error("Profile picture upload failed:", error);
            alert(error.message || "Upload failed.");
        } finally {
            setUploadLoading(false);
        }
    }

    async function fetchProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        const nostrUser = getStoredNostrUser();

        if (user) {
            const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
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
            alert("Profile updated!");
        } catch (error: any) {
            console.error("Failed to save profile:", error);
            alert("Failed to save profile: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
            <Sidebar profile={profile} />
            <div className="flex-1 flex flex-col min-w-0">
                <MobileHeader />
                <div className="p-4 md:p-8">
                    <div>
                        <p className="text-slate-500">Business Identity</p>
                        <h1 className="text-4xl font-bold text-[#0F172A] mt-2">Your Profile</h1>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-10 mt-10 max-w-6xl">
                        {/* EDIT FORM */}
                        <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">Edit Business Identity</h2>
                            <div className="space-y-6">
                                <div className="flex flex-col items-center mb-8 relative group">
                                    <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg relative">
                                        {uploadLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                                                <div className="w-8 h-8 border-4 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                                <span className="text-3xl mb-1">👤</span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="mt-4 cursor-pointer">
                                        <span className="text-xs font-bold text-lime-600 uppercase tracking-widest hover:text-lime-700 transition">
                                            {uploadLoading ? "Uploading..." : "Change Logo"}
                                        </span>
                                        <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" disabled={uploadLoading} />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Owner Name</label>
                                    <input type="text" placeholder="e.g. Sarah Jenkins" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-black outline-none focus:border-lime-500 transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Name</label>
                                    <input type="text" placeholder="e.g. Green Valley Coffee" value={profile.business_name} onChange={(e) => setProfile({ ...profile, business_name: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-black outline-none focus:border-lime-500 transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                    <input type="text" placeholder="e.g. Retail / Wholesale" value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-black outline-none focus:border-lime-500 transition-colors" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lightning Address</label>
                                    <input type="text" placeholder="yourname@getalby.com" value={profile.lightning_username} onChange={(e) => setProfile({ ...profile, lightning_username: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-black outline-none focus:border-lime-500 transition-colors" />
                                </div>

                                <button onClick={saveProfile} disabled={loading} className="w-full bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold transition active:scale-95 shadow-lg shadow-slate-200">
                                    {loading ? "Saving Changes..." : "Save Identity"}
                                </button>
                            </div>
                        </div>

                        {/* LIVE PREVIEW */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-bold text-slate-800">Public Preview</h2>
                                <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 bg-lime-50 px-3 py-1 rounded-full border border-lime-100">Live</span>
                            </div>
                            <BusinessProfileCard profile={profile} invoices={[]} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}