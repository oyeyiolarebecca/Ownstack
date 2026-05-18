export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <div>
          <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-400 px-4 py-2 rounded-full text-sm">
            ⚡ Bitcoin-native business infrastructure
          </div>

          <h1 className="text-6xl lg:text-7xl font-bold leading-tight mt-8">
            Own your
            <span className="text-lime-400"> business </span>
            infrastructure.
          </h1>

          <p className="text-slate-500 text-lg mt-8 max-w-xl leading-relaxed">
            Modern tools for entrepreneurs to manage invoices,
            Lightning payments, and business identity independently.
          </p>

          <div className="flex gap-4 mt-10">
            <button className="bg-lime-400 text-black px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition">
              Get Started
            </button>

            {/* <button className="border border-neutral-700 px-8 py-4 rounded-2xl hover:border-lime-400 transition">
              Watch Demo
            </button> */}
          </div>

          <div className="flex items-center gap-4 mt-10 text-sm text-neutral-500">
            <p>⚡ Lightning Payments</p>
            <p>🔐 Self-Sovereign Identity</p>
          </div>
        </div>

        {/* RIGHT MOCKUP */}
        <div className="relative flex justify-center">

          <div className="bg-white border border-gray-200 rounded-[40px] p-6 w-[340px] shadow-2xl">

            <div className="bg-[#F8FAFC] rounded-[30px] p-6">

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-neutral-400 text-sm">
                    Business Balance
                  </p>

                  <h2 className="text-4xl font-bold mt-2">
                    ₿ 0.248
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400">
                  ⚡
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-8">
                <div className="flex justify-between text-sm">
                  <p className="text-neutral-400">
                    Invoice Paid
                  </p>

                  <p className="text-lime-400">
                    +25,000 sats
                  </p>
                </div>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-4 mt-4">
                <div className="flex justify-between text-sm">
                  <p className="text-neutral-400">
                    Pending Invoice
                  </p>

                  <p className="text-yellow-400">
                    12,000 sats
                  </p>
                </div>
              </div>

              <button className="w-full bg-lime-400 text-black py-4 rounded-2xl font-semibold mt-8">
                Create Invoice
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}