import { PackageSearch, FileText, CircleDollarSign } from "lucide-react";
import ReportFilterBar from "../../components/reports/ReportFilterBar";

const PurchaseReport = () => {
  return (
    <main className="p-6 space-y-6 bg-white text-gray-800">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Purchase Report</h1>
        <p className="text-sm text-gray-500">Overview of your purchase activity.</p>
      </header>

      {/* Filter Section */}
      <ReportFilterBar
        onDateChange={(from, to) => console.log("From:", from, "To:", to)}
        onTypeChange={(type) => console.log("Type:", type)}
        extraFilter={
          <select className="border rounded px-2 py-1">
            <option>Select Supplier</option>
            <option>Ali Supplier</option>
            <option>Universal Traders</option>
          </select>
        }
      />

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded shadow-sm flex items-center gap-3">
          <PackageSearch className="text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Total Purchases</p>
            <h2 className="text-lg font-semibold">PKR 185,000</h2>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded shadow-sm flex items-center gap-3">
          <CircleDollarSign className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Paid</p>
            <h2 className="text-lg font-semibold">PKR 140,000</h2>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded shadow-sm flex items-center gap-3">
          <FileText className="text-red-600" />
          <div>
            <p className="text-xs text-gray-500">Outstanding</p>
            <h2 className="text-lg font-semibold">PKR 45,000</h2>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="overflow-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 mt-2">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Supplier</th>
              <th className="px-4 py-2 border">Invoice #</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Paid</th>
              <th className="px-4 py-2 border">Due</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                date: "2025-06-12",
                supplier: "Ali Supplier",
                invoice: "PUR-001",
                amount: "60,000",
                paid: "50,000",
                due: "10,000",
              },
              {
                date: "2025-06-10",
                supplier: "Universal Traders",
                invoice: "PUR-002",
                amount: "125,000",
                paid: "90,000",
                due: "35,000",
              },
            ].map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{row.date}</td>
                <td className="px-4 py-2 border">{row.supplier}</td>
                <td className="px-4 py-2 border">{row.invoice}</td>
                <td className="px-4 py-2 border">PKR {row.amount}</td>
                <td className="px-4 py-2 border">PKR {row.paid}</td>
                <td className="px-4 py-2 border text-red-600 font-medium">PKR {row.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default PurchaseReport;
