export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between">

      <div>
        <p className="text-slate-500">
          Welcome back 
        </p>

        <h1 className="text-4xl text-lime-500 font-bold mt-2">
          Dashboard
        </h1>
      </div>

      <button
        className="
          bg-lime-400
          hover:bg-lime-300
          transition
          px-6
          py-3
          rounded-2xl
          font-semibold
        "
      >
        Create Invoice
      </button>

    </div>
  );
}