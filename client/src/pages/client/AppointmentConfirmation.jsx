import React from "react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Download,
} from "lucide-react";

export default function AppointmentConfirmation() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-3xl flex flex-col md:flex-row gap-6 transition-all">

        {/* Left: Confirmation Icon */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-green-100 p-5 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <span className="mt-4 text-green-700 font-semibold">Booking Confirmed!</span>
        </div>

        {/* Right: Details */}
        <div className="flex-1 flex flex-col justify-between">

          {/* Attorney Info */}
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Attorney"
              className="w-16 h-16 rounded-full border-2 border-blue-500 shadow"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Sarah Jenkins, Esq.</h2>
              <p className="text-blue-600 text-sm font-medium">Family Law Specialist</p>
              <span className="text-green-600 text-xs mt-1 block">✔ Verified Attorney</span>
            </div>
          </div>

          {/* Appointment Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
            <DetailRow icon={<Calendar size={18} />} label="Date" value="Oct 24, 2023" />
            <DetailRow icon={<Clock size={18} />} label="Time" value="10:00 AM - 11:00 AM" />
            <DetailRow
              icon={<MapPin size={18} />}
              label="Location"
              value="123 Legal Ave, NY"
            />
            <DetailRow icon={<FileText size={18} />} label="Ref ID" value="#APT-8829-XJ" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90 text-white py-2 rounded-xl font-semibold shadow transition">
              Add to Calendar
            </button>
            <button className="flex-1 border border-gray-300 hover:bg-gray-100 py-2 rounded-xl font-semibold transition">
              View Appointments
            </button>
          </div>

          {/* Download */}
          <div className="text-center mt-3">
            <button className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-xs transition">
              <Download size={14} /> Download Receipt
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-gray-500">{icon}</div>
      <span className="font-medium">{label}:</span>
      <span className="ml-auto text-gray-900 font-semibold">{value}</span>
    </div>
  );
}
