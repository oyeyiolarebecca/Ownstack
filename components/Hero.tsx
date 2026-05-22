"use client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-12">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT CONTENT */}
        <div>
          <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-600 font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider">
            ⚡ Bitcoin-native business infrastructure
          </div>

          <h1 className="text-6xl lg:text-[84px] font-black leading-[1.05] mt-8 text-[#0F172A] tracking-tight">
            Own your business.<br />
            <span className="text-lime-500">Run it independently.</span>
          </h1>

          <p className="text-slate-500 text-xl mt-8 max-w-xl leading-relaxed font-medium">
            Bitcoin-native tools to help entrepreneurs create, manage, and grow their business with full ownership of their data, payments, and identity.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <button className="bg-lime-400 hover:bg-lime-300 text-black px-10 py-5 rounded-2xl font-black text-lg transition shadow-[0_8px_20px_-4px_rgba(163,230,53,0.5)] flex items-center gap-2 group">
              Get Started Free
              <span className="group-hover:translate-x-1 transition">→</span>
            </button>

            <button className="bg-white border border-slate-200 hover:border-slate-300 text-[#0F172A] px-10 py-5 rounded-2xl font-black text-lg transition flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-xs group-hover:bg-slate-50">▶</span>
              Watch Demo
            </button>
          </div>

          {/* BADGES */}
          <div className="flex flex-wrap items-center gap-4 mt-12">
            {[
              { icon: "🛡️", text: "You own your data" },
              { icon: "₿", text: "Powered by Bitcoin" },
              { icon: "🔐", text: "Built for freedom" }
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-3 rounded-2xl shadow-sm">
                <span className={`w-6 h-6 rounded-lg ${badge.text.includes('Bitcoin') ? 'bg-orange-100 text-orange-600' : 'bg-lime-100 text-lime-600'} flex items-center justify-center text-xs font-bold`}>
                  {badge.icon}
                </span>
                <span className="text-sm font-bold text-[#0F172A]">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* SOCIAL PROOF */}
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-lime-400 flex items-center justify-center font-bold text-xs shadow-sm">
                +12K
              </div>
            </div>
            <div>
              <div className="flex text-orange-400 text-sm">
                {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
                4.9/5 from 50K+ entrepreneurs
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT (Dashboard Mockup) */}
        <div className="relative isolate">
          {/* Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-lime-400/5 blur-[120px] -z-10 rounded-full"></div>
          
          <div className="relative group">
            {/* The "Dashboard Main" Mockup */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[40px] p-2 shadow-2xl transition hover:scale-[1.02] duration-500">
               <img 
                 src="https://framerusercontent.com/images/mockup-demo-placeholder.png" 
                 alt="Dashboard Mockup" 
                 className="rounded-[32px] w-full h-auto grayscale-[0.2] opacity-90"
                 onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.style.padding = '0'; }}
               />
               {/* Internal Mock elements if img fails */}
               <div className="p-8 aspect-[4/3] flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <div className="w-32 h-6 bg-slate-100 rounded-full"></div>
                    <div className="w-24 h-10 bg-lime-400 rounded-2xl"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl border border-slate-100"></div>)}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-100"></div>
               </div>
            </div>

            {/* Floating Mobile Mockup (Visual decoration) */}
            <div className="absolute -right-12 -bottom-12 w-48 h-[400px] bg-black rounded-[40px] border-[6px] border-slate-800 shadow-2xl hidden xl:block animate-bounce-slow">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-800 rounded-b-2xl"></div>
               <div className="p-4 pt-10 space-y-4">
                  <div className="h-32 bg-lime-400 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-slate-800 rounded-full"></div>
                    <div className="h-4 w-1/2 bg-slate-800 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-slate-800 rounded-xl"></div>
                    <div className="h-16 bg-slate-800 rounded-xl"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}