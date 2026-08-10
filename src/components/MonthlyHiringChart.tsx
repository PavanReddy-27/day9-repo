import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", hires: 8, exits: 3 },
  { month: "Feb", hires: 12, exits: 5 },
  { month: "Mar", hires: 15, exits: 4 },
  { month: "Apr", hires: 20, exits: 6 },
  { month: "May", hires: 22, exits: 8 },
  { month: "Jun", hires: 18, exits: 5 },
];

const MonthlyHiringChart = () => {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 6, right: 6, left: -6, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.22} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="hires"
          stroke="#4F46E5"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="exits"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyHiringChart;
