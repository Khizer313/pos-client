// pages/reports/QuotationReport.tsx
import ReportLayout from "../../components/reports/ReportLayout";
import ReportFilterBar from "../../components/reports/ReportFilterBar";
import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import ReportTable from "../../components/reports/ReportTable";
import PrintExportButtons from "../../components/reports/PrintExportButtons";

const QuotationReport = () => {
  // Sample static data, aap API se laa sakte hain
  const quotations = [
    {
      id: "QTN-001",
      date: "2025-06-01",
      customer: "Ali Traders",
      totalAmount: 15000,
      status: "Pending",
    },
    {
      id: "QTN-002",
      date: "2025-06-05",
      customer: "Zara Enterprises",
      totalAmount: 27500,
      status: "Approved",
    },
  ];

  const columns = ["ID", "Date", "Customer", "Total Amount", "Status"];

  return (
    <ReportLayout>
      <h2 className="text-xl font-semibold mb-4">Quotation / Estimate Report</h2>

      <ReportFilterBar filters={["This Month", "Last Month", "This Year", "Custom"]} />

      <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportSummaryCard title="Total Quotations" value={quotations.length} color="blue" />
        <ReportSummaryCard
          title="Total Value"
          value={quotations.reduce((sum, q) => sum + q.totalAmount, 0)}
          color="green"
        />
        <ReportSummaryCard
          title="Pending Quotations"
          value={quotations.filter((q) => q.status === "Pending").length}
          color="orange"
        />
      </div>

      <PrintExportButtons
  onPrint={() => window.print()}
  onExportCSV={() => console.log("Exporting CSV...")}
  onExportPDF={() => console.log("Exporting PDF...")}
/>

      <ReportTable keyField="id"  columns={columns} data={quotations} />
    </ReportLayout>
  );
};

export default QuotationReport;
