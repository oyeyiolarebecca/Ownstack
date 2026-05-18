import {
  ShieldCheck,
  Bitcoin,
  FileText,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Business Identity",
      description:
        "Create a portable and self-sovereign business profile for your brand.",
      icon: ShieldCheck,
    },
    {
      title: "Lightning Payments",
      description:
        "Receive fast Bitcoin payments through Lightning QR invoices.",
      icon: Bitcoin,
    },
    {
      title: "Invoice Tracking",
      description:
        "Generate and manage invoices independently with secure records.",
      icon: FileText,
    },
  ];

  return (
    <section className="px-6 py-24 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          {/* <p className="text-lime-500 font-semibold uppercase tracking-wider">
          </p> */}

          <h2 className="text-5xl font-bold mt-4 leading-tight text-[#0F172A]">
            Everything you need to run independently
          </h2>

          {/* <p className="text-slate-500 text-lg mt-6 leading-relaxed">
            OwnStack gives entrepreneurs modern Bitcoin-native tools
            to manage payments, invoices, and business identity.
          </p> */}
        </div>

        {/* FEATURE CARDS */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="
                  bg-white/80
                  backdrop-blur-md
                  border
                  border-gray-200
                  rounded-3xl
                  p-8
                  shadow-sm
                  hover:shadow-2xl
                  hover:-translate-y-2
                  transition
                  duration-300
                "
              >

                {/* ICON CONTAINER */}
                <div className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-lime-100
                  flex
                  items-center
                  justify-center
                ">
                  <Icon className="w-8 h-8 text-lime-500" />
                </div>

                {/* TITLE */}
                <h3 className="text-2xl font-semibold mt-8 text-[#0F172A]">
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-slate-500 mt-5 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* SMALL FOOTER */}
                <div className="mt-8 flex items-center gap-2 text-sm text-lime-600 font-medium">
                  <span>Learn more</span>
                  <span>→</span>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}