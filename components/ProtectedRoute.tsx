"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
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

      if (mounted) setLoading(false);
    }

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return children;
}
