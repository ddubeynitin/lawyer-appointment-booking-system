import React from "react";
import { History, CheckCircle, Clock, XCircle } from "lucide-react";

export default function AppointmentHistory({
  totalAppointments = 0,
  completedCount = 0,
  pendingCount = 0,
  cancelledCount = 0,
}) {
  const completedPercentage = totalAppointments > 0 
    ? Math.round((completedCount / totalAppointments) * 100) 
    : 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-100 rounded-lg">
          <History className="w-5 h-5 text-slate-700" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Appointment History</h3>
          <p className="text-xs text-gray-400">Track all appointments</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-600">Completed</span>
          </div>
          <span className="text-sm font-bold text-emerald-700">{completedCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <span className="text-sm font-bold text-amber-700">{pendingCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-rose-50 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span className="text-sm text-gray-600">Cancelled</span>
          </div>
          <span className="text-sm font-bold text-rose-700">{cancelledCount}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Total: {totalAppointments}</span>
          <span className="text-xs font-bold text-slate-700">{completedPercentage}% Success</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            style={{ width: `${completedPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
