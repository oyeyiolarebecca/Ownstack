import { Wallet, FileText, Clock } from "lucide-react";
import { Invoice } from "@/lib/types";

interface StatsCardsProps {
  invoices: Invoice[];
}

export default function StatsCards({ invoices }: StatsCardsProps) {
  
  const totalRevenue = invoices.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
  const pendingCount = invoices.filter(inv => inv.status !== "Paid").length;

  const stats = [
    {
      title: "Total Revenue",
      value: `${totalRevenue.toLocaleString()} sats`,
      icon: Wallet,
      color: "text-lime-600",
      bg: "bg-lime-50"
    },
    {
      title: "All Invoices",
      value: invoices.length.toString(),
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Pending",
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
  ];

  return (
    <section className="grid md:grid-cols-3 gap-6 mt-10">

      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="
              group
              bg-white
              border border-slate-100
              rounded-[2.5rem]
              p-8
              shadow-sm
              hover:shadow-md
              hover:-translate-y-1
              transition-all
              duration-300
              flex
              flex-col
              gap-6
            "
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                {stat.title}
              </p>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </h2>
            </div>
          </div>
        );
      })}

    </section>
  );
}