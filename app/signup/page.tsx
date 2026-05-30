import { Zap } from "lucide-react";
import Link from "next/link";
import NostrConnectButton from "@/components/NostrConnectButton";

export default function NostrOnlyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060b16] px-6 py-12 text-white">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "radial-gradient(#1d4ed8 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <section className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#050914]/95 p-8 shadow-2xl shadow-black/30">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
            <Zap className="h-7 w-7" />
          </div>
          <span className="text-2xl font-black">OwnStack</span>
        </Link>

        <p className="text-sm font-black uppercase tracking-widest text-blue-300">Nostr Only</p>
        <h1 className="mt-3 text-4xl font-black tracking-normal">Start with Nostr</h1>
        <p className="mt-4 text-base font-medium leading-7 text-slate-300">Create your OwnStack workspace using the same sovereign identity you can recover on any device.</p>

        <NostrConnectButton
          variant="dark"
          label="Connect Nostr"
          className="mt-8 w-full py-4 text-base"
        />

        <p className="mt-8 text-sm font-medium leading-6 text-slate-500">
          OwnStack uses your browser Nostr extension as your identity, so there are no passwords or account forms to manage.
        </p>
      </section>
    </main>
  );
}
