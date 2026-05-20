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
} from "lucide-react";

interface SidebarProps {
  profile?: any;
}

export default function Sidebar({ profile }: SidebarProps) {

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
    <aside
      className="
        hidden
        md:flex
        flex-col
        justify-between
        w-72
        border-r
        border-white
        bg-white/70
        backdrop-blur-md
        p-6
      "
    >

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
                className={`
                  w-full
                  flex
                  items-center
                  gap-4
                  px-5
                  py-4
                  rounded-3xl
                  transition
                  font-medium
                  ${isActive
                    ? "bg-lime-100 text-lime-700"
                    : "hover:bg-lime-50 text-slate-700"
                  }
                `}
              >

                <Icon className="w-5 h-5" />

                {link.title}

              </Link>
            );
          })}

        </div>

      </div>

      <div>
        {/* PROFILE SECTION */}
        {(profile || getStoredNostrUser()) && (
          <div className="flex items-center gap-4 px-5 py-4 mb-4 bg-slate-50/50 rounded-3xl border border-slate-100">
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
          "
        >

          <LogOut className="w-5 h-5" />

          Logout

        </button>
      </div>

    </aside>
  );
}