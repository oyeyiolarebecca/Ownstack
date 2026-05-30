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
    <section id="features" className="px-6 py-32 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto">

        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-white font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider mb-6">
            <span className="w-2 h-2 bg-lime-400 rounded-full"></span>
            Core Features
          </div>

          <h2 className="text-5xl lg:text-6xl font-black mt-4 leading-tight text-[#0F172A] tracking-tight">
            Everything you need to <br/>
            <span className="text-lime-600">run independently.</span>
          </h2>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className="
                  group
                  bg-white
                  border
                  border-slate-200
                  rounded-[40px]
                  p-10
                  shadow-sm
                   hover:shadow-2xl hover:shadow-lime-500/10
                  hover:-translate-y-2
                  transition-all
                  duration-500
                  relative
                  overflow-hidden
                "
              >
                {/* Subtle hover background highlight */}
                <div className="absolute top-0 right-0 -m-10 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl group-hover:bg-lime-400/20 transition-all duration-500"></div>

                {/* ICON CONTAINER */}
                <div className="
                  w-20
                  h-20
                  rounded-3xl
                  bg-gradient-to-br from-lime-300 to-lime-500
                  flex
                  items-center
                  justify-center
                  shadow-inner
                  mb-8
                  text-white
                ">
                  <Icon className="w-10 h-10" />
                </div>

                {/* TITLE */}
                <h3 className="text-3xl font-bold text-[#0F172A]">
                  {feature.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-slate-500 mt-4 leading-relaxed text-lg">
                  {feature.description}
                </p>

                {/* SMALL FOOTER */}
                <div className="mt-10 flex items-center gap-3 text-sm text-lime-700 font-bold uppercase tracking-widest group-hover:text-lime-600 transition-colors cursor-pointer">
                  Learn more
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}