// pages/reports/DashboardSummary.tsx
import ReportLayout from "../../components/reports/ReportLayout";
import ReportSummaryCard from "../../components/reports/ReportSummaryCard";

const DashboardSummary = () => {
  // Yeh data aap API se fetch karenge ya Redux se laayenge
  const summaryData = [
    { title: "Total Sales", value: 120000, color: "green" },
    { title: "Total Purchases", value: 80000, color: "blue" },
    { title: "Payments Received", value: 70000, color: "teal" },
    { title: "Payments Made", value: 40000, color: "red" },
    { title: "Stock Value", value: 55000, color: "purple" },
  ];

  return (
    <ReportLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {summaryData.map(({ title, value, color }) => (
          <ReportSummaryCard key={title} title={title} value={value} color={color} />
        ))}
      </div>
    </ReportLayout>
  );
};

export default DashboardSummary;
