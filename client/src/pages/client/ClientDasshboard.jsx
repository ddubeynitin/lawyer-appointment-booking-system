import {
  FaGavel,
  FaSearch,
  FaVideo,
} from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ClientDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // ✅ NEW STATE (Added)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+91 9876543210",
    role: "Client",
    city: "New Delhi",
  };

  // ✅ Click Outside Close (Added)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            {/* Notifications */}
            <div
              className="relative cursor-pointer"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <LuBellRing className="text-gray-700 text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
            </div>

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

            {/* ✅ Profile with Dropdown (Added Feature) */}
            <div className="relative" ref={profileRef}>
              <img
                src="https://i.pravatar.cc/40"
                alt="profile"
                className="w-9 h-9 rounded-full ring-2 ring-blue-500 cursor-pointer"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              />

              {/* Dropdown Popup */}
              <div
                className={`absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 transition-all duration-300 ease-out z-50 ${
                  showProfileDropdown
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://i.pravatar.cc/80"
                    alt="user"
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {user.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3"></div>

                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    View Profile
                  </button>

                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                    Settings
                  </button>

                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* EXISTING PROFILE MODAL (UNCHANGED) */}
      {showProfileModal && (
        <div
          className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-80 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowProfileModal(false)}
            >
              <FaTimes />
            </button>

            <div className="flex flex-col items-center text-center mt-4">
              <img
                src="https://i.pravatar.cc/100"
                className="w-20 h-20 rounded-full mb-4"
                alt="user"
              />
              <h3 className="font-semibold text-xl">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.role}</p>
              <div className="mt-4 text-left w-full space-y-1">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Phone:</span> {user.phone}</p>
                <p><span className="font-medium">City:</span> {user.city}</p>
              </div>
              <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN — 100% UNTOUCHED BELOW THIS */}

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, <span className="text-blue-600">{user.name}</span>
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
