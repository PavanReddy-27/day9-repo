import type { ReactNode } from "react";

import "./KPICard.css";

export interface KPICardProps {
  title: string;
  value: string | number;
  color?: string;
  icon?: ReactNode;
}

const KPICard = ({
  title,
  value,
  color = "#3B82F6",
  icon,
}: KPICardProps) => {
  return (
    <div
      className="kpi-card"
      style={{
        borderColor: color,
        ["--kpi-color"]: color,
        ["--kpi-color-soft"]: `${color}22`,
      } as React.CSSProperties}
    >
      <div className="kpi-card__header">
        {icon && (
          <span className="kpi-card__icon">{icon}</span>
        )}
        <div>
          <p className="kpi-card__title">{title}</p>
          <p className="kpi-card__value">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;