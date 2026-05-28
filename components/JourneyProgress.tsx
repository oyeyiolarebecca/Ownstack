"use client";

import Link from "next/link";
import { BadgeCheck, Check, FileText, ReceiptText, Store } from "lucide-react";
import { BusinessProfile, Invoice } from "@/lib/types";
import { isPaidStatus } from "@/lib/businessData";

interface JourneyProgressProps {
  profile?: BusinessProfile | null;
  invoices: Invoice[];
  vaultCount: number;
}

export default function JourneyProgress({ profile, invoices, vaultCount }: JourneyProgressProps) {
  const hasProfile = Boolean(profile?.business_name?.trim() && profile?.lightning_username?.trim());
  const hasInvoice = invoices.length > 0;
  const hasPaidInvoice = invoices.some((invoice) => isPaidStatus(invoice.status));
  const hasVaultRecord = vaultCount > 0;

  const steps = [
    {
      title: "Business identity",
      detail: hasProfile ? profile?.business_name || "Profile ready" : "Add name and payment details",
      complete: hasProfile,
      href: "/profile",
      icon: Store,
    },
    {
      title: "First invoice",
      detail: hasInvoice ? `${invoices.length} transaction record${invoices.length === 1 ? "" : "s"}` : "Create a customer invoice",
      complete: hasInvoice,
      href: "/invoice",
      icon: FileText,
    },
    {
      title: "Payment proof",
      detail: hasPaidInvoice ? "At least one invoice is paid" : "Mark a completed payment",
      complete: hasPaidInvoice,
      href: "/history",
      icon: BadgeCheck,
    },
    {
      title: "Vault record",
      detail: hasVaultRecord ? `${vaultCount} saved document${vaultCount === 1 ? "" : "s"}` : "Store a receipt or permit",
      complete: hasVaultRecord,
      href: "/vault",
      icon: ReceiptText,
    },
  ];

  const nextStep = steps.find((step) => !step.complete) || steps[steps.length - 1];
  const completedCount = steps.filter((step) => step.complete).length;

  return (
    <section className="mt-8 rounded-[32px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-lime-600">MVP Journey</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Get the business ready for a live demo</h2>
        </div>
        <Link href={nextStep.href} className="inline-flex w-fit items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          {completedCount === steps.length ? "Review Vault" : `Next: ${nextStep.title}`}
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link key={step.title} href={step.href} className={`rounded-3xl border p-4 transition hover:border-lime-200 hover:bg-lime-50/30 ${step.complete ? "border-lime-100 bg-lime-50/50" : "border-slate-100 bg-slate-50/60"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${step.complete ? "bg-lime-500 text-white" : "bg-white text-slate-400"}`}>
                  {step.complete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${step.complete ? "bg-white text-lime-700" : "bg-white text-slate-400"}`}>
                  {step.complete ? "Done" : "Open"}
                </span>
              </div>
              <h3 className="mt-4 font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{step.detail}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
