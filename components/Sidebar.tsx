"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { logoutNostr, getStoredNostrUser } from "@/lib/nostr";

import {
  LayoutDashboard,
  FileText,
  Wallet,
  Settings,
  User,
  History,
  LogOut,
  X,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";

interface SidebarProps {
  profile?: any;
}

export default function Sidebar({ profile }: SidebarProps) {
  const { isOpen, close } = useSidebar();

  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {

    await supabase.auth.signOut();
    logoutNostr();

    router.push("/login");
  }

  const links = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Create Invoice",
      icon: FileText,
      href: "/invoice",
    },
    {
      title: "History",
      icon: History,
      href: "/history",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <>
      {/* OVERLAY for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[50] md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[60] w-72 h-full
          bg-white flex flex-col justify-between p-6
          border-r border-slate-100 shadow-2xl md:shadow-none
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:bg-white/70 md:backdrop-blur-md md:border-white
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* MOBILE CLOSE BUTTON */}
          <button 
            onClick={close}
            className="md:hidden absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400"
          >
            <X size={18} />
          </button>

          <div>
            {/* LOGO */}
            <div className="flex items-center gap-3 mb-12">
              <div
                className="
                  w-10
                  h-10
                  rounded-2xl
                  bg-lime-400
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-black
                "
              >
                ₿
              </div>

              <h1 className="text-2xl font-bold text-[#0F172A]">
                OwnStack
              </h1>
            </div>

            {/* NAVIGATION */}
            <div className="space-y-3">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close} // CLOSE ON CLICK
                    className={`
                      relative
                      w-full
                      flex
                      items-center
                      gap-4
                      px-6
                      py-4
                      rounded-2xl
                      transition-all
                      duration-300
                      font-bold
                      text-sm
                      group
                      ${isActive
                        ? "bg-lime-50 text-lime-700"
                        : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                      }
                    `}
                  >
                    {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-lime-500 rounded-r-full shadow-[0_0_8px_rgba(132,204,22,0.6)]"></div>
                    )}

                    <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-lime-600" : "text-slate-400 group-hover:text-slate-700"}`} />

                    {link.title}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-auto">
            {/* PROFILE SECTION */}
            {(profile || getStoredNostrUser()) && (
              <div className="flex items-center gap-4 px-5 py-4 mb-4 bg-slate-50/50 rounded-3xl border border-slate-100 mt-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-lime-100 flex items-center justify-center font-bold text-lime-700 border-2 border-white shadow-sm">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover" />
                    ) : (
                        profile?.full_name?.charAt(0) || "U"
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                        {profile?.full_name || (getStoredNostrUser() ? "Nostr User" : "User")}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate font-medium uppercase tracking-wider">
                        {profile?.category || (getStoredNostrUser()?.npub.substring(0, 10) + "...") || "Pro Account"}
                    </p>
                </div>
              </div>
            )}

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              className="
                flex
                items-center
                gap-4
                px-5
                py-4
                rounded-3xl
                text-red-500
                hover:bg-red-50
                transition
                font-medium
                w-full
              "
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}