import React, { useState, useEffect } from "react";
import ClientAppointments from "../../components/ClientAppointments";
import { useAuth } from "../../context/AuthContext";

export default function MyAppointment() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState("user");

  useEffect(() => {
    if (user) {
      setUserId(user.id || user._id);
      setUserRole(user.role || "user");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-2">
          View your current and past appointments.
        </p>

        <div className="mt-6">
          <ClientAppointments userId={userId} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}
