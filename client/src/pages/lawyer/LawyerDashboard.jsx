import {
  FaCalendarAlt,
  FaSearch,
  FaGavel,
} from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import ClientAppointments from "../../components/ClientAppointments";
import { useAuth } from "../../context/AuthContext";

const LawyerDashboard = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userId, setUserId] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      setUserId(user.id || user._id);
    }
  }, [user]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const lawyerName = user?.name || "Lawyer";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaGavel className="text-blue-700 text-xl" />
            <span className="font-bold text-xl text-gray-800">EsueBook</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 font-medium text-gray-600">
            <span className="text-blue-600 font-semibold">Dashboard</span>
            <span className="hover:text-blue-600 cursor-pointer">Calendar</span>
            <span className="hover:text-blue-600 cursor-pointer">Requests</span>
            <span className="hover:text-blue-600 cursor-pointer">Clients</span>
          </nav>
          <div className="flex items-center gap-6 relative">
            <div className="relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
              <LuBellRing className="text-gray-700 text-xl" />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full"></span>
            </div>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-white shadow-xl rounded-xl p-4 z-50">
                <h4 className="font-semibold mb-3">Notifications</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>📅 New appointment booked by client</li>
                  <li>💬 New message from client</li>
                  <li>💳 Payment received</li>
                </ul>
              </div>
            )}
            <div className="relative" ref={profileRef}>
              <img src={user?.profileImage?.url || "https://i.pravatar.cc/40?img=12"} alt="profile" onClick={() => setShowProfile(!showProfile)} className="w-9 h-9 rounded-full ring-2 ring-blue-500 cursor-pointer" />
              {showProfile && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={user?.profileImage?.url || "https://i.pravatar.cc/80?img=12"} alt="lawyer" className="w-14 h-14 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{lawyerName}</h4>
                      <p className="text-sm text-gray-500">{user?.role === "lawyer" ? "Lawyer" : "User"}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 my-3"></div>
                  <div className="space-y-2 text-sm">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">View Profile</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">Account Settings</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{greeting}, <span className="text-blue-600">{lawyerName}</span></h1>
          <p className="text-gray-500 mt-1">Here's what's happening in your practice today.</p>
        </div>

        <div className="bg-linear-to-b from-blue-700 to-blue-950 rounded-xl p-10 text-white shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-3">Search Clients or Cases</h2>
          <div className="flex justify-center">
            <div className="flex bg-white rounded-full overflow-hidden max-w-xl w-full">
              <div className="flex items-center justify-center px-4 text-gray-400"><FaSearch /></div>
              <input type="text" placeholder="Client name, case ID..." className="flex-1 px-3 py-2 outline-none text-gray-700" />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 text-white font-medium">Search</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Appointments Today" value="4" icon={<FaCalendarAlt />} />
          <StatCard title="Pending Requests" value="3" sub="+1 new" />
          <StatCard title="Active Clients" value="128" sub="+5%" />
          <StatCard title="Hours Billed" value="32.5" sub="This week" />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">My Appointments</h3>
          <ClientAppointments userId={userId} userRole="lawyer" />
        </div>
      </main>
    </div>
  );
};

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

export default LawyerDashboard;
