import { Link, useLocation } from "react-router-dom";
import {FaGavel,FaBell,FaUserCircle,FaCalendarAlt,FaVideo,FaTimes,FaCheck,FaMapMarkerAlt,} from "react-icons/fa";

const MyAppointments = () => {
  const location = useLocation();

  const appointments = [
    {
      id: 1,
      lawyer: "Harvey Specter",
      specialization: "Corporate Law",
      date: "24 Oct 2023",
      time: "10:00 AM",
      type: "Online",
      status: "Confirmed",
    },
    {
      id: 2,
      lawyer: "Jessica Pearson",
      specialization: "Family Law",
      date: "26 Oct 2023",
      time: "02:30 PM",
      type: "Offline",
      status: "Pending",
    },
    {
      id: 3,
      lawyer: "Michael Ross",
      specialization: "Criminal Law",
      date: "18 Oct 2023",
      time: "11:00 AM",
      type: "Online",
      status: "Completed",
    },
  ];

  const navClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      location.pathname === path
        ? "text-blue-600 bg-blue-50"
        : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
    }`;

  const statusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <FaGavel className="text-black text-xl" />
          <span className="font-bold text-lg">Esue</span>
        </div>

        {/* NAV */}
        <nav className="flex flex-wrap gap-2">
          <Link to="/client/client-dashboard" className={navClass("/client/dashboard")}>
            Dashboard
          </Link>
          <Link to="/client/lawyer-list" className={navClass("/client/lawyers")}>
            Search Lawyers
          </Link>
          <Link
            to="/client/appointment-scheduling"
            className={navClass("/client/appointments")}
          >
            My Appointments
          </Link>
          <Link to="/client/profile" className={navClass("/client/profile")}>
            Profile
          </Link>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-4 justify-end">
          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
            <FaBell className="text-gray-600" />
          </div>
          <FaUserCircle className="text-3xl text-gray-500" />
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="p-6">
        {/* PAGE TITLE */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <p className="text-sm text-gray-500">
            View and manage your scheduled consultations
          </p>
        </div>

        {/* APPOINTMENT CARDS */}
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* LEFT */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">
                  {appt.lawyer}
                </h3>
                <p className="text-sm text-gray-500">
                  {appt.specialization}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt />
                    {appt.date} • {appt.time}
                  </span>

                  {appt.type === "Offline" && (
                    <span className="flex items-center gap-2">
                      <FaMapMarkerAlt /> In-Person
                    </span>
                  )}
                </div>
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 text-xs rounded-full bg-gray-100">
                  {appt.type}
                </span>
                <span
                  className={`px-3 py-1 text-xs rounded-full ${statusBadge(
                    appt.status
                  )}`}
                >
                  {appt.status}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                {appt.status === "Confirmed" && (
                  <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    <FaVideo /> Join
                  </button>
                )}

                {appt.status === "Pending" && (
                  <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                    <FaTimes /> Cancel
                  </button>
                )}

                {appt.status === "Completed" && (
                  <button className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-100">
                    <FaCheck /> View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {appointments.length === 0 && (
          <p className="text-center text-gray-500 mt-12">
            You have no appointments yet.
          </p>
        )}
      </main>
    </div>
  );
};

export default MyAppointments;
