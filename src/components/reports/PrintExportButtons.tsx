// components/reports/PrintExportButtons.tsx
import React from "react";

interface PrintExportButtonsProps {
  onPrint: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const PrintExportButtons: React.FC<PrintExportButtonsProps> = ({
  onPrint,
  onExportCSV,
  onExportPDF,
}) => {
  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={onPrint}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        aria-label="Print report"
      >
        Print
      </button>
      <button
        onClick={onExportCSV}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        aria-label="Export report as CSV"
      >
        Export CSV
      </button>
      <button
        onClick={onExportPDF}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        aria-label="Export report as PDF"
      >
        Export PDF
      </button>
    </div>
  );
};

export default PrintExportButtons;
