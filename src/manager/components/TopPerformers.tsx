import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  EmojiEvents,
  TrendingUp,
} from "@mui/icons-material";

import { apiClient } from "../../services/apiClient";
import "./TopPerformers.css";

interface Performer {
  id: string;
  name: string;
  role: string;
  score: number;
  productivity: number;
  avatar: string;
  badge: string;
  color: string;
}

const BADGE_COLORS = [
  { badge: "Top Performer", color: "var(--warning)" },
  { badge: "Outstanding", color: "var(--text-light)" },
  { badge: "Excellent", color: "var(--info)" },
  { badge: "Consistent", color: "var(--success)" },
];

const TopPerformers = () => {
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadTopPerformers = async () => {
      try {
        const data = await apiClient<any[]>("/employees?limit=30");
        if (!isMounted || !Array.isArray(data)) return;

        // Sort by performanceScore or productivity descending
        const sorted = [...data].sort((a, b) => {
          const scoreA = Number(a.performanceScore) || 0;
          const scoreB = Number(b.performanceScore) || 0;
          return scoreB - scoreA;
        });

        const top = sorted.slice(0, 4).map((emp, index) => {
          const score = Math.min(100, Math.max(70, Math.round(Number(emp.performanceScore) || (88 - index * 3))));
          const prod = Math.min(100, Math.max(70, Math.round(Number(emp.productivity) || (score - 2))));
          const badgeConfig = BADGE_COLORS[index] || BADGE_COLORS[0];
          const name = emp.fullName || `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee";
          const initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "E";

          return {
            id: emp._id || emp.employeeId || String(index),
            name,
            role: emp.designation || emp.role || "Team Member",
            score,
            productivity: prod,
            avatar: initials,
            badge: badgeConfig.badge,
            color: badgeConfig.color,
          };
        });

        setPerformers(top);
      } catch (err) {
        console.error("Failed to load top performers:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTopPerformers();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <Paper elevation={3} className="top-performers">
      <Stack
        direction="row"
        className="top-header"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" className="top-title">
          🏆 Top Performers
        </Typography>

        <TrendingUp color="success" />
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : performers.length === 0 ? (
        <Box sx={{ py: 3, textAlign: "center", color: "var(--text-light)" }}>
          <Typography variant="body2">No performance records recorded yet.</Typography>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          {performers.map((employee, index) => (
            <Box key={employee.id} className="performer-card">
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Typography className="performer-rank">
                  #{index + 1}
                </Typography>

                <Avatar
                  className="performer-avatar"
                  sx={{
                    bgcolor: employee.color,
                  }}
                >
                  {employee.avatar}
                </Avatar>

                <Box>
                  <Typography className="performer-name">
                    {employee.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {employee.role}
                  </Typography>
                </Box>
              </Stack>

              <EmojiEvents
                sx={{
                  color: employee.color,
                  fontSize: 28,
                }}
              />
            </Stack>

            <Stack
              direction="row"
              className="score-row"
              sx={{ justifyContent: "space-between" }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Performance Score
              </Typography>

              <Typography sx={{ fontWeight: 700 }}>
                {employee.score}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={employee.score}
              className="progress-bar"
            />

            <Stack
              direction="row"
              className="bottom-row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Productivity <strong>{employee.productivity}%</strong>
              </Typography>

              <Chip
                label={employee.badge}
                size="small"
                color="success"
              />
            </Stack>
          </Box>
        ))}
        </Stack>
      )}
    </Paper>
  );
};

export default TopPerformers;