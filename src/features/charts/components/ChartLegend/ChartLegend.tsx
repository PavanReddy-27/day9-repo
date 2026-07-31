import "./ChartLegend.css";

export interface LegendItem {
  label: string;
  color: string;
  value?: number | string;
}

interface ChartLegendProps {
  items: LegendItem[];
  direction?: "row" | "column";
}

const ChartLegend = ({
  items,
  direction = "column",
}: ChartLegendProps) => {
  return (
    <div className={`chart-legend chart-legend--${direction}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="chart-legend__item"
        >
          <span
            className="chart-legend__color"
            style={{ backgroundColor: item.color }}
          />

          <span className="chart-legend__label">
            {item.label}
          </span>

          {item.value !== undefined && (
            <span className="chart-legend__value">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChartLegend;