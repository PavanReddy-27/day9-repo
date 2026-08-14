import React, { useEffect, useState, useMemo } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import authApi from "../../services/authApi";
import { getEmployees } from "../../api/clients/employeeApi";
import { getWorkforceAnalytics, getAttendanceAnalytics, getPerformanceAnalytics } from "../../api/clients/analyticsApi";
import { LineChart, DonutChart } from "../../components/charts";

interface TeamMember {
  _id: string;
  fullName: string;
  email: string;
  designation: string;
  workMode: string;
  employmentStatus: string;
  riskLevel: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const TeamLeadDashboard: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [workforceData, setWorkforceData] = useState<any>(null);
  const [, setAttendanceData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);

  const user = authApi.getCurrentUser();

  const loadTeamData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empData, workforce, attendance, performance] = await Promise.all([
        getEmployees({ limit: 100, search: searchQuery || undefined }),
        getWorkforceAnalytics(),
        getAttendanceAnalytics(),
        getPerformanceAnalytics()
      ]);
      setTeamMembers(empData.data);
      setWorkforceData(workforce);
      setAttendanceData(attendance);
      setPerformanceData(performance);
    } catch (err: any) {
      setError(err.message || "Network error while fetching team data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTeamData();
  }, [searchQuery]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesSearch =
        (m.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (m.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || m.employmentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [teamMembers, searchQuery, statusFilter]);

  const kpis = useMemo(() => {
    const total = filteredMembers.length;
    const active = filteredMembers.filter((m) => m.employmentStatus === "Active").length;
    const highRisk = filteredMembers.filter(
      (m) => m.riskLevel === "High" || m.riskLevel === "Critical"
    ).length;
    const remote = filteredMembers.filter((m) => m.workMode === "Remote").length;

    return { total, active, highRisk, remote };
  }, [filteredMembers]);

  const workModeData = workforceData?.workModeDistribution?.map((s: any) => ({
    name: s.name,
    value: s.value,
  })) || [];

  return (
    <motion.div 
      className="p-6 space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-h)] tracking-tight">
            Team Lead Dashboard
          </h1>
          <p className="text-sm text-[var(--text-light)]">
            Welcome back, {user?.fullName || "Team Lead"} • Managed Team Scoped Analytics
          </p>
        </div>
        <button
          onClick={loadTeamData}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-300 w-fit transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Team Data
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-5 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 cursor-default transition-all duration-300"
          style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)' }}
        >
          <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-light)] uppercase tracking-wider mb-1">
              Team Members
            </p>
            <p className="text-3xl font-black text-[var(--text-h)]">
              {kpis.total}
            </p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-5 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 cursor-default transition-all duration-300"
          style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)' }}
        >
          <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-light)] uppercase tracking-wider mb-1">
              Active Members
            </p>
            <p className="text-3xl font-black text-[var(--text-h)]">
              {kpis.active}
            </p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-5 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 cursor-default transition-all duration-300"
          style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)' }}
        >
          <div className="p-3.5 bg-red-500/10 text-red-500 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-light)] uppercase tracking-wider mb-1">
              High / Critical Risk
            </p>
            <p className="text-3xl font-black text-[var(--text-h)]">
              {kpis.highRisk}
            </p>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          className="p-5 rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] flex items-center gap-4 cursor-default transition-all duration-300"
          style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)' }}
        >
          <div className="p-3.5 bg-purple-500/10 text-purple-500 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-light)] uppercase tracking-wider mb-1">
              Remote Work
            </p>
            <p className="text-3xl font-black text-[var(--text-h)]">
              {kpis.remote}
            </p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96">
          <LineChart
            title="Team Performance Trends"
            data={performanceData}
            xAxisKey="month"
            series={[{ dataKey: "avgRating", name: "Avg Rating", color: "var(--primary)" }]}
            loading={loading}
            error={error || undefined}
            onRefresh={loadTeamData}
          />
        </div>
        <div className="h-96">
          <DonutChart
            title="Team Work Mode Distribution"
            data={workModeData}
            loading={loading}
            error={error || undefined}
            onRefresh={loadTeamData}
            centerLabel="Modes"
          />
        </div>
      </motion.div>

      {/* Filters & Table */}
      <motion.div 
        variants={itemVariants} 
        className="rounded-2xl shadow-[var(--shadow)] border border-[var(--border)] p-6 space-y-4"
        style={{ background: 'var(--surface)', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-light)]" />
            <input
              type="text"
              placeholder="Search team member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm bg-transparent border-[var(--border)] text-[var(--text-h)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[var(--text-light)]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-xl text-sm bg-transparent border-[var(--border)] text-[var(--text-h)] focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
            </select>
          </div>
        </div>

        {loading && teamMembers.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-light)]">Loading team members...</div>
        ) : error && teamMembers.length === 0 ? (
          <div className="py-12 text-center text-red-500">{error}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-light)]">No team members match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-light)]">
              <thead className="uppercase text-xs font-bold tracking-wider border-b border-[var(--border)] text-[var(--text-h)]">
                <tr>
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Work Mode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredMembers.map((m) => (
                  <motion.tr 
                    key={m._id} 
                    whileHover={{ backgroundColor: 'var(--hover)' }}
                    className="transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-semibold text-[var(--text-h)]">
                      {m.fullName}
                      <div className="text-xs font-normal opacity-70 mt-0.5">{m.email}</div>
                    </td>
                    <td className="px-4 py-3">{m.designation}</td>
                    <td className="px-4 py-3">{m.workMode}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-bold tracking-wide">
                        {m.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide border ${
                          m.riskLevel === "High" || m.riskLevel === "Critical"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : "bg-gray-500/10 text-[var(--text)] border-[var(--border)]"
                        }`}
                      >
                        {m.riskLevel}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TeamLeadDashboard;

