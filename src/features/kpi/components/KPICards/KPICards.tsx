import type { ReactNode } from "react";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import KPICard from "../KPICard";

import type { KPIType } from "../../../../types/kpi";

import "./KPICards.css";

export interface KPIItem {
  id: KPIType;
  title: string;
  value: number | string;
  trend: number;
  subtitle?: string;
  progress?: number;
  footer?: string;
  sparklineData?: number[];
}

interface KPICardsProps {
  data: KPIItem[];
  loading?: boolean;
  onCardClick?: (kpi: KPIItem) => void;
  children?: ReactNode;
}

interface KPIConfig {
  icon: ReactNode;
  color: string;
}

const KPI_CONFIG: Partial<Record<KPIType, KPIConfig>> = {
  totalEmployees: { icon: <PeopleAltIcon />, color: "#4f46e5" }, 
  activeEmployees: { icon: <PersonIcon />, color: "#10b981" }, 
  newHires: { icon: <PersonAddAlt1Icon />, color: "#f59e0b" }, 
  attritionRate: { icon: <TrendingDownIcon />, color: "#ef4444" }, 
  trainingCompletion: { icon: <SchoolIcon />, color: "#8b5cf6" }, 
  skillCoverage: { icon: <WorkspacePremiumIcon />, color: "#3b82f6" },
  highRiskEmployees: { icon: <WarningAmberIcon />, color: "#ef4444" }, 
  performanceScore: { icon: <TrendingUpIcon />, color: "#8b5cf6" }, 
  attendanceRate: { icon: <EventAvailableIcon />, color: "#f59e0b" }, 
  departments: { icon: <BusinessCenterIcon />, color: "#64748b" },
  engagementScore: { icon: <WorkspacePremiumIcon />, color: "#8b5cf6" },
};
// Procedural generation of a realistic wavy sparkline trend based on exact trend percentage
const generateMockSparkline = (trend: number, baseValue: number) => {
  const data = [];
  let current = baseValue;
  const monthlyMultiplier = 1 + (trend / 100);

  for (let i = 0; i < 6; i++) {
    data.unshift(Math.round(current));
    
    if (i === 0) {
      // Step backwards exactly by the trend percentage for the most recent month
      current = current / monthlyMultiplier;
    } else {
      // Add a slight wave for historical months while following the general trend
      const isUp = i % 2 === 0;
      const wave = isUp ? 1.01 : 0.99;
      current = (current / monthlyMultiplier) * wave;
    }
  }
  return data;
};

const KPICards = ({
  data,
  loading = false,
  onCardClick,
  children,
}: KPICardsProps) => {
  if (loading) {
    return (
      <Box className="kpi-cards__loading">
        <Typography>Loading KPI Dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3} className="kpi-cards">
      {data.map((kpi) => {
        const numericValue = typeof kpi.value === 'string' 
           ? parseFloat(kpi.value.replace(/[^0-9.]/g, '')) || 100 
           : kpi.value;
        const sparkline = kpi.sparklineData || generateMockSparkline(kpi.trend, numericValue);

        return (
          <Grid
            key={kpi.id}
            size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }} 
          >
            <KPICard
              title={kpi.title}
              value={kpi.value}
              trend={kpi.trend}
              subtitle={kpi.subtitle}
              sparklineData={sparkline}
              icon={KPI_CONFIG[kpi.id]?.icon ?? <PeopleAltIcon />}
              color={KPI_CONFIG[kpi.id]?.color ?? "#64748B"}
              onClick={() => onCardClick?.(kpi)}
            />
          </Grid>
        );
      })}
      {children}
    </Grid>
  );
};

export default KPICards;