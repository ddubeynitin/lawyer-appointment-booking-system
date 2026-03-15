import React from "react";

export default function AppointmentCard({ appointment, onClick }) {
  return (
    <tr
      className="bg-white hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick(appointment)}
    >
      <td className="text-center py-4">{appointment.date}</td>
      <td className="text-center">{appointment.lawyer}</td>
      <td className="text-center">{appointment.type}</td>
      <td className="text-center">
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            appointment.status === "Completed"
              ? "bg-green-100 text-green-600"
              : appointment.status === "Cancelled"
              ? "bg-gray-100 text-gray-500"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {appointment.status}
        </span>
      </td>
      <td className="text-center text-blue-600">{appointment.action}</td>
    </tr>
  );
}