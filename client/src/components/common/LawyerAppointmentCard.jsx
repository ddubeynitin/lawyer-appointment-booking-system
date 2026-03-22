import React from "react";
import { FaCalendarCheck, FaUserTie } from "react-icons/fa";

function LawyerAppointmentCard({ lawyer, appointmentCount, onClick }) {
  const specializations = lawyer.specializations || [];
  const displaySpecialization = specializations.length > 0 
    ? specializations.slice(0, 2).join(", ") 
    : lawyer.lawyerSpecialization || "General";

  return (
    <div 
      onClick={onClick}
      className="bg-gray-900 rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 border border-gray-700 overflow-hidden group w-full max-w-[180px] cursor-pointer"
    >
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <img
          src={
            lawyer.profileImage?.url ||
            lawyer.profileImage ||
            "https://randomuser.me/api/portraits/lego/1.jpg"
          }
          alt={lawyer.name || lawyer.lawyerName || "Lawyer"}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-500"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {lawyer.name || lawyer.lawyerName || "Unknown"}
          </h3>
          <p className="text-[10px] text-gray-400">
            {lawyer.experience ? `${lawyer.experience} Yrs exp` : "Fresher"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Specialization */}
        <div className="flex items-center gap-2 text-xs">
          <FaUserTie className="text-green-400 text-xs" />
          <span className="text-gray-300 truncate flex-1">
            {displaySpecialization}
          </span>
        </div>

        {/* Appointment Count */}
        <div className="bg-gray-800 rounded-md p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCalendarCheck className="text-green-400 text-sm" />
            <span className="text-xs text-gray-400">Appts</span>
          </div>
          <span className="text-lg font-bold text-white">{appointmentCount}</span>
        </div>

        {/* Status Badge */}
        <div className={`text-center text-[10px] font-medium px-2 py-1 rounded-full ${
          appointmentCount > 10 
            ? "bg-green-500 text-white" 
            : appointmentCount > 5
              ? "bg-emerald-500 text-white"
            : appointmentCount > 0 
              ? "bg-gray-600 text-white" 
              : "bg-gray-700 text-gray-400"
        }`}>
          {appointmentCount > 10 ? "High Demand" : appointmentCount > 5 ? "Popular" : appointmentCount > 0 ? "Active" : "No Bookings"}
        </div>
      </div>
    </div>
  );
}

export default LawyerAppointmentCard;
