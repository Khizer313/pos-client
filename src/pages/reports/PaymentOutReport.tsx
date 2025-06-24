// src/pages/PaymentOutReport.tsx
import React from "react";
import PartyPage from "../PartyPage";

const PaymentOutReport: React.FC = () => {
  const title = "Payment Out";
  const breadcrumbs = ["Home", "Purchase", "Payment Out"];
  const buttons: {label: string, variant: 'primary' | 'secondary'}[]  = [
    { label: "Add Payment", variant: "primary" },
    { label: "Export PDF", variant: "secondary" },
  ];
  const filters = ["All", "Last 7 days", "Last 30 days", "This Year"];

  const tableColumns = [
    "Payment ID",
    "Purchase ID",
    "Supplier",
    "Payment Date",
    "Amount",
    "Payment Method",
    "Status",
  ];

  const tableData = [
    {
      "Payment ID": "PO-001",
      "Purchase ID": "P-123",
      Supplier: "ABC Suppliers",
      "Payment Date": "2025-05-05",
      Amount: "$1,200",
      "Payment Method": "Bank Transfer",
      Status: "Completed",
    },
    {
      "Payment ID": "PO-002",
      "Purchase ID": "P-125",
      Supplier: "XYZ Traders",
      "Payment Date": "2025-05-07",
      Amount: "$850",
      "Payment Method": "Cheque",
      Status: "Pending",
    },
  ];

  return (
    <PartyPage
      title={title}
      breadcrumbs={breadcrumbs}
      buttons={buttons}
      filters={filters}
      tableColumns={tableColumns}
      tableData={tableData}
    />
  );
};

export default PaymentOutReport;
