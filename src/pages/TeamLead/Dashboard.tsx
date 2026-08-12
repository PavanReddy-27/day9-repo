import React from "react";
import { useAppSelector } from "../../hooks/redux";
import AttendanceTracker from "../../components/Attendance/AttendanceTracker";

const TeamLeadDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Team Lead Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back, {user?.fullName || "Team Lead"}! Managing team scope & assigned projects.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <AttendanceTracker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Team Members</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">12</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">10 Active Today</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">On-Time Arrival</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">92%</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">+3% vs last week</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Active Sprint Tasks</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">28</p>
          <p className="text-xs text-indigo-600 mt-1 font-medium">18 Completed</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Pending Corrections</p>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">2</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Requires review</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Team Performance Overview</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Showing synchronized attendance and productivity metrics for your assigned team scope.
        </p>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
