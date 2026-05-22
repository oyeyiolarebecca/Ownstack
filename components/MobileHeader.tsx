"use client";

import { Menu, X } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

export default function MobileHeader() {
  const { toggle, isOpen } = useSidebar();

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold text-lg">₿</div>
        <span className="text-xl font-black text-[#0F172A]">OwnStack</span>
      </div>

      <button 
        onClick={toggle}
        className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-600 active:scale-95 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
}
