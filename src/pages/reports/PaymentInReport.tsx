import { Banknote, HandCoins, CircleDollarSign } from "lucide-react";
import ReportFilterBar from "../../components/reports/ReportFilterBar";

const PaymentReport = () => {
  return (
    <main className="p-6 space-y-6 bg-white text-gray-900">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Payment Report</h1>
        <p className="text-sm text-gray-500">Customer or vendor payments received and due.</p>
      </header>

      {/* Filters */}
      <ReportFilterBar
        onDateChange={(from, to) => console.log("From:", from, "To:", to)}
        extraFilter={
          <select className="border rounded px-2 py-1">
            <option>Select Customer/Vendor</option>
            <option>Aslam Bhai</option>
            <option>Zubair Electronics</option>
          </select>
        }
      />

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded shadow-sm flex items-center gap-3">
          <Banknote className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Total Paid</p>
            <h2 className="text-lg font-semibold">PKR 250,000</h2>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded shadow-sm flex items-center gap-3">
          <HandCoins className="text-yellow-600" />
          <div>
            <p className="text-xs text-gray-500">Total Received</p>
            <h2 className="text-lg font-semibold">PKR 200,000</h2>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded shadow-sm flex items-center gap-3">
          <CircleDollarSign className="text-red-600" />
          <div>
            <p className="text-xs text-gray-500">Balance Due</p>
            <h2 className="text-lg font-semibold">PKR 50,000</h2>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 mt-4">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Customer/Vendor</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Note</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                date: "2025-06-10",
                name: "Aslam Bhai",
                type: "Received",
                amount: 50000,
                note: "Installment",
              },
              {
                date: "2025-06-08",
                name: "Zubair Electronics",
                type: "Paid",
                amount: 100000,
                note: "Full payment",
              },
              {
                date: "2025-06-05",
                name: "Aslam Bhai",
                type: "Received",
                amount: 150000,
                note: "Advance",
              },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{item.date}</td>
                <td className="px-4 py-2 border">{item.name}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`${
                      item.type === "Paid" ? "text-red-600" : "text-green-600"
                    } font-medium`}
                  >
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-2 border">PKR {item.amount.toLocaleString()}</td>
                <td className="px-4 py-2 border">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default PaymentReport;
