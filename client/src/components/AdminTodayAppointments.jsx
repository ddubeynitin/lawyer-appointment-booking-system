import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Search, RefreshCw, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminTodayAppointments({
  onAppointmentClick,
  onTodayCountChange,
}) {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Get today's date
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const fetchAppointments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/appointments`, { timeout: 10000 });
      const allAppointments = Array.isArray(response.data) ? response.data : [];
      
      // Filter today's appointments
      const todayAppointments = allAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
        return appointmentDate === todayString;
      });
      
      setAppointments(todayAppointments);
      if (onTodayCountChange) onTodayCountChange(todayAppointments.length);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please check if the server is running.");
      } else {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load appointments.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, { timeout: 5000 });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchLawyers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lawyers`, { timeout: 5000 });
      setLawyers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch lawyers:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
    fetchLawyers();
  }, []);

  // Get user info helper function
  const getUserInfo = (userId) => {
    if (!userId) return { name: "Unknown", email: "-", profileImage: null };
    
    if (typeof userId === 'object' && userId.name) {
      return {
        name: userId.name,
        email: userId.email || "-",
        profileImage: userId.profileImage || userId.profilePicture || null
      };
    }
    
    const userIdStr = typeof userId === 'string' ? userId : userId?._id;
    const user = users.find(u => u._id === userIdStr || u.id === userIdStr);
    
    if (user) {
      return {
        name: user.name || "Unknown",
        email: user.email || "-",
        profileImage: user.profileImage || user.profilePicture || null
      };
    }
    
    return { name: userIdStr ? `User ${userIdStr.slice(-4)}` : "Unknown", email: "-", profileImage: null };
  };

  // Get lawyer info helper function
  const getLawyerInfo = (lawyerId) => {
    if (!lawyerId) return { name: "-", specialization: "-" };
    
    if (typeof lawyerId === 'object' && lawyerId.name) {
      return {
        name: lawyerId.name,
        specialization: lawyerId.specializations?.[0] || "-"
      };
    }
    
    const lawyerIdStr = typeof lawyerId === 'string' ? lawyerId : lawyerId?._id;
    const lawyer = lawyers.find(l => l._id === lawyerIdStr || l.id === lawyerIdStr);
    
    if (lawyer) {
      return {
        name: lawyer.name || "Unknown",
        specialization: lawyer.specializations?.[0] || "-"
      };
    }
    
    return { name: "-", specialization: "-" };
  };

  // Filter appointments based on search and status
  const filteredAppointments = appointments.filter((appointment) => {
    const userInfo = getUserInfo(appointment?.userId);
    const lawyerInfo = getLawyerInfo(appointment?.lawyerId);
    const userName = userInfo.name;
    const userEmail = userInfo.email;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (lawyerInfo.name || "").toLowerCase().includes(searchLower) ||
      (lawyerInfo.specialization || "").toLowerCase().includes(searchLower) ||
      (appointment?.caseCategory || "").toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      userEmail.toLowerCase().includes(searchLower);

    const appointmentStatus = appointment?.status || "Pending";
    const matchesStatus = statusFilter === "all" || appointmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a?.status === "Pending").length;
  const approvedCount = appointments.filter(a => a?.status === "Approved").length;
  const rejectedCount = appointments.filter(a => a?.status === "Rejected").length;
  const completedCount = appointments.filter(a => a?.status === "Completed").length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const formatTime = (timeString) => timeString || "-";

  const formatFee = (fee) => {
    if (fee === undefined || fee === null) return "-";
    return `₹${Number(fee).toLocaleString()}`;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Approved":
        return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle };
      case "Pending":
        return { bg: "bg-amber-100", text: "text-amber-700", icon: Clock };
      case "Rejected":
        return { bg: "bg-red-100", text: "text-red-700", icon: XCircle };
      case "Completed":
        return { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="ml-3 text-gray-500">Loading today's appointments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={() => fetchAppointments()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600"><Calendar size={20} /></div>
          <h2 className="text-xl font-semibold text-gray-800">Today's Appointments</h2>
          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">{totalAppointments} Total</span>
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">{pendingCount} Pending</span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">{approvedCount} Confirmed</span>
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">{rejectedCount} Cancelled</span>
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">{completedCount} Completed</span>
        </div>
        <button onClick={() => fetchAppointments(true)} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, lawyer or category..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" 
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Confirmed</option>
          <option value="Rejected">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
        {(searchQuery || statusFilter !== "all") && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <Calendar className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No appointments scheduled for today.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="max-h-[60vh] overflow-x-auto overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Lawyer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => {
                  const status = appointment?.status || "Pending";
                  const statusConfig = getStatusConfig(status);
                  const IconComponent = statusConfig.icon;
                  
                  const userInfo = getUserInfo(appointment?.userId);
                  const lawyerInfo = getLawyerInfo(appointment?.lawyerId);

                  return (
                    <tr 
                      key={appointment._id} 
                      onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{userInfo.name}</p>
                          <p className="text-xs text-gray-500">{userInfo.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{lawyerInfo.name}</p>
                          <p className="text-xs text-gray-500">{lawyerInfo.specialization}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{appointment?.caseCategory || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{formatTime(appointment?.timeSlot)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatFee(appointment?.feeCharged)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          <IconComponent size={12} /> {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
