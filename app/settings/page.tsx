"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import MobileHeader from "@/components/MobileHeader";
import { BusinessProfile } from "@/lib/types";
import { defaultNostrProfile, emptyProfile, normalizeProfile } from "@/lib/businessData";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();

      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (data) setProfile(normalizeProfile(data));
      } else if (nostrUser) {
        const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
        setProfile(localProfile ? normalizeProfile(JSON.parse(localProfile)) : defaultNostrProfile(nostrUser));
      }
    }

    fetchProfile();
  }, []);

  async function saveProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const nostrUser = getStoredNostrUser();
    const profileToSave = normalizeProfile({ ...profile, nostr_npub: profile.nostr_npub || nostrUser?.npub || "" });

    try {
      if (user) {
        const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profileToSave });
        if (error) throw error;
      }
      if (nostrUser) {
        localStorage.setItem(`profile_${nostrUser.pubkey}`, JSON.stringify(profileToSave));
      }
      alert("Settings updated!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Error: ${message}`);
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
                <SettingsInput label="Business Name" value={profile.business_name} onChange={(value) => setProfile({ ...profile, business_name: value })} />
                <SettingsInput label="Owner Name" value={profile.full_name} onChange={(value) => setProfile({ ...profile, full_name: value })} />
                <SettingsInput label="Lightning Address" value={profile.lightning_username} onChange={(value) => setProfile({ ...profile, lightning_username: value })} />
                <SettingsInput label="Nostr Identity" value={profile.nostr_npub || ""} onChange={(value) => setProfile({ ...profile, nostr_npub: value })} />

                <button
                  onClick={saveProfile}
                  disabled={loading}
                  className="bg-black hover:bg-[#111111] text-white transition px-6 py-4 rounded-3xl font-semibold disabled:opacity-60"
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

function SettingsInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-[#0F172A]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-3 border border-gray-200 rounded-2xl px-5 py-4 outline-none bg-white text-black focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
      />
    </div>
  );
}
