import React from "react";

interface ReportFilterBarProps {
  // onDateChange?: (from: string, to: string) => void;
  onTypeChange?: (type: string) => void;
  onDateChange?: (start: string, end: string) => void;
  filters?: string[];
  startDate?: string;
  endDate?: string;
  extraFilter?: React.ReactNode; // optional dropdown for Customer/Product etc.
}

const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  onDateChange,
  onTypeChange,
  extraFilter,
}) => {
  return (
    <section className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-md shadow-sm">
      <div>
        <label className="text-sm text-gray-600">From:</label>
        <input
          type="date"
          className="border rounded px-2 py-1 ml-1"
          onChange={(e) =>
            onDateChange?.(e.target.value, undefined as unknown as string)
          }
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">To:</label>
        <input
          type="date"
          className="border rounded px-2 py-1 ml-1"
          onChange={(e) =>
            onDateChange?.(undefined as unknown as string, e.target.value)
          }
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Type:</label>
        <select
          className="border rounded px-2 py-1 ml-1"
          onChange={(e) => onTypeChange?.(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {extraFilter && <div>{extraFilter}</div>}
    </section>
  );
};

export default ReportFilterBar;
