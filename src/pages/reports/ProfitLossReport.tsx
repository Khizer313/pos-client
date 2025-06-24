// pages/reports/ProfitLossReport.tsx
import  { useState, useEffect } from "react";
import ReportFilterBar from "../../components/reports/ReportFilterBar";
import ReportLayout from "../../components/reports/ReportLayout";

const ProfitLossReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [profitLossData, setProfitLossData] = useState<{ revenue: number; expenses: number }>({
    revenue: 0,
    expenses: 0,
  });

  useEffect(() => {
    // TODO: fetch profit and loss data based on date range
    setProfitLossData({
      revenue: 50000,
      expenses: 30000,
    });
  }, [startDate, endDate]);

  const profit = profitLossData.revenue - profitLossData.expenses;

  return (
    <ReportLayout>
      <ReportFilterBar
        startDate={startDate}
        endDate={endDate}
        onDateChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />
      <div className="mt-6 p-6 bg-white rounded shadow text-center">
        <h2 className="text-2xl font-semibold mb-4">Profit & Loss Summary</h2>
        <p className="text-green-700">Revenue: ${profitLossData.revenue.toFixed(2)}</p>
        <p className="text-red-600">Expenses: ${profitLossData.expenses.toFixed(2)}</p>
        <p className={`mt-2 font-bold ${profit >= 0 ? "text-green-800" : "text-red-800"}`}>
          Net Profit: ${profit.toFixed(2)}
        </p>
      </div>
    </ReportLayout>
  );
};

export default ProfitLossReport;
