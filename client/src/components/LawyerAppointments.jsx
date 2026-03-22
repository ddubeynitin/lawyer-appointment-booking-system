import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CalendarDays, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function LawyerAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lawyerFilter, setLawyerFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/appointments`, { timeout: 10000 });
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
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

  const fetchLawyers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/lawyers`, { timeout: 5000 });
      const lawyerList = Array.isArray(response.data) ? response.data : [];
      setLawyers(lawyerList);
    } catch (err) {
      console.error("Failed to fetch lawyers:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchLawyers();
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const userName = appointment?.userId?.name || appointment?.userName || "";
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (appointment?.lawyerName || "").toLowerCase().includes(searchLower) ||
        (appointment?.caseCategory || "").toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower);

      const appointmentStatus = appointment?.status || "Pending";
      const matchesStatus = statusFilter === "all" || appointmentStatus === statusFilter;

      const matchesLawyer = lawyerFilter === "all" || 
        (appointment?.lawyerName && appointment?.lawyerName.toLowerCase() === lawyerFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesLawyer;
    });
  }, [appointments, searchQuery, statusFilter, lawyerFilter]);

  const appointmentsByLawyer = useMemo(() => {
    const grouped = {};
    filteredAppointments.forEach((appointment) => {
      const lawyerName = appointment?.lawyerName || "Unknown Lawyer";
      if (!grouped[lawyerName]) {
        grouped[lawyerName] = { lawyerName, appointments: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 } };
      }
      grouped[lawyerName].appointments.push(appointment);
      grouped[lawyerName].stats.total++;
      const status = appointment?.status || "Pending";
      if (status === "Pending") grouped[lawyerName].stats.pending++;
      else if (status === "Approved") grouped[lawyerName].stats.approved++;
      else if (status === "Rejected") grouped[lawyerName].stats.rejected++;
      else if (status === "Completed") grouped[lawyerName].stats.completed++;
    });
    return Object.values(grouped);
  }, [filteredAppointments]);

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a?.status === "Pending").length;
  const approvedCount = appointments.filter(a => a?.status === "Approved").length;
  const rejectedCount = appointments.filter(a => a?.status === "Rejected").length;
  const completedCount = appointments.filter(a => a?.status === "Completed").length;

  const clearFilters = () => { setSearchQuery(""); setStatusFilter("all"); setLawyerFilter("all"); };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (timeString) => timeString || "-";
  const formatFee = (fee) => fee === undefined || fee === null ? "-" : `$${Number(fee).toLocaleString()}`;
  const getLawyerImage = (lawyerName) => { if (!lawyerName) return null; const lawyer = lawyers.find(l => l.name === lawyerName); return lawyer?.profileImage || null; };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><CalendarDays /></div>
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
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
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-gray-600 mb-4 text-center">{error}</p>
          <button onClick={() => fetchAppointments()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><CalendarDays size={20} /></div>
          <h2 className="text-xl font-semibold text-gray-800">Lawyer Appointments</h2>
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
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Confirmed</option>
          <option value="Rejected">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={lawyerFilter} onChange={(e) => setLawyerFilter(e.target.value)} className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer">
          <option value="all">All Lawyers</option>
          {lawyers.map((lawyer) => (<option key={lawyer._id} value={lawyer.name}>{lawyer.name}</option>))}
        </select>
        {(searchQuery || statusFilter !== "all" || lawyerFilter !== "all") && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">Clear</button>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <CalendarDays className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {appointmentsByLawyer.map((lawyerGroup) => {
            const lawyerImage = getLawyerImage(lawyerGroup.lawyerName);
            const lawyerInitial = lawyerGroup.lawyerName?.charAt(0)?.toUpperCase() || "L";
            return (
              <div key={lawyerGroup.lawyerName} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {lawyerImage ? (
                        <img src={lawyerImage} alt={lawyerGroup.lawyerName} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">{lawyerInitial}</div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{lawyerGroup.lawyerName}</p>
                        <p className="text-xs text-gray-500">{lawyerGroup.appointments.length} appointments</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">{lawyerGroup.stats.pending} Pending</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">{lawyerGroup.stats.approved} Confirmed</span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{lawyerGroup.stats.completed} Completed</span>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date & Time</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fee</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lawyerGroup.appointments.map((appointment) => {
                        const status = appointment?.status || "Pending";
                        const statusConfig = {
                          Pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
                          Approved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
                          Rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
                          Completed: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
                        };
                        const config = statusConfig[status] || statusConfig.Pending;
                        const IconComponent = config.icon;
                        const userName = appointment?.userId?.name || appointment?.userName || "Client";
                        const userEmail = appointment?.userId?.email || "-";
                        const userInitial = userName?.charAt(0)?.toUpperCase() || "C";
                        return (
                          <tr key={appointment._id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">{userInitial}</div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{userName}</p>
                                  <p className="text-xs text-gray-500">{userEmail}</p>
                                </div>
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
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
                                <IconComponent size={10} /> {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
