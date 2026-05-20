import { 
  XCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldOff,
  AlertCircle,
  LogOut,
  History,
  Database,
  UserCheck,
  FileCheck,
  Lock,
  LineChart,
  Trophy,
  Share2
} from "lucide-react";

export default function ValueProp() {
  const problems = [
    { text: "Losing invoices and receipts", icon: XCircle },
    { text: "Poor payment tracking", icon: AlertCircle },
    { text: "Lack of secure customer records", icon: ShieldOff },
    { text: "No verifiable business identity", icon: UserCheck },
    { text: "Dependence on social media platforms", icon: LogOut },
    { text: "Difficulty proving transaction history", icon: History },
    { text: "No ownership of digital business data", icon: Database },
  ];

  const solutions = [
    { text: "Create a portable business identity", icon: Trophy },
    { text: "Generate professional invoices", icon: FileCheck },
    { text: "Store business records securely", icon: Lock },
    { text: "Track payments and transactions", icon: LineChart },
    { text: "Build trusted business credibility", icon: Share2 },
    { text: "Maintain ownership of business data", icon: Database },
  ];

  return (
    <section className="py-24 px-6 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] leading-tight">
            Built for Independence.
            <br />
            <span className="text-lime-600">Owned by You.</span>
          </h2>
          <p className="text-slate-500 text-xl mt-6 max-w-2xl mx-auto">
            Traditional tools leave you dependent. OwnStack gives you the infrastructure to own your business data and identity.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 relative">
          
          {/* Connector arrow (desktop only) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-lime-400 rounded-full items-center justify-center shadow-xl z-10 border-4 border-white">
            <ArrowRight className="text-black w-8 h-8" />
          </div>

          {/* PROBLEMS SIDE */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-400 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-black">!</span>
              The Old Way
            </h3>
            <ul className="space-y-6">
              {problems.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                    <item.icon className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-slate-600 font-medium text-lg">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SOLUTIONS SIDE */}
          <div className="bg-white rounded-[40px] p-10 border border-lime-200 shadow-xl relative overflow-hidden ring-4 ring-lime-400/10">
            <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl"></div>
            
            <h3 className="text-2xl font-bold text-lime-700 mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-lime-400 text-black flex items-center justify-center text-sm font-black">✓</span>
              With OwnStack
            </h3>
            <ul className="space-y-6">
              {solutions.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
                    <item.icon className="w-5 h-5 text-lime-600" />
                  </div>
                  <span className="text-[#0F172A] font-bold text-lg">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 p-6 bg-white/60 backdrop-blur rounded-3xl border border-white">
              <p className="text-lime-800 font-bold flex items-center gap-2">
                🚀 Upgrade your business infrastructure today.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
