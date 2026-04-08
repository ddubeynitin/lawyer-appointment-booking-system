import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { TrendingUp, DollarSign, RefreshCw, CheckCircle, AlertCircle, Users, Shield, Clock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Revenue({ 
  appointmentsData, 
  usersData, 
  lawyersData,
  refreshKey 
}) {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");

  // Fetch all data
  const fetchAllData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const [appointmentsRes, usersRes, lawyersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointments`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/users`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/lawyers`, { timeout: 10000 }).catch(() => ({ data: [] }))
      ]);
      
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setLawyers(Array.isArray(lawyersRes.data) ? lawyersRes.data : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err?.response?.data?.message || "Failed to load data. Please check if the server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData, refreshKey]);

  // Use props data if available, otherwise use state
  const allAppointments = appointmentsData || appointments;
  const allUsers = usersData || users;
  const allLawyers = lawyersData || lawyers;

  // Calculate dynamic statistics
  const totalUsers = allUsers.length;
  const totalLawyers = allLawyers.length;
  const approvedLawyers = allLawyers.filter(l => l?.verification === "Approved").length;
  const pendingLawyers = allLawyers.filter(l => l?.verification !== "Approved").length;
  
  // Completed appointments with revenue
  const completedAppointments = allAppointments.filter(a => a?.status === "Completed");
  const pendingAppointments = allAppointments.filter(a => a?.status === "Pending");
  const totalAppointmentsCount = allAppointments.length;
  
  // Filter by time
  const filteredAppointments = completedAppointments.filter(appointment => {
    if (timeFilter === "all") return true;
    
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    
    if (timeFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return appointmentDate >= today;
    }
    
    if (timeFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appointmentDate >= weekAgo;
    }
    
    if (timeFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return appointmentDate >= monthAgo;
    }
    
    return true;
  });

  // Dynamic revenue calculations
  const totalRevenue = filteredAppointments.reduce((sum, a) => sum + Number(a?.feeCharged || 0), 0);
  const completedCount = filteredAppointments.length;
  const averageRevenue = completedCount > 0 ? totalRevenue / completedCount : 0;

  // Filtered appointments based on time filter
  const getFilteredAppointments = () => {
    if (timeFilter === "all") return completedAppointments;
    if (timeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return completedAppointments.filter(a => new Date(a.date) >= today);
    }
    if (timeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return completedAppointments.filter(a => new Date(a.date) >= weekAgo);
    }
    if (timeFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return completedAppointments.filter(a => new Date(a.date) >= monthAgo);
    }
    return completedAppointments;
  };

  const filteredForChart = getFilteredAppointments();

  // Weekly revenue for chart - based on filter
  const getWeeklyData = () => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      
      const weekRevenue = filteredForChart
        .filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate >= weekStart && appointmentDate <= weekEnd;
        })
        .reduce((sum, a) => sum + Number(a?.feeCharged || 0), 0);
      
      weeks.push({ 
        label: `W${4-i}`, 
        revenue: weekRevenue,
        date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return weeks;
  };

  // Monthly revenue for chart - based on filter
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthRevenue = filteredForChart
        .filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate.getMonth() === date.getMonth() && appointmentDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, a) => sum + Number(a?.feeCharged || 0), 0);
      
      months.push({ month: monthName, revenue: monthRevenue });
    }
    return months;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  
  const maxWeekRevenue = Math.max(...weeklyData.map(w => w.revenue), 1);
  const maxMonthRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-500">Loading revenue data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={() => fetchAllData()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-xl text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Revenue Dashboard</h2>
            <p className="text-sm text-gray-500">Live data from server</p>
          </div>
        </div>
        <button 
          onClick={() => fetchAllData(true)} 
          disabled={refreshing} 
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={18} />
            <p className="text-green-100 text-xs">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 rounded-xl text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={18} />
            <p className="text-blue-100 text-xs">Completed</p>
          </div>
          <p className="text-2xl font-bold">{completedCount}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-4 rounded-xl text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} />
            <p className="text-violet-100 text-xs">Avg. per Case</p>
          </div>
          <p className="text-2xl font-bold">₹{averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl text-white shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} />
            <p className="text-amber-100 text-xs">Pending</p>
          </div>
          <p className="text-2xl font-bold">{pendingAppointments.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(e.target.value)} 
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Weekly Revenue Chart */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Weekly Revenue</h3>
          <div className="flex items-end justify-between gap-2 h-28">
            {weeklyData.map((week, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-white rounded-t-lg relative" style={{ height: '80px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all"
                    style={{ height: `${(week.revenue / maxWeekRevenue) * 100}%`, minHeight: week.revenue > 0 ? '4px' : '0' }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700">{week.label}</span>
                <span className="text-xs text-gray-500">₹{week.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Monthly Revenue</h3>
          <div className="flex items-end justify-between gap-2 h-28">
            {monthlyData.map((month, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-white rounded-t-lg relative" style={{ height: '80px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all"
                    style={{ height: `${(month.revenue / maxMonthRevenue) * 100}%`, minHeight: month.revenue > 0 ? '4px' : '0' }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700">{month.month}</span>
                <span className="text-xs text-gray-500">₹{month.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Completed Appointments</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[35vh] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.slice(0, 15).map((appointment, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-700">{appointment?.clientName || "N/A"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {appointment?.date ? new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{appointment?.caseCategory || "-"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">₹{Number(appointment?.feeCharged || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle size={12} /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-10 text-center text-gray-500">
                      No completed appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
