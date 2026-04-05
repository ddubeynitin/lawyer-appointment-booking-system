import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CalendarDays, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

// API URL with fallback mechanism
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const normalizeBaseUrl = (url = "") => url.trim().replace(/\/+$/, "");

const API_BASE_CANDIDATES = Array.from(
  new Set(
    [
      normalizeBaseUrl(VITE_API_BASE_URL),
      normalizeBaseUrl(window.location.origin),
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
    ].filter(Boolean),
  ),
);

const requestWithFallback = async (method, path, payload = null, timeout = 10000) => {
  let lastError;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${path}`,
        data: payload,
        timeout,
      });
      return response;
    } catch (error) {
      lastError = error;
      const isNetworkError = !error?.response;
      if (!isNetworkError) {
        throw error;
      }
    }
  }

  throw lastError;
};

export default function UserAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/appointments`, { timeout: 10000 });
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      if (err.code === 'ECONNABORTED') {
        setError("Request timed out. Please check if the server is running.");
      } else {
        setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load appointments. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, { timeout: 5000 });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchUsers();
  }, []);

  // Get user info helper function
  const getUserInfo = (userId) => {
    if (!userId) return { name: "Unknown", email: "-", profileImage: null };
    
    // Check if userId is already populated
    if (typeof userId === 'object' && userId.name) {
      return {
        name: userId.name,
        email: userId.email || "-",
        profileImage: userId.profileImage || null
      };
    }
    
    // Find user from users list
    const userIdStr = typeof userId === 'string' ? userId : userId?._id;
    const user = users.find(u => u._id === userIdStr || u.id === userIdStr);
    
    if (user) {
      return {
        name: user.name || "Unknown",
        email: user.email || "-",
        profileImage: user.profileImage || null
      };
    }
    
    return { name: userIdStr ? `User ${userIdStr.slice(-4)}` : "Unknown", email: "-", profileImage: null };
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const userInfo = getUserInfo(appointment?.userId);
      const userName = userInfo.name;
      const userEmail = userInfo.email;
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (appointment?.lawyerName || "").toLowerCase().includes(searchLower) ||
        (appointment?.caseCategory || "").toLowerCase().includes(searchLower) ||
        (appointment?.caseDescription || "").toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower) ||
        userEmail.toLowerCase().includes(searchLower);

      const appointmentStatus = appointment?.status || "Pending";
      const matchesStatus = statusFilter === "all" || appointmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, users, searchQuery, statusFilter]);

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a?.status === "Pending").length;
  const approvedCount = appointments.filter(a => a?.status === "Approved").length;
  const rejectedCount = appointments.filter(a => a?.status === "Rejected").length;
  const completedCount = appointments.filter(a => a?.status === "Completed").length;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (timeString) => timeString || "-";

  const formatFee = (fee) => {
    if (fee === undefined || fee === null) return "-";
    return `$${Number(fee).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><CalendarDays /></div>
          <h2 className="text-xl font-semibold text-gray-800">User Appointments</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading appointments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><CalendarDays /></div>
          <h2 className="text-xl font-semibold text-gray-800">User Appointments</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button
            onClick={() => fetchAppointments()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><CalendarDays size={20} /></div>
          <h2 className="text-xl font-semibold text-gray-800">User Appointments</h2>
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

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, email, lawyer or category..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Confirmed</option>
          <option value="Rejected">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
        {(searchQuery || statusFilter !== "all") && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">Clear</button>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <CalendarDays className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No appointments found.</p>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => {
                  const status = appointment?.status || "Pending";
                  const statusConfig = {
                    Pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
                    Approved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
                    Rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
                    Completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
                  };
                  const config = statusConfig[status] || statusConfig.Pending;
                  const IconComponent = config.icon;
                  
                  // Get user info using helper function
                  const userInfo = getUserInfo(appointment?.userId);
                  const userInitial = userInfo.name?.charAt(0)?.toUpperCase() || "C";

                  return (
                    <tr key={appointment._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {userInfo.profileImage ? (
                            <img src={userInfo.profileImage} alt={userInfo.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">{userInitial}</div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{userInfo.name}</p>
                            <p className="text-xs text-gray-500">{userInfo.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{appointment?.lawyerName || "-"}</p>
                          <p className="text-xs text-gray-500">{appointment?.lawyerSpecialization || "-"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{appointment?.caseCategory || "-"}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-900">{formatDate(appointment?.date)}</p>
                          <p className="text-xs text-gray-500">{formatTime(appointment?.timeSlot)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatFee(appointment?.feeCharged)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
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
