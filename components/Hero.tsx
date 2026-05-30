"use client";
import Link from "next/link";
import NostrConnectButton from "@/components/NostrConnectButton";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-12">
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-600 font-bold px-4 py-2 rounded-full text-xs uppercase tracking-wider">
            Bitcoin-native business infrastructure
          </div>

          <h1 className="text-6xl lg:text-[84px] font-black leading-[1.05] mt-8 text-[#0F172A] tracking-tight">
            Own your business.<br />
            <span className="text-lime-500">Run it independently.</span>
          </h1>

          <p className="text-slate-500 text-xl mt-8 max-w-xl leading-relaxed font-medium">
            Bitcoin-native tools to help entrepreneurs create, manage, and grow their business with full ownership of their data, payments, and identity.
          </p>

          <div className="flex flex-wrap gap-4 mt-10">
            <NostrConnectButton
              label="Connect Nostr"
              className="px-10 py-5 rounded-2xl text-lg"
            />

            <Link href="#features" className="bg-white border border-slate-200 hover:border-slate-300 text-[#0F172A] px-10 py-5 rounded-2xl font-black text-lg transition flex items-center gap-3 group">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs group-hover:bg-lime-100 group-hover:text-lime-700 transition">↓</span>
              Learn More
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-12">
            {[
              { icon: "🛡️", text: "You own your data" },
              { icon: "₿", text: "Powered by Bitcoin" },
              { icon: "⚡", text: "Built for freedom" }
            ].map((badge, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white border border-slate-100 px-4 py-3 rounded-2xl shadow-sm">
                <span className={`w-6 h-6 rounded-lg ${badge.text.includes('Bitcoin') ? 'bg-orange-100 text-orange-600' : 'bg-lime-100 text-lime-600'} flex items-center justify-center text-xs font-bold`}>
                  {badge.icon}
                </span>
                <span className="text-sm font-bold text-[#0F172A]">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative isolate mt-10 lg:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-lime-400/20 blur-[100px] -z-10 rounded-full"></div>

          <div className="relative group perspective-[2000px]">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[40px] p-6 shadow-2xl transition-transform duration-700 hover:rotate-y-[-5deg] hover:rotate-x-[2deg]">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
                 <div className="w-32 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">Dashboard</div>
                 <div className="w-10 h-10 rounded-full bg-lime-100 border-2 border-white shadow-sm flex items-center justify-center"><div className="w-4 h-4 bg-lime-500 rounded-full"></div></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                   <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Total Invoices</p>
                   <p className="text-3xl font-black text-slate-800">142</p>
                   <div className="absolute right-0 bottom-0 text-slate-100">
                     <svg width="100" height="60" viewBox="0 0 100 60"><path d="M0 60 L20 40 L40 50 L80 10 L100 20 L100 60 Z" fill="currentColor"/></svg>
                   </div>
                 </div>
                 <div className="bg-lime-50 border border-lime-100 rounded-3xl p-6 relative overflow-hidden">
                   <p className="text-[10px] font-black uppercase text-lime-600 mb-2">Sats Received</p>
                   <p className="text-3xl font-black text-lime-900">2.4M</p>
                   <div className="absolute right-0 bottom-0 text-lime-200/50">
                     <svg width="100" height="60" viewBox="0 0 100 60"><path d="M0 60 L10 30 L30 40 L60 10 L100 0 L100 60 Z" fill="currentColor"/></svg>
                   </div>
                 </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                 <div className="flex justify-between items-center mb-6">
                   <p className="text-xs font-black uppercase text-slate-400">Recent Transactions</p>
                 </div>
                 {[1, 2].map((i) => (
                   <div key={i} className="flex items-center justify-between py-3 border-t border-slate-100 last:pb-0">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm"></div>
                       <div>
                         <div className="w-24 h-3 bg-slate-300 rounded-full mb-2"></div>
                         <div className="w-16 h-2 bg-slate-200 rounded-full"></div>
                       </div>
                     </div>
                     <div className="w-20 h-6 bg-lime-100 rounded-full"></div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="absolute -right-8 -bottom-12 w-48 bg-slate-900 rounded-[32px] border-[6px] border-slate-800 shadow-2xl hidden xl:block animate-bounce-slow overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-slate-800 rounded-b-xl z-10"></div>
              <div className="p-4 pt-10 space-y-4 bg-slate-900 h-full">
                <div className="bg-lime-400 rounded-2xl p-4 shadow-sm flex flex-col justify-end h-28">
                   <div className="w-12 h-2 bg-black/20 rounded-full mb-2"></div>
                   <div className="w-20 h-4 bg-black/40 rounded-full"></div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 w-3/4 bg-slate-700 mx-auto rounded-full"></div>
                  <div className="h-3 w-1/2 bg-slate-800 mx-auto rounded-full"></div>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <div className="h-10 flex-1 bg-lime-500 rounded-xl"></div>
                  <div className="h-10 w-10 bg-slate-800 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
