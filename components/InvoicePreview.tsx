import QRCode from "react-qr-code";

interface InvoicePreviewProps {
  invoiceData: {
    customer: string;
    service: string;
    amount: string;
  };
}

export default function InvoicePreview({
  invoiceData,
}: InvoicePreviewProps) {
  return (
    <div
      className="
        bg-gradient-to-br
        from-white
        to-lime-50
        border
        border-gray-200
        rounded-3xl
        p-8
        shadow-sm
      "
    >

      {/* TOP */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-slate-500 font-medium">
            Invoice Preview
          </p>

          <h2 className="text-4xl font-bold text-[#0F172A] mt-3">
            {invoiceData.amount || "0"} sats
          </h2>
        </div>

        <div
          className="
            px-4
            py-2
            rounded-full
            bg-yellow-100
            text-yellow-700
            text-sm
            font-medium
          "
        >
          Pending
        </div>

      </div>

      {/* QR */}
      <div
        className="
          bg-white
          border
          border-gray-200
          rounded-3xl
          p-8
          flex
          items-center
          justify-center
          mt-10
        "
      >

        <QRCode
          value={`
            lightning:${invoiceData.customer}-${invoiceData.amount}
          `}
          size={220}
        />

      </div>

      {/* DETAILS */}
      <div className="mt-10 space-y-6">

        <div className="flex justify-between items-center">
          <p className="text-slate-500">
            Customer
          </p>

          <p className="font-semibold text-[#0F172A]">
            {invoiceData.customer || "Unknown"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-slate-500">
            Service
          </p>

          <p className="font-semibold text-[#0F172A]">
            {invoiceData.service || "No Service"}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-slate-500">
            Lightning Address
          </p>

          <p className="font-semibold text-[#0F172A]">
            ownstack@getalby.com
          </p>
        </div>

      </div>

    </div>
  );
}