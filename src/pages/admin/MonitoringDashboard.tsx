import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material';
import { monitoringApi, SystemHealthData } from '../../services/api/monitoring';
import { ShieldAlert, Activity, Users, Database } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

export default function MonitoringDashboard() {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await monitoringApi.getSystemHealth();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch monitoring data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return <Box sx={{ p: 3 }}><Typography>Loading metrics...</Typography></Box>;

  const pieData = Object.entries(data.errorCounts).map(([key, value]) => ({
    name: key,
    value
  })).filter(item => item.value > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          System Monitoring & Health
        </Typography>
        <Button
          component={Link}
          to="/admin/system-health"
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
          }}
        >
          View Operations Telemetry & DLQ &rarr;
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Activity color={data.health.api === 'healthy' ? 'green' : 'red'} size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">API Status</Typography>
                  <Typography variant="h6">{data.health.api.toUpperCase()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Database color={data.health.database === 'healthy' ? 'green' : 'red'} size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Database Status</Typography>
                  <Typography variant="h6">{data.health.database.toUpperCase()}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users color="#1976d2" size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Active Sessions</Typography>
                  <Typography variant="h6">{data.activeSessions}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShieldAlert color="orange" size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Errors (24h)</Typography>
                  <Typography variant="h6">
                    {Object.values(data.errorCounts).reduce((a, b) => a + b, 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Row 2 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Activity color="#9c27b0" size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Avg Response Time</Typography>
                  <Typography variant="h6">{data.avgResponseTime || 0} ms</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Users color="#00bcd4" size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Connected SSE Clients</Typography>
                  <Typography variant="h6">{data.connectedClients || 0}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Database color={data.backgroundJobStatus === 'Failed' ? 'red' : 'green'} size={40} />
                <Box>
                  <Typography variant="subtitle2" color="textSecondary">Background Jobs</Typography>
                  <Typography variant="h6">{data.backgroundJobStatus || "Never Run"}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Errors by Category (24h)</Typography>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography color="textSecondary">No errors recorded in the last 24h</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>Recent System Logs</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>User</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.recentErrors.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <Chip size="small" label={log.level} color={log.level === 'error' || log.level === 'fatal' ? 'error' : 'warning'} />
                      </TableCell>
                      <TableCell>{log.category}</TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.userId?.email || 'System'}</TableCell>
                    </TableRow>
                  ))}
                  {data.recentErrors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">No recent errors</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
