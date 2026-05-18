export default function StatsCards() {
  const stats = [
    {
      title: "Total Revenue",
      value: "₿ 0.248",
    },
    {
      title: "Invoices",
      value: "124",
    },
    {
      title: "Pending Payments",
      value: "18",
    },
  ];

  return (
    <section className="grid md:grid-cols-3 gap-6 mt-10">

      {stats.map((stat, index) => (
        <div
          key={index}
          className="
            bg-white
            border
            text-lime-500
            border-gray-200
            rounded-3xl
            p-6
            shadow-sm
          "
        >

          <p className="text-slate-500">
            {stat.title}
          </p>

          <h2 className="text-4xl font-bold mt-4">
            {stat.value}
          </h2>

        </div>
      ))}

    </section>
  );
}