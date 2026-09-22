// A minimal horizontal bar chart for simple admin stats — no charting library needed for
// something this small. Thin bars, rounded ends, single hue per chart (color follows the
// chart's subject: green for charity money, gold for prize money — never mixed).

export function SimpleBarChart({ data, labelKey, valueKey, colorClassName, formatValue }) {
  if (data.length === 0) {
    return <p className="text-sm text-text-muted">No data yet.</p>;
  }

  const maxValue = Math.max(...data.map((d) => d[valueKey]));

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => (
        <div key={row[labelKey]}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{row[labelKey]}</span>
            <span className="text-text-muted">{formatValue(row[valueKey])}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-border-light/50">
            <div
              className={`h-2 rounded-full ${colorClassName}`}
              style={{ width: `${maxValue > 0 ? (row[valueKey] / maxValue) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
