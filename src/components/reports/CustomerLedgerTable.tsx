// components/reports/CustomerLedgerTable.tsx
import React from "react";

interface LedgerEntry {
  id: string | number;
  date: string; // ISO date string
  invoiceNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CustomerLedgerTableProps {
  entries: LedgerEntry[];
}

const CustomerLedgerTable: React.FC<CustomerLedgerTableProps> = ({ entries }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            <th className="px-4 py-2 text-left border-b">Date</th>
            <th className="px-4 py-2 text-left border-b">Invoice No.</th>
            <th className="px-4 py-2 text-left border-b">Description</th>
            <th className="px-4 py-2 text-right border-b">Debit</th>
            <th className="px-4 py-2 text-right border-b">Credit</th>
            <th className="px-4 py-2 text-right border-b">Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-500">
                No ledger entries found.
              </td>
            </tr>
          ) : (
            entries.map(({ id, date, invoiceNo, description, debit, credit, balance }) => (
              <tr key={id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{new Date(date).toLocaleDateString()}</td>
                <td className="px-4 py-2 border-b">{invoiceNo}</td>
                <td className="px-4 py-2 border-b">{description}</td>
                <td className="px-4 py-2 border-b text-right">{debit.toFixed(2)}</td>
                <td className="px-4 py-2 border-b text-right">{credit.toFixed(2)}</td>
                <td className="px-4 py-2 border-b text-right font-semibold">{balance.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerLedgerTable;
