"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Wallet,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Invoices",
      icon: FileText,
      href: "/invoice",
    },
    {
      title: "Payments",
      icon: Wallet,
      href: "/payments",
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
        w-72
        border-r
        border-white
        bg-white/70
        backdrop-blur-md
        p-6
      "
    >

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

        {links.map((link, index) => {
          const Icon = link.icon;

          const isActive = pathname === link.href;

          return (
            <Link
              key={index}
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

    </aside>
  );
}