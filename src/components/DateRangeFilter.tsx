// src/components/DateRangeFilter.tsx
import React from "react";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear?: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-end mb-4 bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
      <div className="flex flex-col">
        <label htmlFor="start-date" className="text-sm font-medium text-gray-700 mb-1">
          📅 Start Date
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="end-date" className="text-sm font-medium text-gray-700 mb-1">
          🗓️ End Date
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="text-sm text-red-600 underline mt-6"
          type="button"
        >
          ❌ Clear Dates
        </button>
      )}
    </div>
  );
};

export default DateRangeFilter;
