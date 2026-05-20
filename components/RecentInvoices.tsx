import { Invoice } from "@/lib/types";

interface RecentInvoicesProps {
  invoices: Invoice[];
  onUpdateStatus?: (id: number, status: string) => void;
  limit?: number;
}

export default function RecentInvoices({ invoices, onUpdateStatus, limit }: RecentInvoicesProps) {
  const displayInvoices = limit ? invoices.slice(0, limit) : invoices;

  return (
    <section className="mt-10">

      <div className="
        bg-white
        border
        text-lime-500
        border-gray-200
        rounded-3xl
        p-6
        shadow-sm
      ">

        <div className="flex items-center justify-between">

          <h2 className="text-lime-500 font-bold">
            Recent Invoices
          </h2>

          <button className="text-lime-500 font-medium">
            View All
          </button>

        </div>

        <div className="mt-8 space-y-4">

          {displayInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="
                flex
                items-center
                justify-between
                border
                border-gray-100
                rounded-2xl
                p-4
              "
            >

              <div>
                <h3 className="font-semibold">
                  {invoice.customer}
                </h3>

                <p className="text-slate-500 text-sm mt-1">
                  {invoice.amount} sats • {invoice.service}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    font-medium
                    ${
                      invoice.status === "Paid"
                        ? "bg-lime-100 text-lime-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  `}
                >
                  {invoice.status}
                </div>
                
                {invoice.status !== "Paid" && onUpdateStatus && (
                  <button 
                    onClick={() => onUpdateStatus(invoice.id, "Paid")}
                    className="p-2 hover:bg-lime-50 rounded-lg text-lime-600 transition"
                    title="Mark as Paid"
                  >
                    ✅
                  </button>
                )}
              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}