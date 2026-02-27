import {
  FaCalendarAlt,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaSearch,
  FaPlus,
  FaGavel,
  FaVideo,
} from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";

const LawyerDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* ================= HEADER ================= */}
      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <FaGavel className="text-blue-700 text-xl" />
            <span className="font-bold text-xl text-gray-800">Esue</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 font-medium text-gray-600">
            <span className="text-blue-600 font-semibold">Dashboard</span>
            <span className="hover:text-blue-600 cursor-pointer">Calendar</span>
            <span className="hover:text-blue-600 cursor-pointer">Requests</span>
            <span className="hover:text-blue-600 cursor-pointer">Clients</span>
            <span className="hover:text-blue-600 cursor-pointer">Case Files</span>
          </nav>

          {/* Notifications + Profile */}
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
                  <li>📅 Appointment booked by client</li>
                  <li>💬 New message from Sarah Jenkins</li>
                  <li>💳 Payment received</li>
                </ul>
              </div>
            )}

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <img
                src="https://i.pravatar.cc/40?img=12"
                alt="profile"
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 rounded-full ring-2 ring-blue-500 cursor-pointer"
              />

              {/* Profile Popup */}
              <div
                className={`absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 transition-all duration-300 ease-out z-50 ${
                  showProfile
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://i.pravatar.cc/80?img=12"
                    alt="lawyer"
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Harvey Specter
                    </h4>
                    <p className="text-sm text-gray-500">
                      Senior Corporate Lawyer
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3"></div>

                <div className="space-y-2 text-sm">
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                    View Profile
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition">
                    Account Settings
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

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, <span className="text-blue-600">Harvey</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Here’s what’s happening in your practice today.
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-gradient-to-b from-blue-700 to-blue-950 rounded-xl p-10 text-white shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-3">
            Search Clients or Cases
          </h2>
          <p className="text-sm text-center mb-6 opacity-90">
            Quickly find clients, cases, or documents to manage your workflow.
          </p>

          <div className="flex justify-center">
            <div className="flex bg-white rounded-full overflow-hidden max-w-xl w-full">
              <div className="flex items-center justify-center px-4 text-gray-400">
                <FaSearch />
              </div>
              <input
                type="text"
                placeholder="Client name, case ID, or document..."
                className="flex-1 px-3 py-2 outline-none text-gray-700"
              />
              <button className="bg-blue-600 hover:bg-blue-700 transition px-6 text-white font-medium">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Appointments Today" value="4" icon={<FaCalendarAlt />} />
          <StatCard title="Pending Requests" value="3" sub="+1 new" />
          <StatCard title="Active Clients" value="128" sub="+5%" />
          <StatCard title="Hours Billed" value="32.5" sub="This week" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Up Next Appointment */}
            <Card title="Up Next" badge="Starts in 15m">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/80?img=3"
                    className="w-14 h-14 rounded-lg"
                    alt="client"
                  />
                  <div>
                    <p className="font-semibold">Sarah Jenkins</p>
                    <p className="text-sm text-gray-500">
                      Estate Planning Consultation • Case #23901
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="border border-gray-200 px-4 py-2 rounded-lg text-sm">
                    Details
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                    <FaVideo /> Join Meeting
                  </button>
                </div>
              </div>
            </Card>

            {/* Today’s Schedule */}
            <Card title="Today’s Schedule" right="Oct 24, 2023">
              <ScheduleItem time="09:00 AM" title="Team Standup" done />
              <ScheduleItem
                time="10:00 AM"
                title="Sarah Jenkins - Consultation"
                sub="Zoom Meeting • ID: 492-392"
                active
              />
              <ScheduleItem
                time="01:00 PM"
                title="Lunch with Partner"
                sub="Downtown Bistro"
                purple
              />
              <ScheduleItem
                time="02:30 PM"
                title="Michael Ross - Case Review"
                sub="Office 4B"
              />
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-7">
            {/* New Requests */}
            <Card title="New Requests" action="View All">
              <RequestItem name="Louis M." type="Corporate Law" />
              <RequestItem name="Donna P." type="Contract Review" />
            </Card>

            {/* Quick Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Quick Notes</h4>
              <textarea
                placeholder="Type a note..."
                className="w-full bg-transparent outline-none text-sm h-24"
              />
              <button className="text-sm text-blue-600 mt-2">Save</button>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-b from-blue-700 to-blue-900 text-white rounded-3xl p-6 text-center shadow-xl">
              <h4 className="font-semibold mb-2 flex justify-center">
                Need urgent assistance?
              </h4>
              <p className="text-sm mb-4 flex justify-center">
                Match with a client or urgent case immediately.
              </p>
              <div className="flex justify-center">
                <button className="w-40 bg-white text-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-200">
                  Quick Match
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

const StatCard = ({ title, value, sub, icon }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm text-gray-600">{title}</p>
      {icon && <span className="text-blue-600">{icon}</span>}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-green-600">{sub}</p>}
  </div>
);

const Card = ({ title, badge, action, right, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold">{title}</h3>
      {badge && (
        <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      {action && <span className="text-sm text-blue-600">{action}</span>}
      {right && <span className="text-sm text-gray-500">{right}</span>}
    </div>
    {children}
  </div>
);

const ScheduleItem = ({ time, title, sub, active, purple, done }) => (
  <div
    className={`flex gap-4 py-3 pl-4 border-l-4 ${
      active
        ? "border-blue-600 bg-blue-50"
        : purple
        ? "border-purple-500 bg-purple-50"
        : done
        ? "border-green-500"
        : "border-gray-200"
    }`}
  >
    <span className="text-sm text-gray-500 w-20">{time}</span>
    <div>
      <p className="font-medium">{title}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  </div>
);

const RequestItem = ({ name, type }) => (
  <div className="flex justify-between items-center mb-4">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-xs text-gray-500">{type}</p>
    </div>
    <div className="flex gap-2">
      <button className="border px-3 py-1 rounded-lg text-xs">Decline</button>
      <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">
        Accept
      </button>
    </div>
  </div>
);

export default LawyerDashboard;