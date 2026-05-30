"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { getNostrIdentity } from "@/lib/nostr";

export default function SignupPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [pendingIdentity, setPendingIdentity] = useState<{ pubkey: string; npub: string } | null>(null);

    async function handleNostrLogin() {
        setIsLoading(true);
        try {
            const identity = await getNostrIdentity();
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

            const { loginWithNostr, restoreLedgerFromNostr } = await import("@/lib/nostr");
            const { pubkey } = await loginWithNostr(); 
            
            try {
                await restoreLedgerFromNostr(pubkey);
            } catch (e) {
                console.warn("Ledger restoration failed", e);
            }
            router.push("/dashboard");
        } catch (error) {
            alert(error instanceof Error ? error.message : "Nostr login failed");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSignup(
        e: React.FormEvent
    ) {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Clear any stale sessions before creating a new account
            await supabase.auth.signOut();
            localStorage.removeItem("nostr_pubkey");
            localStorage.removeItem("nostr_npub");

            const { data, error } =
                await supabase.auth.signUp({
                    email,
                    password,
                });

            if (error) {
                alert(error.message);
                return;
            }

            // If Supabase auto-confirms (no email verification), go straight to profile
            if (data.session) {
                router.push("/profile");
            } else {
                alert("Check your email to confirm your account, then log in.");
                router.push("/login");
            }
        } finally {
            setIsLoading(false);
        }
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
          p-8
          shadow-sm
          border
          border-gray-100
        "
            >

                <h1
                    className="
            text-4xl
            font-black
            text-[#0F172A]
          "
                >
                    Create Account
                </h1>

                <p className="text-slate-500 mt-3">
                    Start managing your BTC payments.
                </p>

                <form
                    onSubmit={handleSignup}
                    className="space-y-5 mt-8"
                >

                    <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        className="
              w-full
              border
              border-gray-200
              rounded-2xl
              px-5
              py-4
              outline-none
              text-black
              focus:border-lime-400
            "
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="
              w-full
              border
              border-gray-200
              rounded-2xl
              px-5
              py-4
              outline-none
              text-black
              focus:border-lime-400
            "
                    />

                    <button
                        type="submit"
                        className="
              w-full
              bg-black
              hover:bg-[#111111]
              text-white
              py-4
              rounded-2xl
              font-semibold
              transition
            "
                    >
                        Create Account
                    </button>

                </form>

                <div className="relative flex items-center gap-4 py-6">
                    <div className="flex-1 h-px bg-slate-100"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">or use nostr</span>
                    <div className="flex-1 h-px bg-slate-100"></div>
                </div>

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
                        className="
                            w-full
                            bg-slate-50
                            border
                            border-slate-200
                            hover:bg-slate-100
                            text-slate-900
                            py-4
                            rounded-2xl
                            font-bold
                            transition-all
                            flex
                            items-center
                            justify-center
                            gap-3
                        "
                    >
                        <span className="text-xl">🪪</span>
                        Signup with Nostr
                    </button>
                )}

                <p className="mt-8 text-center text-sm text-slate-500">
                    Already have an account?{" "}
                    <a href="/login" className="text-black font-bold hover:underline">
                        Login
                    </a>
                </p>
            </div>

        </main>
    );
}