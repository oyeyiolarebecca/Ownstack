import {
    ArrowDownLeft,
    ArrowUpRight,
    Receipt,
} from "lucide-react";

export default function ActivityFeed() {
    const activities = [
        {
            title: "Invoice Paid",
            description: "David paid 25,000 sats",
            time: "2 mins ago",
            icon: ArrowDownLeft,
            status: "success",
        },
        {
            title: "New Invoice Created",
            description: "Invoice for Sarah generated",
            time: "10 mins ago",
            icon: Receipt,
            status: "neutral",
        },
        {
            title: "BTC Withdrawal",
            description: "0.002 BTC withdrawn",
            time: "1 hour ago",
            icon: ArrowUpRight,
            status: "warning",
        },
    ];

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