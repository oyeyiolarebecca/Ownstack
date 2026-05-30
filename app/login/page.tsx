"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { loginWithNostr, getStoredNostrUser, restoreLedgerFromNostr } from "@/lib/nostr";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Removed auto-redirect to allow identity switching and verification flow


    const [pendingIdentity, setPendingIdentity] = useState<{ pubkey: string; npub: string } | null>(null);

    async function handleNostrLogin() {
        setIsLoading(true);
        try {
            const identity = await import("@/lib/nostr").then(m => m.getNostrIdentity());
            setPendingIdentity(identity);
        } catch (error) {
            alert(error instanceof Error ? error.message : "Connection failed");
        } finally {
            setIsLoading(false);
        }
    }

    async function confirmNostrLogin() {
        if (!pendingIdentity) return;
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            // Removed localStorage.clear() to preserve user profiles and data
            
            // Re-import to ensure we're using the persistence logic
            const { loginWithNostr, restoreLedgerFromNostr } = await import("@/lib/nostr");
            const { pubkey } = await loginWithNostr(); // This will persist the key now
            
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

    async function handleEmailLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        // Clear any stale Nostr session so the dashboard loads the correct user
        localStorage.removeItem("nostr_pubkey");
        localStorage.removeItem("nostr_npub");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        router.push("/dashboard");
    }

    return (
        <main
            className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-[#F8FAFC]
                to-lime-50
                p-6
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    bg-white
                    rounded-[32px]
                    p-10
                    shadow-xl
                    shadow-slate-200/50
                    border
                    border-slate-100
                "
            >

                <div className="mb-8">
                    <div className="w-12 h-12 bg-lime-400 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-lime-200">
                        ₿
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        OwnStack
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        Bitcoin-Native Business Infrastructure
                    </p>
                </div>

                <div className="space-y-6">
                    {pendingIdentity ? (
                        <div className="bg-lime-50 border border-lime-100 rounded-3xl p-6 space-y-4">
                            <p className="text-xs font-bold text-lime-700 uppercase tracking-widest">Verify Identity</p>
                            <div className="bg-white p-4 rounded-xl border border-lime-100 break-all text-[10px] font-mono text-slate-600">
                                {pendingIdentity.npub}
                            </div>
                            <p className="text-sm text-slate-600 font-medium">Connect this Nostr account?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={confirmNostrLogin}
                                    disabled={isLoading}
                                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition disabled:opacity-50"
                                >
                                    {isLoading ? "Connecting..." : "Yes, Connect"}
                                </button>
                                <button
                                    onClick={() => setPendingIdentity(null)}
                                    className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm text-slate-500 hover:bg-white transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleNostrLogin}
                            disabled={isLoading}
                            className="
                                w-full
                                bg-slate-900
                                hover:bg-slate-800
                                text-white
                                py-5
                                rounded-2xl
                                font-bold
                                transition-all
                                flex
                                items-center
                                justify-center
                                gap-3
                                shadow-lg
                                shadow-slate-200
                                hover:scale-[1.02]
                                active:scale-[0.98]
                                disabled:opacity-50
                            "
                        >
                            <span className="text-xl">🪪</span>
                            {isLoading ? "Connecting..." : "Login with Nostr"}
                        </button>
                    )}

                    <div className="relative flex items-center gap-4 py-2">
                        <div className="flex-1 h-px bg-slate-100"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or legacy login</span>
                        <div className="flex-1 h-px bg-slate-100"></div>
                    </div>

                    <form
                        onSubmit={handleEmailLogin}
                        className="space-y-4"
                    >

                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="
                                w-full
                                border
                                border-slate-200
                                rounded-2xl
                                px-5
                                py-4
                                outline-none
                                text-slate-900
                                bg-slate-50/50
                                focus:bg-white
                                focus:border-lime-400
                                focus:ring-4
                                focus:ring-lime-100
                                transition-all
                            "
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="
                                w-full
                                border
                                border-slate-200
                                rounded-2xl
                                px-5
                                py-4
                                outline-none
                                text-slate-900
                                bg-slate-50/50
                                focus:bg-white
                                focus:border-lime-400
                                focus:ring-4
                                focus:ring-lime-100
                                transition-all
                            "
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                                w-full
                                bg-white
                                border-2
                                border-slate-900
                                text-slate-900
                                hover:bg-slate-50
                                py-4
                                rounded-2xl
                                font-bold
                                transition-all
                                disabled:opacity-50
                            "
                        >
                            Email Login
                        </button>

                    </form>
                </div>

                <p className="mt-10 text-center text-sm text-slate-400 font-medium">
                    By continuing, you agree to own your business data independently.
                </p>

            </div>

        </main>
    );
}