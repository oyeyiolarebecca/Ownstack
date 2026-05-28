export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Business Profile",
      description:
        "Set up your business identity with a Lightning address and business details.",
    },
    {
      number: "02",
      title: "Generate Invoices",
      description:
        "Create professional Bitcoin-native invoices for customers in seconds.",
    },
    {
      number: "03",
      title: "Receive Lightning Payments",
      description:
        "Customers scan your QR code and pay instantly through Lightning.",
    },
    {
        number: "04",
        title: "Payment Proof",
        description:
        "Payment proof is stored as a signed and timestamped business record."
    }
  ];

  return (
    <section className="px-6 py-28 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="max-w-3xl">
          <p className="text-lime-500 font-semibold uppercase tracking-wider">
            How It Works
          </p>

          <h2 className="text-5xl font-bold mt-4 text-[#0F172A] leading-tight">
            Simple workflow for modern entrepreneurs
          </h2>

          <p className="text-slate-500 text-lg mt-6 leading-relaxed">
            OwnStack simplifies business payments and ownership
            into a fast and intuitive experience.
          </p>
        </div>

        {/* STEPS */}
        <div className="grid lg:grid-cols-3 gap-8 mt-20">

          {steps.map((step, index) => (
            <div
              key={index}
              className="
                relative
                bg-[#F8FAFC]
                border
                border-gray-200
                rounded-3xl
                p-8
                shadow-sm
                hover:shadow-xl
                transition
                duration-300
              "
            >

              {/* NUMBER */}
              <div className="
                w-14
                h-14
                rounded-2xl
                bg-lime-400
                text-black
                flex
                items-center
                justify-center
                font-bold
                text-lg
              ">
                {step.number}
              </div>

              {/* CONTENT */}
              <h3 className="text-2xl font-semibold mt-8 text-[#0F172A]">
                {step.title}
              </h3>

              <p className="text-slate-500 mt-5 leading-relaxed text-lg">
                {step.description}
              </p>

              {/* LINE */}
              <div className="absolute top-10 right-8 text-lime-200 text-6xl font-bold">
                →
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}