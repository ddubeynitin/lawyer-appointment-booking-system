import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, Flag, CheckCircle, XCircle, Ban, RefreshCw, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AdminReportManagement() {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    
    try {
      const [reportsRes, usersRes, lawyersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/reports`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/users`, { timeout: 10000 }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/api/lawyers`, { timeout: 10000 }).catch(() => ({ data: [] }))
      ]);
      
      setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setLawyers(Array.isArray(lawyersRes.data) ? lawyersRes.data : []);
      
      // Only show empty state, not error - reports endpoint may not exist
      if (!reportsRes.data || reportsRes.data.length === 0) {
        setError(null); // Clear any previous errors
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      // Don't show error to user, just show empty state with refresh option
      setError(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Get user info
  const getUserInfo = (userId) => {
    if (!userId) return { name: "Unknown", email: "-" };
    const user = users.find(u => u._id === userId || u.id === userId);
    return user ? { name: user.name || "Unknown", email: user.email || "-" } : { name: `User ${userId?.slice(-4)}`, email: "-" };
  };

  // Get lawyer info
  const getLawyerInfo = (lawyerId) => {
    if (!lawyerId) return { name: "Unknown", specialization: "-" };
    const lawyer = lawyers.find(l => l._id === lawyerId || l.id === lawyerId);
    return lawyer ? { name: lawyer.name || "Unknown", email: lawyer.email || "-" } : { name: `Lawyer ${lawyerId?.slice(-4)}`, email: "-" };
  };

  // Handle block user
  const handleBlockUser = async (userId) => {
    if (!userId) return;
    
    if (!confirm("Are you sure you want to block this user?")) return;
    
    setActionLoading(userId);
    try {
      await axios.put(`${API_BASE_URL}/api/users/${userId}`, { isActive: false });
      await fetchAllData();
      alert("User blocked successfully!");
    } catch (err) {
      console.error("Failed to block user:", err);
      alert("Failed to block user");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    if (filterStatus === "all") return true;
    return report?.status === filterStatus;
  });

  const pendingReports = reports.filter(r => r?.status !== "Resolved").length;
  const resolvedReports = reports.filter(r => r?.status === "Resolved").length;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-500">Loading reports...</span>
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <Flag size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Report Management</h2>
            <p className="text-sm text-gray-500">Manage client reports against lawyers</p>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-xl text-white">
          <p className="text-xs text-red-100">Total Reports</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-4 rounded-xl text-white">
          <p className="text-xs text-amber-100">Pending</p>
          <p className="text-2xl font-bold">{pendingReports}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white">
          <p className="text-xs text-green-100">Resolved</p>
          <p className="text-2xl font-bold">{resolvedReports}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)} 
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Reports</option>
          <option value="Pending">Pending</option>
          <option value="In Review">In Review</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <Flag className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const clientInfo = getUserInfo(report?.reporterId || report?.userId);
            const lawyerInfo = getLawyerInfo(report?.reportedLawyerId || report?.lawyerId);
            const isBlocked = report?.reporterId ? !users.find(u => u._id === report.reporterId || u.id === report.reporterId)?.isActive : false;
            
            return (
              <div key={report._id || report.id} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                {/* Report Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Report against {lawyerInfo.name}</h3>
                      <p className="text-sm text-gray-500">Reported by: {clientInfo.name}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    report?.status === "Resolved" ? "bg-green-100 text-green-700" :
                    report?.status === "In Review" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {report?.status || "Pending"}
                  </span>
                </div>

                {/* Report Details */}
                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold text-gray-800">Reason:</span> {report?.reason || report?.description || "No reason provided"}
                  </p>
                  {report?.details && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-800">Details:</span> {report.details}
                    </p>
                  )}
                </div>

                {/* Report Meta */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                  <span>Client: {clientInfo.email}</span>
                  <span>Lawyer: {lawyerInfo.email}</span>
                  {report?.createdAt && (
                    <span>Date: {new Date(report.createdAt).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {report?.status !== "Resolved" && (
                    <button
                      onClick={async () => {
                        try {
                          await axios.patch(`${API_BASE_URL}/api/reports/${report._id}`, { status: "Resolved" });
                          await fetchAllData();
                          alert("Report marked as resolved!");
                        } catch (err) {
                          alert("Failed to update report");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={16} /> Mark Resolved
                    </button>
                  )}
                  {report?.status === "Pending" && (
                    <button
                      onClick={async () => {
                        try {
                          await axios.patch(`${API_BASE_URL}/api/reports/${report._id}`, { status: "In Review" });
                          await fetchAllData();
                          alert("Report marked as in review!");
                        } catch (err) {
                          alert("Failed to update report");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw size={16} /> Mark In Review
                    </button>
                  )}
                  {!isBlocked && report?.reporterId && (
                    <button
                      onClick={() => handleBlockUser(report.reporterId)}
                      disabled={actionLoading === report.reporterId}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Ban size={16} />
                      {actionLoading === report.reporterId ? "Blocking..." : "Block Client"}
                    </button>
                  )}
                  {isBlocked && (
                    <span className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg">
                      <XCircle size={16} /> Client Blocked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
