export default function Stats() {
  const stats = [
    {
      number: "12K+",
      label: "Invoices Generated",
    },
    {
      number: "4.8 BTC",
      label: "Payments Processed",
    },
    {
      number: "1,200+",
      label: "Entrepreneurs Onboarded",
    },
    {
      number: "99%",
      label: "Payment Success Rate",
    },
  ];

  return (
    <section className="px-6 py-28 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">

        <div className="
          bg-white border
          border-gray-200
          rounded-[40px]
          p-10
          shadow-sm
        ">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">

            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
              >
                <h2 className="text-5xl font-bold text-lime-500">
                  {stat.number}
                </h2>

                <p className="text-slate-500 mt-4 text-lg">
                  {stat.label}
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
}