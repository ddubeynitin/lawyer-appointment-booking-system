import React, { useState, useEffect } from "react";
import { X, Calendar, User, Mail, Phone } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function LawyerClientsModal({ lawyer, appointments, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/users`, { timeout: 5000 });
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (!lawyer) return null;

  // Filter appointments for this lawyer
  const lawyerAppointments = appointments.filter(
    (apt) => apt?.lawyerId?._id === lawyer._id || apt?.lawyerId === lawyer._id
  );

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
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get client info - check multiple possible sources
  const getClientInfo = (appointment) => {
    const userId = appointment?.userId?._id || appointment?.userId;
    
    // Check if userId is already populated with name
    if (appointment?.userId?.name) {
      return {
        name: appointment.userId.name,
        email: appointment.userId.email,
        phone: appointment.userId.phone,
        profileImage: appointment.userId.profileImage
      };
    }
    
    // Check direct fields on appointment
    if (appointment?.userName) {
      return {
        name: appointment.userName,
        email: appointment.userEmail,
        phone: appointment.userPhone,
        profileImage: null
      };
    }
    
    // Find user from users list
    const user = users.find(u => u._id === userId || u.id === userId);
    if (user) {
      return {
        name: user.name || "Unknown User",
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage
      };
    }
    
    return {
      name: userId ? `User ${userId.slice(-4)}` : "Client",
      email: null,
      phone: null,
      profileImage: null
    };
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
            <img
              src={
                lawyer.profileImage?.url ||
                lawyer.profileImage ||
                "https://randomuser.me/api/portraits/lego/1.jpg"
              }
              alt={lawyer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">
                {lawyer.name || "Unknown"}
              </h3>
              <p className="text-sm text-gray-400">
                {lawyerAppointments.length} Appointments
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
          ) : lawyerAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No appointments found for this lawyer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lawyerAppointments.map((appointment, index) => {
                const clientInfo = getClientInfo(appointment);
                return (
                  <div
                    key={appointment._id || index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {clientInfo.profileImage ? (
                          <img 
                            src={clientInfo.profileImage} 
                            alt={clientInfo.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="text-green-600" size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-800 text-lg">
                            {clientInfo.name}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            {clientInfo.email && (
                              <span className="flex items-center gap-1">
                                <Mail size={10} /> {clientInfo.email}
                              </span>
                            )}
                            {clientInfo.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={10} /> {clientInfo.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment?.status
                        )}`}
                      >
                        {appointment?.status || "Pending"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>{formatDate(appointment?.date)}</span>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium">Time:</span>{" "}
                        {appointment?.timeSlot || "-"}
                      </div>
                      <div className="text-gray-600 col-span-2">
                        <span className="font-medium">Category:</span>{" "}
                        {appointment?.caseCategory || "-"}
                      </div>
                      {appointment?.caseDescription && (
                        <div className="text-gray-500 text-xs col-span-2">
                          {appointment.caseDescription}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LawyerClientsModal;
