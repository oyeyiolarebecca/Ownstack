import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import ValueProp from "@/components/ValueProp";
import Features from "@/components/Features";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Hero />
      
      <div className="max-w-7xl mx-auto w-full px-6 -mt-16 relative z-10">
        <StatsBar />
      </div>

      <div id="features">
        <Features />
      </div>

      <div id="how-it-works" className="mt-24">
        <ValueProp />
      </div>

      <div id="benefits">
        {/* We can use the same ValueProp or add a specific section if needed, 
            but for now I'll map benefits and how-it-works to the ValueProp area 
            and about to the footer. */}
      </div>

      <footer id="about" className="py-12 bg-slate-900 text-slate-400 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-400 text-black flex items-center justify-center font-bold text-sm">₿</div>
            <span className="text-white font-bold">OwnStack</span>
          </div>
          <p className="text-sm">© 2026 OwnStack. Built for the sovereign entrepreneur.</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-lime-400 transition">Twitter</a>
            <a href="#" className="hover:text-lime-400 transition">GitHub</a>
            <a href="#" className="hover:text-lime-400 transition">Nostr</a>
          </div>
        </div>
      </footer>

    </main>
  );
}