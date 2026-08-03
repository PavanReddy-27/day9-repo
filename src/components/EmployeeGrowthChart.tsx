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
  { month: "Jan", employees: 120 },
  { month: "Feb", employees: 140 },
  { month: "Mar", employees: 170 },
  { month: "Apr", employees: 190 },
  { month: "May", employees: 230 },
  { month: "Jun", employees: 250 },
];

const EmployeeGrowthChart = () => {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <LineChart data={data} margin={{ top: 6, right: 6, left: -6, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.28} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="employees"
          stroke="#4F46E5"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EmployeeGrowthChart;