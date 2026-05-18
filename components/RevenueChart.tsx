"use client";

import {
    AreaChart,
    Area,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

const data = [
    {
        month: "Jan",
        revenue: 1200,
    },
    {
        month: "Feb",
        revenue: 2100,
    },
    {
        month: "Mar",
        revenue: 1800,
    },
    {
        month: "Apr",
        revenue: 3200,
    },
    {
        month: "May",
        revenue: 4200,
    },
    {
        month: "Jun",
        revenue: 5100,
    },
];

export default function RevenueChart() {
    return (
        <section className="mt-10">

            <div
                className="
          bg-white/80
          backdrop-blur-md
          border
          border-white
          rounded-[32px]
          p-8
          shadow-sm
        "
            >

                {/* HEADER */}
                <div className="flex items-center justify-between">

                    <div>
                        <p className="text-slate-500 font-medium">
                            Revenue Analytics
                        </p>

                        <h2 className="text-3xl font-bold text-[#0F172A] mt-2">
                            BTC Revenue Growth
                        </h2>
                    </div>

                    <div
                        className="
              bg-lime-100
              text-lime-700
              px-4
              py-2
              rounded-2xl
              text-sm
              font-semibold
            "
                    >
                        +18.2%
                    </div>

                </div>

                {/* CHART */}
                <div className="h-[320px] mt-10">

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
                                        stopColor="#84cc16"
                                        stopOpacity={0.4}
                                    />

                                    <stop
                                        offset="95%"
                                        stopColor="#84cc16"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#84cc16"
                                strokeWidth={4}
                                fill="url(#colorRevenue)"
                            />

                        </AreaChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </section>
    );
}