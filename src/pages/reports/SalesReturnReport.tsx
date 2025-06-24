// pages/reports/SalesReturnReport.tsx
import ReportLayout from "../../components/reports/ReportLayout";
import ReportFilterBar from "../../components/reports/ReportFilterBar";
import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import ReportTable from "../../components/reports/ReportTable";
import PrintExportButtons from "../../components/reports/PrintExportButtons";

const SalesReturnReport = () => {
  // Sample static data (API se fetch karna better hoga)
  const salesReturns = [
    {
      id: "SR-1001",
      date: "2025-05-20",
      customer: "M/S Ahmed Traders",
      product: "Laptop Model X",
      quantity: 2,
      amount: 120000,
      reason: "Damaged",
    },
    {
      id: "SR-1002",
      date: "2025-06-02",
      customer: "M/S Bright Electronics",
      product: "Smartphone Model Y",
      quantity: 1,
      amount: 45000,
      reason: "Wrong Item",
    },
  ];

  const columns = [
    "Return ID",
    "Date",
    "Customer",
    "Product",
    "Quantity",
    "Amount",
    "Reason",
  ];

  return (
    <ReportLayout>
      <h2 className="text-xl font-semibold mb-4">Sales Return Report</h2>

      <ReportFilterBar filters={["Today", "This Week", "This Month", "Custom"]} />

      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportSummaryCard title="Total Returns" value={salesReturns.length} color="red" />
        <ReportSummaryCard
          title="Total Returned Amount"
          value={salesReturns.reduce((sum, r) => sum + r.amount, 0)}
          color="purple"
        />
        <ReportSummaryCard
          title="Total Returned Quantity"
          value={salesReturns.reduce((sum, r) => sum + r.quantity, 0)}
          color="orange"
        />
      </div>

      <PrintExportButtons
  onPrint={() => window.print()}
  onExportCSV={() => console.log("Exporting CSV...")}
  onExportPDF={() => console.log("Exporting PDF...")}
/>


      <ReportTable keyField="id"  columns={columns} data={salesReturns} />
    </ReportLayout>
  );
};

export default SalesReturnReport;
