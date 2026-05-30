"use client";

import { Users, BarChart3, Zap, Globe } from "lucide-react";

export default function StatsBar() {
  const stats = [
    {
      label: "Active Entrepreneurs",
      value: "500+",
      icon: Users,
    },
    {
      label: "Value Transacted",
      value: "₦2.5M+",
      icon: BarChart3,
    },
    {
      label: "Invoices Created",
      value: "1,200+",
      icon: Zap,
    },
    {
      label: "Continents",
      value: "3+",
      icon: Globe,
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-100 rounded-[32px] p-8 md:p-12 shadow-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-6 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center shrink-0">
              <stat.icon className="w-8 h-8 text-lime-500" />
            </div>
            <div>
              <p className="text-4xl font-bold text-[#0F172A]">{stat.value}</p>
              <p className="text-slate-400 text-sm font-semibold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
