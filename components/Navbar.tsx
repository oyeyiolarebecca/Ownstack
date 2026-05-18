export default function Navbar() {
  return (
    <nav
      className="
        w-full
        sticky
        top-0
        z-50
        bg-white/80
        backdrop-blur-md
        border-b
        border-gray-200
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
          py-5
          flex
          items-center
          justify-between
        "
      >

        {/* LOGO */}
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

          <h1 className="text-2xl font-bold tracking-tight">
            OwnStack
          </h1>
        </div>

        {/* NAV */}
        <div className="hidden md:flex items-center gap-8">

          <a
            href="#"
            className="
              text-slate-600
              hover:text-black
              transition
              text-sm
              font-medium
            "
          >
            About
          </a>

          <a
            href="#"
            className="
              text-slate-600
              hover:text-black
              transition
              text-sm
              font-medium
            "
          >
            Docs
          </a>

        </div>

        {/* CTA */}
        <button
          className="
            bg-lime-400
            hover:bg-lime-300
            transition
            px-5
            py-2.5
            rounded-2xl
            font-semibold
            text-black
            shadow-sm
          "
        >
          Login
        </button>

      </div>
    </nav>
  );
}