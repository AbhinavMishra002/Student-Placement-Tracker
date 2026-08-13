export default function DataTable({ columns, rows, keyField = "id", emptyLabel = "No records yet." }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="card p-12 text-center text-muted text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-canvas/60">
              {columns.map((col) => (
                <th key={col.key} className="text-left font-semibold text-muted text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[keyField]} className="border-b border-line last:border-0 hover:bg-canvas/50 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
