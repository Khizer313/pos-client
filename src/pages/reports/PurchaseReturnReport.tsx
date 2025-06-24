// src/pages/PurchaseReturn.tsx
import React from "react";
import PartyPage from "../PartyPage";

const PurchaseReturnReport: React.FC = () => {
  const title = "Purchase Return";
  const breadcrumbs = ["Home", "Purchase", "Purchase Return"];
  const buttons: {label: string, variant: 'primary' | 'secondary'}[] = [
    { label: "Add Return", variant: "primary" },
    { label: "Export CSV", variant: "secondary" },
  ];
  const filters = ["All", "Last 7 days", "Last 30 days", "This Year"];

  const tableColumns = [
    "Return ID",
    "Purchase ID",
    "Supplier",
    "Return Date",
    "Total Qty",
    "Status",
  ];

  const tableData = [
    {
      "Return ID": "PR-001",
      "Purchase ID": "P-123",
      Supplier: "ABC Suppliers",
      "Return Date": "2025-05-01",
      "Total Qty": 10,
      Status: "Processed",
    },
    {
      "Return ID": "PR-002",
      "Purchase ID": "P-124",
      Supplier: "XYZ Traders",
      "Return Date": "2025-05-03",
      "Total Qty": 5,
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

export default PurchaseReturnReport;
