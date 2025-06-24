// pages/SalesReport.tsx


import {
  IndianRupee,
  ShoppingCart,
  Wallet,
  TrendingUp,
} from "lucide-react";
import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import ReportFilterBar from "../../components/reports/ReportFilterBar";

const SalesReport = () => {
  return (
    <main className="p-6 space-y-6 bg-white min-h-screen">
      <header>
        <h1 className="text-2xl font-semibold text-gray-800">Sales Report</h1>
        <p className="text-sm text-gray-500">Daily / Monthly / Yearly Summary</p>
      </header>





      <ReportFilterBar
  onDateChange={(from, to) => console.log("From:", from, "To:", to)}
  onTypeChange={(type) => console.log("Type:", type)}
  extraFilter={
    <select className="border rounded px-2 py-1">
      <option>Select Customer</option>
      <option>Khizer Abbas</option>
      <option>Ali Ahmad</option>
    </select>
  }
/>




      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportSummaryCard
          title="Total Sales"
          value="Rs. 180,000"
          icon={<IndianRupee className="text-green-600" />}
          color="bg-green-100"
        />
        <ReportSummaryCard
          title="Total Orders"
          value="125"
          icon={<ShoppingCart className="text-blue-600" />}
          color="bg-blue-100"
        />
        <ReportSummaryCard
          title="Amount Received"
          value="Rs. 150,000"
          icon={<Wallet className="text-purple-600" />}
          color="bg-purple-100"
        />
        <ReportSummaryCard
          title="Profit Estimate"
          value="Rs. 45,000"
          icon={<TrendingUp className="text-yellow-600" />}
          color="bg-yellow-100"
        />
      </section>






    </main>
  );
};

export default SalesReport;
