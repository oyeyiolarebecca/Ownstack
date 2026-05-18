export default function RecentInvoices() {
  const invoices = [
    {
      customer: "David",
      amount: "25,000 sats",
      status: "Paid",
    },
    {
      customer: "Sarah",
      amount: "12,000 sats",
      status: "Pending",
    },
  ];

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

          {invoices.map((invoice, index) => (
            <div
              key={index}
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
                  {invoice.amount}
                </p>
              </div>

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

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}