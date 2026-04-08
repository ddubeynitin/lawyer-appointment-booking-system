import React, { useState, useEffect } from "react";
import { X, Calendar, User, Mail, Phone, Briefcase, DollarSign, AlertCircle } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function UserAppointmentDetails({ appointment, onClose }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await axios.get(`${API_URL}/lawyers`, { timeout: 5000 });
        setLawyers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch lawyers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLawyers();
  }, []);

  if (!appointment) return null;

  // Get client info
  const getClientInfo = () => {
    if (appointment?.userId?.name) {
      return {
        name: appointment.userId.name,
        email: appointment.userId.email,
        phone: appointment.userId.phone,
        profileImage: appointment.userId.profileImage
      };
    }
    return {
      name: appointment?.userName || "Client",
      email: appointment?.userEmail || null,
      phone: appointment?.userPhone || null,
      profileImage: null
    };
  };

  // Get lawyer info
  const getLawyerInfo = () => {
    const lawyerId = appointment?.lawyerId?._id || appointment?.lawyerId;
    
    if (appointment?.lawyerId?.name) {
      return {
        name: appointment.lawyerId.name,
        email: appointment.lawyerId.email,
        phone: appointment.lawyerId.phone,
        profileImage: appointment.lawyerId.profileImage,
        specialization: appointment.lawyerId.specializations?.[0] || "-"
      };
    }
    
    const lawyer = lawyers.find(l => l._id === lawyerId || l.id === lawyerId);
    if (lawyer) {
      return {
        name: lawyer.name || "Unknown",
        email: lawyer.email,
        phone: lawyer.phone,
        profileImage: lawyer.profileImage?.url || lawyer.profileImage,
        specialization: lawyer.specializations?.[0] || "-"
      };
    }
    
    return {
      name: "-",
      email: null,
      phone: null,
      profileImage: null,
      specialization: "-"
    };
  };

  const clientInfo = getClientInfo();
  const lawyerInfo = getLawyerInfo();

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700";
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Rejected": return "bg-red-100 text-red-700";
      case "Completed": return "bg-blue-100 text-blue-700";
      case "Cancelled": return "bg-gray-200 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const isOnlineBooking = appointment?.appointmentMode === "Online" || appointment?.bookingType === "online";
  const isOfflineBooking = appointment?.appointmentMode === "Office" || appointment?.bookingType === "offline";
  const isCancelled = appointment?.status === "Cancelled" || appointment?.status === "Rejected";
  const isPendingOrApproved = appointment?.status === "Pending" || appointment?.status === "Approved";

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }

    setCancelling(true);
    try {
      // Use PUT updateAppointment instead
      const response = await axios.put(
        `${API_URL}/appointments/${appointment._id}`,
        { 
          status: "Rejected",
          rejectionReason: cancelReason
        },
        { timeout: 10000 }
      );

      setSuccessMessage("Appointment cancelled successfully!");
      setTimeout(() => {
        setCancelModal(false);
        setSuccessMessage("");
        onClose();
        // Optionally refresh the parent page
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {clientInfo.profileImage ? (
              <img
                src={clientInfo.profileImage}
                alt={clientInfo.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <User className="text-green-600" size={24} />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {clientInfo.name}
              </h3>
              <p className="text-sm text-gray-400">
                Appointment Details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <X className="text-gray-400 hover:text-white" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} />
                  {successMessage}
                </div>
              )}

              {/* Status & Booking Type */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(appointment?.status)}`}>
                  {appointment?.status || "Pending"}
                </span>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isOnlineBooking ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"}`}>
                    Online
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isOfflineBooking ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                    Offline
                  </span>
                </div>
              </div>

              {/* Client Details */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Client Details</h4>
                <div className="space-y-2">
                  {clientInfo.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{clientInfo.email}</span>
                    </div>
                  )}
                  {clientInfo.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{clientInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lawyer Details */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">Lawyer Details</h4>
                <div className="flex items-center gap-3 mb-3">
                  {lawyerInfo.profileImage ? (
                    <img
                      src={lawyerInfo.profileImage}
                      alt={lawyerInfo.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                      <Briefcase className="text-green-600" size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{lawyerInfo.name}</p>
                    <p className="text-xs text-green-600">{lawyerInfo.specialization}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {lawyerInfo.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{lawyerInfo.email}</span>
                    </div>
                  )}
                  {lawyerInfo.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{lawyerInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{formatDate(appointment?.date)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Time:</span> {appointment?.timeSlot || appointment?.slot || "-"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign size={14} />
                    <span>{appointment?.feeCharged || appointment?.fee ? `₹${Number(appointment?.feeCharged || appointment?.fee).toLocaleString()}` : "-"}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Payment:</span> {appointment?.paymentStatus || "Pending"}
                  </div>
                </div>
                {appointment?.caseCategory && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="text-sm font-medium text-gray-800">{appointment.caseCategory}</p>
                  </div>
                )}
                {appointment?.caseDescription && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-700">{appointment.caseDescription}</p>
                  </div>
                )}
                {appointment?.cancelReason && (
                  <div className="mt-3 pt-3 border-t border-red-200 bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-red-500 font-semibold">Cancellation Reason</p>
                    <p className="text-sm text-red-700">{appointment.cancelReason}</p>
                  </div>
                )}
              </div>

              {/* Cancel Button */}
              {appointment?.status !== "Rejected" && appointment?.status !== "Completed" && (
                <div className="mt-4">
                  <button
                    onClick={() => setCancelModal(true)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle size={18} />
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setCancelModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cancel Appointment</h3>
              <button onClick={() => setCancelModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel this appointment? This will send an email notification to the client.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation (e.g., Scheduling conflict, Client request, etc.)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
                disabled={cancelling}
              >
                Back
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling || !cancelReason.trim()}
                className={`flex-1 py-3 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  cancelling || !cancelReason.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {cancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <AlertCircle size={18} />
                    Cancel & Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
