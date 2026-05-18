import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-[#F8FAFC]
        to-lime-50
        flex
        flex-col
      "
    >

      {/* NAVBAR */}
      <nav
        className="
          flex
          items-center
          justify-between
          px-8
          py-6
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              w-10
              h-10
              rounded-2xl
              bg-lime-400
              flex
              items-center
              justify-center
              font-bold
              text-black
            "
          >
            ₿
          </div>

          <h1 className="text-2xl font-bold text-[#0F172A]">
            OwnStack
          </h1>

        </div>

        <div className="flex items-center gap-4">

          <Link
            href="/dashboard"
            className="
              bg-black
              hover:bg-[#111111]
              text-white
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition
            "
          >
            Open Dashboard
          </Link>

        </div>

      </nav>

      {/* HERO */}
      <section
        className="
          flex-1
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-6
        "
      >

        <div
          className="
            bg-lime-100
            text-lime-700
            px-5
            py-2
            rounded-full
            text-sm
            font-semibold
            mb-8
          "
        >
          Bitcoin-native business infrastructure
        </div>

        <h1
          className="
            text-6xl
            font-black
            leading-tight
            text-[#0F172A]
            max-w-5xl
          "
        >
          Get Paid With Bitcoin
          <br />
          Manage Invoices Seamlessly
        </h1>

        <p
          className="
            text-slate-600
            text-xl
            mt-8
            max-w-2xl
            leading-relaxed
          "
        >
          OwnStack helps freelancers and small businesses
          generate Lightning invoices, track payments,
          and manage BTC transactions effortlessly.
        </p>

        <div className="flex items-center gap-4 mt-10">

          <Link
            href="/invoice"
            className="
              bg-black
              hover:bg-[#111111]
              text-white
              px-7
              py-4
              rounded-3xl
              font-semibold
              transition
            "
          >
            Create Invoice
          </Link>

          <Link
            href="/dashboard"
            className="
              bg-white
              border
              border-gray-200
              hover:border-lime-300
              text-[#0F172A]
              px-7
              py-4
              rounded-3xl
              font-semibold
              transition
            "
          >
            View Dashboard
          </Link>

        </div>

      </section>

    </main>
  );
}