import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const data = [
  { name: "Engineering", value: 40 },
  { name: "HR", value: 20 },
  { name: "Sales", value: 25 },
  { name: "Finance", value: 15 },
];

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const DepartmentDonutChart = () => {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={48}
          outerRadius={76}
          label={{ fill: "#334155", fontSize: 12 }}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index]}
            />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DepartmentDonutChart;