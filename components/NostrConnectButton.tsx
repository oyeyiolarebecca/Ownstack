"use client";

import { useState } from "react";
import { KeyRound, Loader2, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getNostrIdentity, getStoredNostrUser } from "@/lib/nostr";
import { cn } from "@/lib/utils";

type NostrConnectButtonProps = {
  className?: string;
  label?: string;
  connectedLabel?: string;
  variant?: "primary" | "dark" | "light";
};

export default function NostrConnectButton({
  className,
  label = "Connect Nostr",
  connectedLabel: _connectedLabel = "Open Dashboard",
  variant = "primary",
}: NostrConnectButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIdentity, setPendingIdentity] = useState<{ pubkey: string; npub: string } | null>(null);

  async function handleConnect() {
    const storedUser = getStoredNostrUser();
    if (storedUser) {
      router.push("/dashboard");
      return;
    }

    setIsLoading(true);
    try {
      const identity = await getNostrIdentity();
      setPendingIdentity(identity);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Nostr connection failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmNostrLogin() {
    if (!pendingIdentity) return;
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      const { loginWithNostr, restoreLedgerFromNostr } = await import("@/lib/nostr");
      const { pubkey } = await loginWithNostr();

      try {
        await restoreLedgerFromNostr(pubkey);
      } catch (restoreErr) {
        console.warn("Ledger restoration failed", restoreErr);
      }

      router.push("/dashboard");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Nostr login failed");
    } finally {
      setIsLoading(false);
    }
  }

  void _connectedLabel;
  const buttonLabel = label;

  const variantClass = {
    primary: "bg-lime-400 text-black hover:bg-lime-300 shadow-[0_12px_30px_-12px_rgba(163,230,53,0.75)]",
    dark: "bg-blue-600 text-white hover:bg-blue-500 shadow-[0_12px_30px_-12px_rgba(37,99,235,0.8)]",
    light: "bg-white text-slate-950 hover:bg-slate-100 border border-slate-200",
  }[variant];

  return (
    <>
      <button
        type="button"
        onClick={handleConnect}
        disabled={isLoading}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
          variantClass,
          className
        )}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
        <span>{isLoading ? "Connecting..." : buttonLabel}</span>
      </button>

      {pendingIdentity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-blue-300">Verify Identity</p>
                  <h2 className="text-xl font-black">Connect this Nostr key?</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingIdentity(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-900 hover:text-white"
                aria-label="Cancel Nostr connection"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="break-all rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-300">
              {pendingIdentity.npub}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={confirmNostrLogin}
                disabled={isLoading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-500 disabled:opacity-60"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Connecting..." : "Yes, Connect"}
              </button>
              <button
                type="button"
                onClick={() => setPendingIdentity(null)}
                className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-black text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
