import React from "react";

type ButtonType = {
  label: string;
  variant: "primary" | "secondary";
  onClick?: () => void;
};

type TableRowType = {
  [key: string]: React.ReactNode;
};

interface PartyPageProps {
  title: string;
  breadcrumbs: string[];
  buttons: ButtonType[];
  filters: string[];
  tableColumns?: string[]; //   mui ki replacement, agr mui nhi to yeh
  tableData?: TableRowType[];   //   mui ki replacement
  customTable?: React.ReactNode;   //  yeh mui ki table hgi 

  searchTerm?: string;                 // Add searchTerm prop
  onSearchChange?: (value: string) => void;  // Add handler for search input

  activeFilter?: string;             // active filter state from parent
  onFilterChange?: (filter: string) => void;  // notify parent on filter change



    // New props for date range inputs:
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
  onClearDateRange?: () => void;
  
}

const PartyPage: React.FC<PartyPageProps> = ({
  title,
  breadcrumbs,
  buttons,
  filters,
  tableColumns,
  tableData = [],
  customTable,
  searchTerm = "",
  onSearchChange,
  activeFilter = "All",
  onFilterChange,



  
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearDateRange,
}) => {
  // Note: activeFilter is now controlled from parent

  // Filter logic based on status field for built-in table
  const filteredTableData = React.useMemo(() => {
    if (activeFilter === "All") return tableData;
    if (activeFilter === "To Collect") {
      return tableData.filter((row) => row.status === "Pending");
    }
    if (activeFilter === "To Pay") {
      return tableData.filter((row) => row.status === "Received");
    }
    return tableData;
  }, [activeFilter, tableData]);

  return (
    <div className="p-4 space-y-4">
{/* Title + Breadcrumbs + Date Inputs in a single flex row */}
{/* Title (full row) */}
<div>
  <h1 className="text-2xl font-bold">{title}</h1>
</div>

{/* Breadcrumbs (left) + Date Inputs (right) */}
<div className="flex justify-between items-start flex-wrap gap-4">
  {/* Breadcrumbs Left */}
  <p className="text-sm text-gray-500">{breadcrumbs.join(" / ")}</p>

  {/* Date Inputs Right */}
  {(onStartDateChange && onEndDateChange) && (
    <div className="flex items-end gap-4 bg-gray-50 p-2 rounded-md border border-gray-200">
      <div className="flex flex-col">
        <label htmlFor="start-date" className="text-xs font-medium text-gray-700 mb-1">
          📅 Start Date
        </label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="end-date" className="text-xs font-medium text-gray-700 mb-1">
          🗓️ End Date
        </label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {(startDate || endDate) && onClearDateRange && (
        <button
          onClick={onClearDateRange}
          className="text-sm text-red-600 underline mb-1"
          type="button"
        >
          ❌ Clear
        </button>
      )}
    </div>
  )}
</div>








      {/* Buttons & Search Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Buttons */}
        <div className="flex flex-wrap gap-2 flex-grow">
          {buttons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className={`px-4 py-2 rounded text-white font-medium shadow transition-transform transform hover:scale-105 duration-200 ${
                btn.variant === "primary"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        {onSearchChange && (
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            aria-label="Search"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter, index) => (
          <button
            key={index}
            onClick={() => onFilterChange?.(filter)} 
            className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all duration-200
              ${
                activeFilter === filter
                  ? "bg-blue-600 text-white border-blue-700 shadow"
                  : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
              }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      {customTable ? (
        customTable
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr>
                {tableColumns?.map((col) => (
                  <th key={col} className="px-4 py-2 border bg-gray-100 text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTableData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((cell, j) => (
                    <td key={j} className="px-4 py-2 border">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PartyPage;
