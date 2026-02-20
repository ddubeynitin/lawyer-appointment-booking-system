import {
  FaGavel,
  FaSearch,
  FaVideo,
  FaCalendarAlt,
  FaHistory,
} from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useState } from "react";

const ClientDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">

      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <FaGavel className="text-blue-700 text-xl" />
            <span className="font-bold text-xl text-gray-800">Esue</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <Link className="text-blue-600 font-semibold">Dashboard</Link>
            <Link to="/client/lawyer-list" className="hover:text-blue-600">Search Lawyers</Link>
            <Link to="/client/appointment-scheduling" className="hover:text-blue-600">Appointments</Link>
            <Link className="hover:text-blue-600">Profile</Link>
          </nav>

          <div className="flex items-center gap-6 relative">
            <div
              className="relative cursor-pointer"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <LuBellRing className="text-gray-700 text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
            </div>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-white shadow-xl rounded-xl p-4 z-50">
                <h4 className="font-semibold mb-3">Notifications</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📅 Appointment confirmed</li>
                  <li>💬 Lawyer sent you a message</li>
                  <li>💳 Payment successful</li>
                </ul>
              </div>
            )}

            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-9 h-9 rounded-full ring-2 ring-blue-500"
            />
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, <span className="text-blue-600">Alex</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your appointments and find the legal help you need.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gradient-to-b from-blue-700 to-blue-950 rounded-xl p-10 text-white shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-3">
            Find the right legal help today
          </h2>
          <p className="text-sm text-center mb-6 opacity-90">
            Search by specialty, location, or name to book your next consultation.
          </p>

          <div className="flex justify-center">
            <div className="flex bg-white rounded-full overflow-hidden max-w-xl w-full">
              <div className="flex items-center justify-center px-4 text-gray-400">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Family Law, Corporate, Real Estate..."
                className="flex-1 px-3 py-2 outline-none text-gray-700"
              />
              <button className="bg-blue-600 hover:bg-blue-700 transition px-6 text-white font-medium">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointment */}
        <section className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg">Upcoming Appointment</h3>
            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
              CONFIRMED
            </span>
          </div>
          <h4 className="font-semibold flex justify-center">
            Consultation with Sarah Jenkins
          </h4>
          <p className="text-sm flex justify-center text-blue-600 mb-3">
            Family Law Specialist
          </p>
          <div className="text-sm text-gray-600 text-center space-y-1 mb-4">
            <p>📅 Tomorrow, Oct 24, 2023</p>
            <p>⏰ 10:00 AM – 11:00 AM (1 hr)</p>
            <p>🎥 Video Call via Zoom</p>
          </div>
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              <FaVideo /> Join Video Call
            </button>
            <button className="border px-4 py-2 rounded-lg text-sm">Reschedule</button>
          </div>
        </section>

        {/* Appointment History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-lg">Appointment History</h3>
              <Link className="text-blue-600 text-sm">View All</Link>
            </div>

            <section className="bg-white rounded-3xl shadow-lg p-6 overflow-x-auto">
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
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="text-center py-4">Oct 12, 2023</td>
                    <td className="text-center">Michael Ross</td>
                    <td className="text-center">Estate Planning</td>
                    <td className="text-center">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                    <td className="text-center text-blue-600 cursor-pointer">View Notes</td>
                  </tr>
                  <tr className="bg-gray-50 hover:bg-gray-100">
                    <td className="text-center py-4">Sept 05, 2023</td>
                    <td className="text-center">Jessica Pearson</td>
                    <td className="text-center">Contract Review</td>
                    <td className="text-center">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        Completed
                      </span>
                    </td>
                    <td className="text-center text-blue-600 cursor-pointer">Book Again</td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50">
                    <td className="text-center py-4">Aug 18, 2023</td>
                    <td className="text-center">Louis Litt</td>
                    <td className="text-center">Real Estate</td>
                    <td className="text-center">
                      <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">
                        Cancelled
                      </span>
                    </td>
                    <td className="text-center text-gray-400 cursor-not-allowed">No Action</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          {/* Recommended */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="font-semibold text-lg mb-2">Recommended</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 3}`}
                    className="w-16 h-16 rounded-full mb-4"
                    alt=""
                  />
                  <p className="font-medium text-gray-800">
                    {i === 0 ? "Robert Zane" : "Rachel Zane"}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {i === 0 ? "Corporate Law • 15 yrs" : "Intellectual Property"}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 px-2">
                    {i === 0
                      ? "Expert in corporate mergers and acquisitions advising multinational clients."
                      : "Specializes in intellectual property rights, trademarks, and patents."}
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
                    View Profile
                  </button>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-3xl p-6 text-center shadow-xl">
              <h4 className="font-semibold mb-2 flex justify-center">Need urgent help?</h4>
              <p className="text-sm mb-4 flex justify-center">
                Get matched with a lawyer in under 30 minutes.
              </p>
              <div className="flex justify-center">
                <button className="w-40 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                  Try Fast Match
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
