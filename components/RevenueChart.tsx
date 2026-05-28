"use client";

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

import { Invoice } from "@/lib/types";
import { formatLocalAmount, getInvoiceLocalAmount, isPaidStatus } from "@/lib/businessData";

interface RevenueChartProps {
    invoices: Invoice[];
}

export default function RevenueChart({ invoices }: RevenueChartProps) {
    // Process real data for the chart
    const monthlyData = [
        { month: "Jan", revenue: 0 },
        { month: "Feb", revenue: 0 },
        { month: "Mar", revenue: 0 },
        { month: "Apr", revenue: 0 },
        { month: "May", revenue: 0 },
        { month: "Jun", revenue: 0 },
    ];

    const paidInvoices = invoices.filter((inv) => isPaidStatus(inv.status));
    
    // Fill buckets
    paidInvoices.forEach(inv => {
        if (!inv.created_at) return;
        const date = new Date(inv.created_at);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 6) {
            monthlyData[monthIndex].revenue += getInvoiceLocalAmount(inv);
        }
    });

    const primaryCurrency = paidInvoices[0]?.currency || invoices[0]?.currency || "NGN";
    const totalRevenue = paidInvoices
        .filter((inv) => (inv.currency || primaryCurrency) === primaryCurrency)
        .reduce((acc: number, inv: Invoice) => acc + getInvoiceLocalAmount(inv), 0);

    return (
        <section className="mt-8">
            <div
                className="
                  bg-white
                  border border-slate-100
                  rounded-[2.5rem]
                  p-8
                  shadow-sm
                "
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-xl font-bold text-[#0F172A]">
                            Revenue Insights
                        </h2>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                            Naira inflow performance
                        </p>
                    </div>

                    <div
                        className="
                          bg-slate-900
                          text-white
                          px-5
                          py-2.5
                          rounded-2xl
                          text-xs
                          font-bold
                          flex items-center gap-2
                          shadow-lg shadow-slate-200
                        "
                    >
                        Total: {formatLocalAmount(totalRevenue, primaryCurrency)}
                    </div>
                </div>

                {/* CHART */}
                <div className="h-[350px] min-h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <AreaChart data={monthlyData}>
                            <defs>
                                <linearGradient
                                    id="colorRevenue"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#a3e635"
                                        stopOpacity={0.4}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#a3e635"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '20px', 
                                    border: 'none', 
                                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                    padding: '16px',
                                    fontSize: '12px'
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#84cc16"
                                strokeWidth={3}
                                fill="url(#colorRevenue)"
                                animationDuration={1500}
                                dot={{ r: 4, fill: '#84cc16', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}