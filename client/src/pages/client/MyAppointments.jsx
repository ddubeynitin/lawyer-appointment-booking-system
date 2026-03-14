import React, { useState } from "react";
import AppointmentCard from "../../components/common/AppointmentCard";
import AppointmentDetailModal from "../../components/common/AppointmentDetailModal";

export default function MyAppointment() {
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const appointments = [
    {
      date: "Oct 12, 2023",
      lawyer: "Michael Ross",
      type: "Estate Planning",
      status: "Completed",
      action: "View Notes",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
      specialty: "Estate Planning Specialist",
      time: "10:00 AM – 11:00 AM",
      location: "123 Legal Ave, NY",
      ref: "#APT-8829-XJ",
    },
    {
      date: "Sept 05, 2023",
      lawyer: "Jessica Pearson",
      type: "Contract Review",
      status: "Completed",
      action: "Book Again",
      photo: "https://randomuser.me/api/portraits/women/65.jpg",
      specialty: "Corporate Law Specialist",
      time: "02:00 PM – 03:00 PM",
      location: "456 Legal St, NY",
      ref: "#APT-2234-AB",
    },
    {
      date: "Aug 18, 2023",
      lawyer: "Louis Litt",
      type: "Real Estate",
      status: "Cancelled",
      action: "No Action",
      photo: "https://randomuser.me/api/portraits/men/45.jpg",
      specialty: "Real Estate Specialist",
      time: "11:00 AM – 12:00 PM",
      location: "789 Court Rd, NY",
      ref: "#APT-8877-LM",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-2">
          View your current and past appointments.
        </p>

        <section className="bg-white rounded-3xl shadow-lg p-6 mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-center py-3 px-2 text-gray-600">DATE</th>
                <th className="text-center py-3 px-2 text-gray-600">LAWYER</th>
                <th className="text-center py-3 px-2 text-gray-600">TYPE</th>
                <th className="text-center py-3 px-2 text-gray-600">STATUS</th>
                <th className="text-center py-3 px-2 text-gray-600">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, idx) => (
                <AppointmentCard
                  key={idx}
                  appointment={apt}
                  onClick={setSelectedAppointment}
                />
              ))}
            </tbody>
          </table>
        </section>

        {/* Modal */}
        <AppointmentDetailModal
          open={!!selectedAppointment}
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      </div>
    </div>
  );
}