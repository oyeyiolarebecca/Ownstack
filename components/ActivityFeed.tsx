import {
    ArrowDownLeft,
    ArrowUpRight,
    Receipt,
} from "lucide-react";

import { Invoice } from "@/lib/types";

interface ActivityFeedProps {
    invoices: Invoice[];
}

export default function ActivityFeed({ invoices }: ActivityFeedProps) {
    // Transform invoices into activity format
    const activities = invoices.slice(0, 5).map(inv => ({
        title: inv.status === "Paid" ? "Invoice Paid" : "New Invoice Created",
        description: `${inv.customer} - ${inv.amount} sats`,
        time: inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "Recently",
        icon: inv.status === "Paid" ? ArrowDownLeft : Receipt,
        status: inv.status === "Paid" ? "success" : "neutral",
    }));

    const noActivity = activities.length === 0;

    return (
        <section>
            <div
                className="
                  bg-white
                  rounded-[2.5rem]
                  p-8
                  border border-slate-100
                  shadow-sm
                  h-full
                "
            >
                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Activity Pulse
                        </h2>
                        <p className="text-slate-400 text-xs font-medium mt-1">
                             Live highlights
                        </p>
                    </div>
                </div>

                {/* ACTIVITIES - Timeline Layout */}
                <div className="relative space-y-8 pl-2">
                    {/* Vertical Line */}
                    <div className="absolute left-7 top-2 bottom-2 w-[1px] bg-slate-100 border-l border-dashed border-slate-200"></div>

                    {noActivity ? (
                        <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl mx-auto mb-3 shadow-sm border border-slate-100">
                               📡
                             </div>
                             <p className="text-slate-900 font-bold text-xs">Waiting for Pulse</p>
                             <p className="text-slate-400 text-[10px] mt-1 max-w-[150px] mx-auto">
                               Activities will stream here in real-time.
                             </p>
                        </div>
                    ) : (
                        activities.map((activity, index) => {
                            const Icon = activity.icon;

                            return (
                                <div
                                    key={index}
                                    className="relative flex items-start gap-4 group"
                                >
                                    {/* Icon Circle */}
                                    <div
                                        className={`
                                            relative z-10
                                            w-10
                                            h-10
                                            rounded-2xl
                                            flex
                                            items-center
                                            justify-center
                                            transition-all
                                            duration-300
                                            group-hover:scale-110
                                            ${activity.status === "success"
                                                ? "bg-lime-100 text-lime-700"
                                                : "bg-slate-100 text-slate-700"
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 pt-0.5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 text-sm">
                                                {activity.title}
                                            </h3>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                {activity.time}
                                            </span>
                                        </div>

                                        <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                                            {activity.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}

                </div>

            </div>
        </section>
    );
}