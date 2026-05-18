"use client";

interface InvoiceFormProps {
  invoiceData: {
    customer: string;
    service: string;
    amount: string;
  };

  setInvoiceData: React.Dispatch<
    React.SetStateAction<{
      customer: string;
      service: string;
      amount: string;
    }>
  >;
}

export default function InvoiceForm({
  invoiceData,
  setInvoiceData,
}: InvoiceFormProps) {
  return (
    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        p-8
        shadow-sm
      "
    >

      <div>
        <p className="text-slate-500 font-medium">
          Payment Details
        </p>

        <h2 className="text-3xl font-bold text-lime-500 mt-2">
          Create Invoice
        </h2>
      </div>

      <div className="space-y-7 mt-10">

        {/* CUSTOMER */}
        <div>
          <label className="text-slate-500 font-medium text-sm">
            Customer Name
          </label>

          <input
            type="text"
            value={invoiceData.customer}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                customer: e.target.value,
              })
            }
            placeholder="Enter customer name"
            className="
              w-full
              mt-3
              border
              border-gray-200
              rounded-2xl
              px-5
              py-4
              outline-none
              bg-white
              text-black
              placeholder:text-slate-400
              focus:border-lime-400
              focus:ring-4
              focus:ring-lime-100
              transition
            "
          />
        </div>

        {/* SERVICE */}
        <div>
          <label className="text-[#0F172A] font-medium text-sm">
            Item / Service
          </label>

          <input
            type="text"
            value={invoiceData.service}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                service: e.target.value,
              })
            }
            placeholder="Website Design"
            className="
              w-full
              mt-3
              border
              border-gray-200
              rounded-2xl
              px-5
              py-4
              outline-none
              bg-white
              text-black
              placeholder:text-slate-400
              focus:border-lime-400
              focus:ring-4
              focus:ring-lime-100
              transition
            "
          />
        </div>

        {/* AMOUNT */}
        <div>
          <label className="text-[#0F172A] font-medium text-sm">
            Amount (sats)
          </label>

          <input
            type="number"
            value={invoiceData.amount}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                amount: e.target.value,
              })
            }
            placeholder="25000"
            className="
              w-full
              mt-3
              border
              border-gray-200
              rounded-2xl
              px-5
              py-4
              outline-none
              bg-white
              text-black
              placeholder:text-slate-400
              focus:border-lime-400
              focus:ring-4
              focus:ring-lime-100
              transition
            "
          />
        </div>

        <button
          className="
            w-full
            bg-lime-500
            hover:bg-lime-400
            text-white
            transition
            py-4
            rounded-2xl
            font-semibold
            mt-4
            shadow-sm
          "
        >
          Generate Invoice
        </button>

      </div>

    </div>
  );
}