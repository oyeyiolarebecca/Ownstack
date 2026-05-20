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

    if (activities.length === 0) {
        // Fallback or placeholder if no invoices
        activities.push({
            title: "No Activity",
            description: "Your recent activities will appear here",
            time: "Now",
            icon: Receipt,
            status: "neutral",
        });
    }

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
                            Recent Activity
                        </p>

                        <h2 className="text-3xl font-bold text-[#0F172A] mt-2">
                            Transactions
                        </h2>
                    </div>

                    <button
                        className="
              text-lime-600
              font-semibold
              hover:text-lime-700
              transition
            "
                    >
                        View All
                    </button>

                </div>

                {/* ACTIVITIES */}
                <div className="space-y-5 mt-10">

                    {activities.map((activity, index) => {
                        const Icon = activity.icon;

                        return (
                            <div
                                key={index}
                                className="
                  flex
                  items-center
                  justify-between
                  border
                  border-gray-100
                  rounded-3xl
                  p-5
                  hover:bg-lime-50/40
                  transition
                "
                            >

                                <div className="flex items-center gap-4">

                                    <div
                                        className={`
                      w-14
                      h-14
                      rounded-2xl
                      flex
                      items-center
                      justify-center
                      ${activity.status === "success"
                                                ? "bg-lime-100 text-lime-700"
                                                : activity.status === "warning"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-slate-100 text-slate-700"
                                            }
                    `}
                                    >
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-[#0F172A]">
                                            {activity.title}
                                        </h3>

                                        <p className="text-slate-500 mt-1">
                                            {activity.description}
                                        </p>
                                    </div>

                                </div>

                                <p className="text-sm text-slate-400">
                                    {activity.time}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>

        </section>
    );
}