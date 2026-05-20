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
              bg-white
              border
              border-gray-100
              rounded-[32px]
              p-8
              shadow-sm
              flex
              items-center
              gap-6
            "
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <Icon size={24} />
            </div>

            <div>
              <p className="text-slate-500 font-medium">
                {stat.title}
              </p>

              <h2 className="text-3xl font-bold mt-1 text-[#0F172A]">
                {stat.value}
              </h2>
            </div>

          </div>
        );
      })}

    </section>
  );
}