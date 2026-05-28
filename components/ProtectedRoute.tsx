"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import { normalizeProfile } from "@/lib/businessData";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();

      if (!user && !nostrUser) {
        router.push("/login");
        return;
      }

      // Check for mandatory profile onboarding
      let hasProfile = false;
      if (user) {
        const { data } = await supabase.from("profiles").select("business_name").eq("id", user.id).single();
        if (data?.business_name) hasProfile = true;
      } else if (nostrUser) {
        const localProfile = localStorage.getItem(`profile_${nostrUser.pubkey}`);
        if (localProfile) {
          const profile = normalizeProfile(JSON.parse(localProfile));
          if (profile.business_name) hasProfile = true;
        }
      }

      if (!hasProfile && pathname !== "/profile") {
        router.push("/profile");
        return;
      }

      if (mounted) setLoading(false);
    }

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return children;
}
