import {
    FiHome,
    FiUsers,
    FiCalendar,
    FiClipboard,
    FiTrendingUp,
    FiPieChart,
  } from "react-icons/fi";
  
  export const managerMenu = [
    {
      name: "Dashboard",
      path: "/manager/dashboard",
      icon: <FiHome />,
    },
    {
      name: "My Team",
      path: "/manager/team",
      icon: <FiUsers />,
    },
    {
      name: "Attendance",
      path: "/manager/attendance",
      icon: <FiCalendar />,
    },
    {
      name: "Leave Requests",
      path: "/manager/leave-requests",
      icon: <FiClipboard />,
    },
    {
      name: "Performance",
      path: "/manager/performance",
      icon: <FiTrendingUp />,
    },
    {
      name: "Analytics",
      path: "/manager/analytics",
      icon: <FiPieChart />,
    },
  ];