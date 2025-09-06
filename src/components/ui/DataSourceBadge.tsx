import React from "react";
import { DataSource } from "@/types";
import { getDataSourceConfig } from "@/utils/dataSourceUtils";

interface DataSourceBadgeProps {
  dataSource: DataSource;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  dataSource,
  size = "sm",
  showLabel = false,
  className = "",
}) => {
  const config = getDataSourceConfig(dataSource);
  
  const sizeClasses = size === "sm" 
    ? "text-xs px-1.5 py-0.5"
    : "text-sm px-2 py-1";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.badgeColor} ${className}`}
      title={config.description}
    >
      <span className="mr-1">{config.badge}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export default DataSourceBadge;