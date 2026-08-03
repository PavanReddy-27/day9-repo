import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { name: "IT", value: 70 },
  { name: "HR", value: 30 },
  { name: "Sales", value: 55 },
  { name: "Finance", value: 25 },
];

const EmployeeBarChart = () => {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 6, right: 6, left: -6, bottom: 0 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "rgba(15, 23, 42, 0.04)" }} />
        <Bar
          dataKey="value"
          fill="#10B981"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EmployeeBarChart;