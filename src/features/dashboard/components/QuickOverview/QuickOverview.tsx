
import { Box, Typography, Card, Button } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import "./QuickOverview.css";

interface QuickOverviewData {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  performanceScore: number;
}

interface QuickOverviewProps {
  data: QuickOverviewData;
  onViewReport?: () => void;
}

const QuickOverview = ({ data, onViewReport }: QuickOverviewProps) => {
  const stats = [
    {
      label: "Total\nEmployees",
      value: data.totalEmployees,
      max: 100,
      color: "#4f46e5",
      icon: <PeopleAltIcon fontSize="small" style={{ color: "#4f46e5" }} />,
    },
    {
      label: "Present\nToday",
      value: data.presentToday,
      max: data.totalEmployees,
      color: "#10b981",
      icon: <EventAvailableIcon fontSize="small" style={{ color: "#10b981" }} />,
    },
    {
      label: "Pending\nLeaves",
      value: data.pendingLeaves,
      max: 20,
      color: "#f59e0b",
      icon: <PendingActionsIcon fontSize="small" style={{ color: "#f59e0b" }} />,
    },
    {
      label: "Performance\nScore",
      value: data.performanceScore,
      max: 100,
      color: "#8b5cf6",
      icon: <TrendingUpIcon fontSize="small" style={{ color: "#8b5cf6" }} />,
      isPercentage: true,
    },
  ];

  return (
    <Card className="quick-overview-card" elevation={0}>
      <Box className="quick-overview__header">
        <Typography variant="h6" className="quick-overview__title">
          Quick Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <select className="quick-overview__select">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
        </Box>
      </Box>

      <Box className="quick-overview__charts">
        {stats.map((stat, i) => (
          <Box key={i} className="quick-overview__chart-wrapper">
            <Box className="quick-overview__chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: stat.value },
                      { value: Math.max(0, stat.max - stat.value) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={38}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={10}
                  >
                    <Cell fill={stat.color} />
                    <Cell fill="var(--border)" opacity={0.4} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Box className="quick-overview__chart-icon">
                {stat.icon}
              </Box>
            </Box>
            <Box className="quick-overview__chart-info">
              <Typography variant="h4" className="quick-overview__stat-value">
                {stat.value}{stat.isPercentage ? "%" : ""}
              </Typography>
              <Typography variant="caption" className="quick-overview__stat-label">
                {stat.label.split("\n").map((line, idx) => (
                  <span key={idx}>{line}<br /></span>
                ))}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box className="quick-overview__banner">
        <Box className="quick-overview__banner-icon">
          <AutoAwesomeIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" className="quick-overview__banner-title">
            Keep up the great work!
          </Typography>
          <Typography variant="caption" className="quick-overview__banner-text">
            Your team performance is above target this month.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={onViewReport}
          className="quick-overview__banner-btn"
          endIcon={<span>&rarr;</span>}
        >
          View Report
        </Button>
      </Box>
    </Card>
  );
};

export default QuickOverview;
