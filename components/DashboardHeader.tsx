"use client";
import Link from "next/link";
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardHeader() {
  const greeting = getGreeting();

  return (
    <div className="flex items-center justify-between">

      <div>
        <p className="text-slate-500 font-medium">
          {greeting},
        </p>

        <h1 className="text-4xl text-[#0F172A] font-bold mt-2">
          Dashboard
        </h1>
      </div>

      <Link
        href="/invoice"
        className="
          bg-lime-400
          hover:bg-lime-300
          transition
          px-6
          py-3
          rounded-2xl
          font-semibold
          text-black
          shadow-sm
        "
      >
        Create Invoice
      </Link>

    </div>
  );
}