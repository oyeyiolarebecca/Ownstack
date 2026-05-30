"use client";
import { Invoice } from "@/lib/types";
import Link from "next/link";
import { Check, ExternalLink, FileText } from "lucide-react";
import { formatLocalAmount, getInvoiceSats, isPaidStatus, paymentMethodLabels } from "@/lib/businessData";

interface RecentInvoicesProps {
  invoices: Invoice[];
  onUpdateStatus?: (id: Invoice["id"], status: string) => void;
  limit?: number;
}

export default function RecentInvoices({ invoices, onUpdateStatus, limit }: RecentInvoicesProps) {
  const displayInvoices = limit ? invoices.slice(0, limit) : invoices;

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-100 text-blue-600', 'bg-lime-100 text-lime-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-pink-100 text-pink-600'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div
      className="
        bg-white
        rounded-[2.5rem]
        p-8
        border border-slate-100
        shadow-sm
      "
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Recent Invoices
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
             Manage your latest transaction records
          </p>
        </div>

        {limit && (
           <Link 
             href="/history" 
             className="text-lime-600 hover:text-lime-700 text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
           >
             View All →
           </Link>
        )}
      </div>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="py-16 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 text-slate-300">
               <FileText size={28} />
             </div>
             <p className="text-slate-900 font-bold">No Invoices Yet</p>
             <p className="text-slate-400 text-xs mt-1 max-w-[200px] mx-auto">
               Your transaction history will appear here once you create your first invoice.
             </p>
          </div>
        ) : (
          displayInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="
                group
                flex
                items-center
                justify-between
                p-4
                rounded-3xl
                hover:bg-slate-50/80
                transition-all
                duration-300
                border border-transparent
                hover:border-slate-100
              "
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105 duration-300 ${getAvatarColor(invoice.customer)}`}>
                  {invoice.customer.charAt(0)}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    {invoice.customer}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium">
                    {invoice.service}
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">
                    {formatLocalAmount(invoice.local_amount ?? invoice.amount, invoice.currency)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    {getInvoiceSats(invoice).toLocaleString()} sats • {paymentMethodLabels[invoice.payment_method || "lightning"] || "Payment"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/invoice/${invoice.id}`}
                    className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-slate-400 transition-all active:scale-90"
                    title="Open invoice"
                  >
                    <ExternalLink size={15} strokeWidth={2.5} />
                  </Link>
                  <span
                    className={`
                      min-w-[80px]
                      text-[11px]
                      px-4
                      py-1.5
                      rounded-full
                      font-bold
                      text-center
                      ${isPaidStatus(invoice.status)
                          ? "bg-lime-100 text-lime-700"
                          : "bg-orange-100 text-orange-700"}
                    `}
                  >
                    {invoice.status}
                  </span>

                  {!isPaidStatus(invoice.status) && onUpdateStatus && (
                    <button 
                      onClick={() => onUpdateStatus(invoice.id, "Paid")}
                      className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-lime-500 hover:text-white rounded-xl text-slate-400 transition-all active:scale-90"
                      title="Mark as Paid"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}