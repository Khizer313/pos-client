// components/reports/ReportTable.tsx

interface ReportTableProps<T> {
  columns: string[];
  data: T[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
}

function ReportTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
}: ReportTableProps<T>) {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100 text-gray-700 font-semibold">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left border-b">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 text-gray-500">
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={String(row[keyField])}
                onClick={() => onRowClick && onRowClick(row)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2 border-b">
                    {row[col] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportTable;
