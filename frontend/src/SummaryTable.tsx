import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

interface SummaryItem {
  url: string;
  summary: string;
  timestamp: string;
}

interface SummaryTableProps {
  data: SummaryItem[];
}

const columnHelper = createColumnHelper<SummaryItem>();

const SummaryTable: React.FC<SummaryTableProps> = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor('url', {
        header: 'URL',
        cell: info => <div className="truncate max-w-[250px] text-blue-700 dark:text-blue-300">{info.getValue()}</div>,
      }),
      columnHelper.accessor('summary', {
        header: 'Summary (Preview)',
        cell: info => <div className="truncate max-w-[400px]">{info.getValue().slice(0, 150)}...</div>,
      }),
      columnHelper.accessor('timestamp', {
        header: 'Timestamp',
        cell: info => new Date(info.getValue()).toLocaleString(),
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="mt-6">
<input
  type="text"
  value={globalFilter ?? ''}
  onChange={e => setGlobalFilter(e.target.value)}
  placeholder="Search summaries..."
  className="p-2 border rounded-lg w-full max-w-xs mb-4
             bg-gray-50 dark:bg-gray-700
             text-gray-900 dark:text-gray-100
             placeholder-gray-400 dark:placeholder-gray-400
             border-gray-300 dark:border-gray-600"
/>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-3 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t border-gray-200 dark:border-gray-700">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-3 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-4">No results found.</div>
        )}
      </div>
    </div>
  );
};

export default SummaryTable;