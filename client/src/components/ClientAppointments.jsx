import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CalendarDays, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Star, ChevronDown, User, Briefcase } from "lucide-react";
import ReviewRating from "./ReviewRating";

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

const requestWithFallback = async (method, path, payload) => {
  let lastError;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${path}`,
        data: payload,
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

export default function ClientAppointments({ userId, userRole = "user" }) {
  const [viewType, setViewType] = useState(userRole === "lawyer" ? "lawyer" : "client");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

  const fetchAppointments = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      let endpoint = "/api/appointments";
      // If viewing as lawyer, filter by lawyerId
      if (viewType === "lawyer" && userId) {
        endpoint = `/api/appointments/lawyer/${userId}`;
      }
      
      const response = await requestWithFallback("get", endpoint);
      
      // Handle both response formats
      let appointmentsData = [];
      if (Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response.data?.appointments) {
        appointmentsData = response.data.appointments;
      }
      
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(err?.response?.data?.message || err?.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [viewType, userId]);

  // Cancel appointment
  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    try {
      await requestWithFallback("put", `/api/appointments/${appointmentId}`, {
        status: "Rejected"
      });
      fetchAppointments();
      alert("Appointment cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert(err?.response?.data?.message || "Failed to cancel appointment");
    }
  };

  // Submit review
  const handleSubmitReview = async (appointmentId) => {
    try {
      await requestWithFallback("post", "/api/reviews", {
        lawyerId: appointments.find(a => a._id === appointmentId)?.lawyerId,
        appointmentId,
        rating: reviewData.rating,
        comment: reviewData.comment
      });
      setShowReviewModal(null);
      setReviewData({ rating: 5, comment: "" });
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err?.response?.data?.message || "Failed to submit review");
    }
  };

  // Filter appointments based on search and status
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const userName = appointment?.userId?.name || appointment?.userName || "";
      const lawyerName = appointment?.lawyerName || "";
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        lawyerName.toLowerCase().includes(searchLower) ||
        (appointment?.caseCategory || "").toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower);

      const appointmentStatus = appointment?.status || "Pending";
      const matchesStatus = statusFilter === "all" || appointmentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  // Calculate counts
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
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFee = (fee) => {
    if (fee === undefined || fee === null) return "-";
    return `$${Number(fee).toLocaleString()}`;
  };

  // Get upcoming appointments (future dates)
  const upcomingAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= new Date() && apt.status !== "Rejected";
  });

  // Get past appointments (past dates or cancelled/completed)
  const pastAppointments = filteredAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate < new Date() || apt.status === "Rejected" || apt.status === "Completed";
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <CalendarDays />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">My Appointments</h2>
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
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <CalendarDays />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">My Appointments</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="text-red-500 mb-3" size={40} />
          <p className="text-gray-600 mb-4">{error}</p>
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
      {/* Header with Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <CalendarDays size={20} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">My Appointments</h2>
          
          {/* View Type Dropdown */}
          <div className="relative">
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value)}
              className="pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 appearance-none bg-white cursor-pointer font-medium"
            >
              <option value="client">Client View</option>
              <option value="lawyer">Lawyer View</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
          
          {/* Status Badges */}
          <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
            {totalAppointments} Total
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            {approvedCount} Confirmed
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
            {rejectedCount} Cancelled
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
            {completedCount} Completed
          </span>
        </div>

        <button
          onClick={() => fetchAppointments(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={viewType === "lawyer" ? "Search by client name, case category..." : "Search by lawyer name, case category..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <XCircle size={14} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="pl-4 pr-8 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Confirmed</option>
          <option value="Rejected">Cancelled</option>
          <option value="Completed">Completed</option>
        </select>

        {(searchQuery || statusFilter !== "all") && (
          <button onClick={clearFilters} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Clear Filters
          </button>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <CalendarDays className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500">No appointments found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Appointments Section */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Upcoming Appointments
              </h3>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment._id} 
                    appointment={appointment} 
                    viewType={viewType}
                    onCancel={handleCancelAppointment}
                    onReview={() => setShowReviewModal(appointment)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments Section */}
          {pastAppointments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <CalendarDays size={18} className="text-gray-500" />
                Appointment History
              </h3>
              <div className="space-y-3">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard 
                    key={appointment._id} 
                    appointment={appointment} 
                    viewType={viewType}
                    isPast
                    onCancel={handleCancelAppointment}
                    onReview={() => setShowReviewModal(appointment)}
                  />
                ))}
              </div>
            </div>
          // </div>
        )}
      </div>
      )}
      {/* Review Modal - Using New ReviewRating Component */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ReviewRating 
            appointment={showReviewModal}
            onClose={() => {
              setShowReviewModal(null);
              setReviewData({ rating: 5, comment: "" });
            }}
            onSubmitSuccess={() => {
              fetchAppointments();
            }}
          />
        </div>
      )}
    </div>
  );
}

// Appointment Card Component
function AppointmentCard({ appointment, viewType, isPast, onCancel, onReview }) {
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
  const lawyerName = appointment?.lawyerName || "-";
  const userEmail = appointment?.userId?.email || appointment?.userEmail || "-";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className={`border rounded-xl p-4 hover:shadow-md transition ${isPast ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            {viewType === "lawyer" ? userName.charAt(0) : lawyerName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {viewType === "lawyer" ? userName : lawyerName}
            </p>
            <p className="text-sm text-gray-500">
              {viewType === "lawyer" ? userEmail : appointment?.lawyerSpecialization || "-"}
            </p>
            <p className="text-sm text-gray-500">
              {appointment?.caseCategory || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium">{formatDate(appointment?.date)}</p>
            <p className="text-gray-500">{appointment?.timeSlot || "-"}</p>
          </div>

          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
            <IconComponent size={12} />
            {status}
          </span>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === "Pending" && !isPast && viewType === "client" && (
              <button
                onClick={() => onCancel(appointment._id)}
                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Cancel
              </button>
            )}
            {status === "Completed" && viewType === "client" && (
              <button
                onClick={onReview}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 flex items-center gap-1"
              >
                <Star size={12} />
                Review
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
