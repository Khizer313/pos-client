import { Boxes, PackageCheck, PackageX, AlertTriangle } from "lucide-react";
import ReportFilterBar from "../../components/reports/ReportFilterBar";

const StockReport = () => {
  return (
    <main className="p-6 space-y-6 bg-white text-gray-900">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Stock Report</h1>
        <p className="text-sm text-gray-500">Current inventory and stock movement overview.</p>
      </header>

      {/* Filters */}
      <ReportFilterBar
        onDateChange={(from, to) => console.log("From:", from, "To:", to)}
        extraFilter={
          <select className="border rounded px-2 py-1">
            <option>Select Product</option>
            <option>iPhone 14</option>
            <option>Samsung A24</option>
          </select>
        }
      />

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded shadow-sm flex items-center gap-3">
          <Boxes className="text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Total Products</p>
            <h2 className="text-lg font-semibold">250</h2>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded shadow-sm flex items-center gap-3">
          <PackageCheck className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">In Stock</p>
            <h2 className="text-lg font-semibold">200</h2>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded shadow-sm flex items-center gap-3">
          <PackageX className="text-red-600" />
          <div>
            <p className="text-xs text-gray-500">Out of Stock</p>
            <h2 className="text-lg font-semibold">50</h2>
          </div>
        </div>
      </section>

      {/* Stock Table */}
      <section className="overflow-auto">
        <table className="min-w-full text-sm text-left border border-gray-200 mt-4">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-2 border">Product</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Stock In</th>
              <th className="px-4 py-2 border">Stock Out</th>
              <th className="px-4 py-2 border">Remaining</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                product: "iPhone 14",
                category: "Mobiles",
                in: 100,
                out: 80,
                remaining: 20,
              },
              {
                product: "Samsung A24",
                category: "Mobiles",
                in: 150,
                out: 150,
                remaining: 0,
              },
              {
                product: "Bluetooth Speaker",
                category: "Electronics",
                in: 200,
                out: 50,
                remaining: 150,
              },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{item.product}</td>
                <td className="px-4 py-2 border">{item.category}</td>
                <td className="px-4 py-2 border">{item.in}</td>
                <td className="px-4 py-2 border">{item.out}</td>
                <td className="px-4 py-2 border font-semibold">{item.remaining}</td>
                <td className="px-4 py-2 border">
                  {item.remaining === 0 ? (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <AlertTriangle size={14} /> Out of Stock
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">In Stock</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};

export default StockReport;
