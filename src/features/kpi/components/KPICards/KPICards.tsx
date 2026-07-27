// src/features/kpi/components/KPICards/KPICards.tsx

import type { ReactNode } from "react";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

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
}

interface KPICardsProps {
  data: KPIItem[];
  loading?: boolean;
  onCardClick?: (kpi: KPIItem) => void;
}

interface KPIConfig {
  icon: ReactNode;
  color: string;
}

const KPI_CONFIG: Partial<Record<KPIType, KPIConfig>> = {
  totalEmployees: {
    icon: <PeopleAltIcon />,
    color: "#2563EB",
  },
  activeEmployees: {
    icon: <PersonIcon />,
    color: "#16A34A",
  },
  newHires: {
    icon: <PersonAddAlt1Icon />,
    color: "#0284C7",
  },
  attritionRate: {
    icon: <TrendingDownIcon />,
    color: "#EA580C",
  },
  trainingCompletion: {
    icon: <SchoolIcon />,
    color: "#7C3AED",
  },
  skillCoverage: {
    icon: <WorkspacePremiumIcon />,
    color: "#0891B2",
  },
  highRiskEmployees: {
    icon: <WarningAmberIcon />,
    color: "#DC2626",
  },
  departments: {
    icon: <BusinessCenterIcon />,
    color: "#475569",
  },
};

const KPICards = ({
  data,
  loading = false,
  onCardClick,
}: KPICardsProps) => {
  if (loading) {
    return (
      <Box className="kpi-cards__loading">
        <Typography>
          Loading KPI Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      className="kpi-cards"
    >
      {data.map((kpi) => (
        <Grid
          key={kpi.id}
          size={{
            xs: 12,
            sm: 6,
            md: 3,
            lg: 3,
            xl: 3,
          }}
        >
          <KPICard
            title={kpi.title}
            value={kpi.value}
            trend={kpi.trend}
            subtitle={kpi.subtitle}
            progress={kpi.progress}
            footer={kpi.footer}
            icon={
              KPI_CONFIG[kpi.id]?.icon ?? <PeopleAltIcon />
            }
            color={
              KPI_CONFIG[kpi.id]?.color ?? "#64748B"
            }
            onClick={() => onCardClick?.(kpi)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default KPICards;