"use client";

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const data = [
    { month: "Jan", revenue: 1200 },
    { month: "Feb", revenue: 2100 },
    { month: "Mar", revenue: 1800 },
    { month: "Apr", revenue: 3200 },
    { month: "May", revenue: 4200 },
    { month: "Jun", revenue: 5100 },
];

import { Invoice } from "@/lib/types";

interface RevenueChartProps {
    invoices: Invoice[];
}

export default function RevenueChart({ invoices }: RevenueChartProps) {
    // TOTAL REVENUE calculation
    const totalRevenue = invoices.reduce((acc: number, inv: Invoice) => acc + Number(inv.amount), 0);

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
                            Satoshi inflow performance
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
                        Total: {totalRevenue.toLocaleString()} <span className="text-lime-400 text-[10px] uppercase font-black">sats</span>
                    </div>
                </div>

                {/* CHART */}
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
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