/* eslint-disable @next/next/no-img-element */
"use client";

import {
    ShieldCheck,
    Bitcoin,
    BadgeCheck,
    Radio,
} from "lucide-react";
import { BusinessProfile } from "@/lib/types";

interface BusinessProfileCardProps {
    profile?: BusinessProfile | null;
    invoices: {
        customer: string;
        amount: number;
    }[];
}

export default function BusinessProfileCard({
    profile,
    invoices,
}: BusinessProfileCardProps) {

    const totalRevenue = invoices.reduce(
        (acc, invoice) => acc + Number(invoice.amount),
        0
    );

    const trustScore =
        invoices.length > 15
            ? "Elite"
            : invoices.length > 8
                ? "Trusted"
                : "Growing";

    return (
        <section className="mt-8">

            <div
                className="
          bg-white
          border
          border-gray-200
          rounded-[32px]
          p-8
          shadow-sm
        "
            >

                <div className="flex items-start justify-between">

                    {/* LEFT */}
                    <div className="flex items-center gap-5">

                        <div
                            className="
                                w-24
                                h-24
                                rounded-3xl
                                bg-lime-100
                                overflow-hidden
                                flex
                                items-center
                                justify-center
                                text-3xl
                                font-bold
                                text-lime-700
                                border-4
                                border-white
                                shadow-sm
                            "
                        >
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover" />
                            ) : (
                                profile?.business_name?.charAt(0) || "S"
                            )}
                        </div>

                        <div>

                            <p className="text-slate-500 font-medium">
                                Business Identity
                            </p>

                            <h2 className="text-3xl font-bold text-[#0F172A] mt-1">
                                {profile?.business_name || "Sheowns Studio"}
                            </h2>

                            <p className="text-slate-500 mt-2">
                                {profile?.category || "Women-led Business"}
                            </p>

                            {profile?.bio && (
                                <p className="text-slate-500 mt-3 max-w-xl text-sm leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-2 mt-4">

                                <ShieldCheck
                                    className="text-lime-600"
                                    size={18}
                                />

                                <span className="text-sm font-medium text-lime-700">
                                    Verified Business
                                </span>

                            </div>

                        </div>

                    </div>

                    {/* TRUST BADGE */}
                    <div
                        className="
              bg-lime-100
              text-lime-700
              px-5
              py-3
              rounded-2xl
              font-semibold
              text-sm
            "
                    >
                        {trustScore} Merchant
                    </div>

                </div>

                {/* STATS */}
                <div className="grid md:grid-cols-3 gap-5 mt-10">

                    <div
                        className="
              border
              border-gray-100
              rounded-3xl
              p-5
            "
                    >

                        <div className="flex items-center gap-3">

                            <BadgeCheck
                                className="text-lime-600"
                                size={22}
                            />

                            <p className="text-slate-500">
                                Total Invoices
                            </p>

                        </div>

                        <h3 className="text-3xl font-bold mt-5 text-[#0F172A]">
                            {invoices.length}
                        </h3>

                    </div>

                    <div
                        className="
              border
              border-gray-100
              rounded-3xl
              p-5
            "
                    >

                        <div className="flex items-center gap-3">

                            <Bitcoin
                                className="text-lime-600"
                                size={22}
                            />

                            <p className="text-slate-500">
                                Revenue
                            </p>

                        </div>

                        <h3 className="text-3xl font-bold mt-5 text-[#0F172A]">
                            {totalRevenue} sats
                        </h3>

                    </div>

                    <div
                        className="
              border
              border-gray-100
              rounded-3xl
              p-5
            "
                    >

                        <div className="flex items-center gap-3">
                            <Radio
                                className="text-lime-600"
                                size={22}
                            />

                            <p className="text-slate-500">
                                Bitcoin Identity
                            </p>
                        </div>

                        <h3 className="text-base font-bold mt-5 text-[#0F172A] break-all">
                            {profile?.lightning_username || "sheowns@lightning"}
                        </h3>

                        {profile?.nostr_npub && (
                            <p className="text-[10px] font-medium text-slate-400 mt-2 break-all">
                                {profile.nostr_npub}
                            </p>
                        )}

                    </div>

                </div>

            </div>

        </section>
    );
}