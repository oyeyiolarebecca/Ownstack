"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getStoredNostrUser } from "@/lib/nostr";
import Link from "next/link";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      const nostrUser = getStoredNostrUser();
      setIsAuthenticated(!!user || !!nostrUser);
    }
    checkAuth();
  }, []);

  return (
    <nav className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold text-xl">₿</div>
          <span className="text-xl font-black text-[#0F172A]">OwnStack</span>
        </Link>

        {/* NAV LINKS */}
        <div className="hidden lg:flex items-center gap-8">
          {["Features", "How It Works", "Benefits", "About"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-slate-500 hover:text-black transition text-sm font-semibold"
            >
              {link}
            </a>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bitcoin Network</span>
          </div>

          <Link 
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="flex items-center gap-2 bg-lime-400 hover:bg-lime-500 transition px-6 py-2.5 rounded-2xl font-bold text-sm text-black shadow-lg shadow-lime-100"
          >
            Go to Dashboard
            <span className="text-lg">→</span>
          </Link>

        </div>

      </div>
    </nav>
  );
}