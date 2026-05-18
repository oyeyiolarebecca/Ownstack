"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(
        e: React.FormEvent
    ) {
        e.preventDefault();

        const { error } =
            await supabase.auth.signInWithPassword({
                email,
                password,
            });

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
                    Welcome Back ⚡
                </h1>

                <p className="text-slate-500 mt-3">
                    Login to manage your Bitcoin business.
                </p>

                <form
                    onSubmit={handleLogin}
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
                        Login
                    </button>

                </form>

            </div>

        </main>
    );
}