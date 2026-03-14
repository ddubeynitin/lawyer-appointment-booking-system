import React from "react";
import { CalendarDays } from "lucide-react";

export default function Appointments() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><CalendarDays /></div>
        <h2 className="text-xl font-semibold text-gray-800">Appointments Schedule</h2>
      </div>
      <div className="text-center py-10">
        <p className="text-gray-400 italic">No upcoming appointments found for today.</p>
      </div>
    </div>
  );
}