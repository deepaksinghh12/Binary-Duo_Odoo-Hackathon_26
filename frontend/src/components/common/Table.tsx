import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No data available.'
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-slate-50 border-b border-slate-100 h-12"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex h-16 items-center border-b border-slate-50 px-6 gap-4">
              {columns.map((c, j) => (
                <div key={j} className="h-4 bg-slate-200 rounded w-full"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-transparent border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-slate-400 font-bold">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/60">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors duration-200 group bg-white">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-4 text-slate-700">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
