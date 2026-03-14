import React from "react";
import { CheckCircle2, Calendar, Clock, MapPin, FileText } from "lucide-react";

export default function AppointmentDetailModal({ open, onClose, appointment }) {
  if (!open || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl flex flex-col md:flex-row gap-6">

        {/* Left Icon */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-green-100 p-5 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <span className="mt-4 text-green-700 font-semibold">Booking Confirmed!</span>
        </div>

        {/* Right Details */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={appointment.photo}
              alt="Attorney"
              className="w-16 h-16 rounded-full border-2 border-blue-500 shadow"
            />
            <div>
              <h2 className="text-xl font-semibold">{appointment.lawyer}</h2>
              <p className="text-blue-600 text-sm">{appointment.specialty}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <DetailRow icon={<Calendar size={18} />} label="Date" value={appointment.date} />
            <DetailRow icon={<Clock size={18} />} label="Time" value={appointment.time} />
            <DetailRow icon={<MapPin size={18} />} label="Location" value={appointment.location} />
            <DetailRow icon={<FileText size={18} />} label="Ref ID" value={appointment.ref} />
          </div>

          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-gray-500">{icon}</div>
      <span className="font-medium">{label}:</span>
      <span className="ml-auto font-semibold">{value}</span>
    </div>
  );
}