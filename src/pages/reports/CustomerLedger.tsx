// pages/reports/CustomerLedger.tsx
import { useState, useEffect } from "react";
import CustomerLedgerTable from "../../components/reports/CustomerLedgerTable";
import ReportFilterBar from "../../components/reports/ReportFilterBar";
import ReportLayout from "../../components/reports/ReportLayout";

interface LedgerEntry {
  id: string | number;
  date: string;
  invoiceNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

const CustomerLedger = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [filterDateRange, setFilterDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [customer, setCustomer] = useState<string>("");
console.log(setCustomer);

  // TODO: fetch ledger data based on filters
  useEffect(() => {
    // Replace with real API call or state logic
    const dummyData: LedgerEntry[] = [
      {
        id: 1,
        date: "2025-06-01",
        invoiceNo: "INV-001",
        description: "Sale",
        debit: 0,
        credit: 1500,
        balance: 1500,
      },
      {
        id: 2,
        date: "2025-06-05",
        invoiceNo: "INV-002",
        description: "Payment received",
        debit: 1500,
        credit: 0,
        balance: 0,
      },
    ];
    setEntries(dummyData);
  }, [filterDateRange, customer]);

  return (
    <ReportLayout>
      <ReportFilterBar
        startDate={filterDateRange.start}
        endDate={filterDateRange.end}
        onDateChange={(start, end) => setFilterDateRange({ start, end })}
        // TODO: add customer select/change handler
      />
      <CustomerLedgerTable entries={entries} />
    </ReportLayout>
  );
};

export default CustomerLedger;
