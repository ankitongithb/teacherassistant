export default function Table({ columns, data, onRowClick, emptyMessage = 'No data found' }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400 dark:text-dark-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-dark-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-dark-800/50">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={`bg-white dark:bg-dark-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col, j) => (
                <td key={j} className="px-4 py-3 whitespace-nowrap text-dark-700 dark:text-dark-200">
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
