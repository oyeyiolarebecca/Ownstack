"use client";

import { Invoice } from "@/lib/types";
import { formatLocalAmount, getInvoiceLocalAmount, isPaidStatus } from "@/lib/businessData";

interface RevenueChartProps {
  invoices: Invoice[];
}

export default function RevenueChart({ invoices }: RevenueChartProps) {
  const monthlyData = [
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: 0 },
  ];

  const paidInvoices = invoices.filter((invoice) => isPaidStatus(invoice.status));

  paidInvoices.forEach((invoice) => {
    if (!invoice.created_at) return;
    const monthIndex = new Date(invoice.created_at).getMonth();
    if (monthIndex >= 0 && monthIndex < monthlyData.length) {
      monthlyData[monthIndex].revenue += getInvoiceLocalAmount(invoice);
    }
  });

  const primaryCurrency = paidInvoices[0]?.currency || invoices[0]?.currency || "NGN";
  const totalRevenue = paidInvoices
    .filter((invoice) => (invoice.currency || primaryCurrency) === primaryCurrency)
    .reduce((acc, invoice) => acc + getInvoiceLocalAmount(invoice), 0);
  const maxRevenue = Math.max(...monthlyData.map((item) => item.revenue), 1);

  return (
    <section className="mt-8">
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]">Revenue Insights</h2>
            <p className="text-slate-500 text-xs font-medium mt-1">Naira inflow performance</p>
          </div>

          <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-slate-200">
            Total: {formatLocalAmount(totalRevenue, primaryCurrency)}
          </div>
        </div>

        <div className="h-[350px] min-h-[350px] w-full rounded-[2rem] bg-gradient-to-b from-lime-50/80 to-white border border-lime-50 px-4 py-6 sm:px-8">
          <div className="flex h-full items-end justify-between gap-3 sm:gap-5">
            {monthlyData.map((item) => {
              const height = Math.max(8, Math.round((item.revenue / maxRevenue) * 100));

              return (
                <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3">
                  <div className="flex h-full w-full items-end justify-center rounded-full bg-white/70 px-1 shadow-inner shadow-lime-100/40">
                    <div
                      className="w-full max-w-12 rounded-full bg-lime-400 shadow-lg shadow-lime-200 transition-all duration-700"
                      style={{ height: height + "%" }}
                      title={item.month + ": " + formatLocalAmount(item.revenue, primaryCurrency)}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.month}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-600">{formatLocalAmount(item.revenue, primaryCurrency)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
