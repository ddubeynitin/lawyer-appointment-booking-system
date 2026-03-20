import {
  FaGavel,
  FaSearch,
  FaVideo,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import userImg from "../../assets/gifs/icons8-user.gif";
import axios from "axios";
import { API_URL } from "../../utils/api";
import ClientAppointments from "../../components/ClientAppointments";
import BookingNotifications from "../../components/BookingNotifications";

const ClientDashboard = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const profileRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUserId(user.id || user._id);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const fetchAppointmentHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/appointments/user/${user.id}`);
      console.log("API Response:", response.data);
      setAppointmentHistory(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      setAppointmentHistory([]);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchAppointmentHistory();
    }
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <header className="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaGavel className="text-blue-700 text-xl" />
            <span className="font-bold text-xl text-gray-800">Justif<span className="text-blue-500">Ai</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-gray-600">
            <Link className="text-blue-600 font-semibold">Dashboard</Link>
            <Link to="/client/lawyer-list" className="hover:text-blue-600">Search Lawyers</Link>
            <Link to="/client/appointment-scheduling" className="hover:text-blue-600">Appointments</Link>
            <Link className="hover:text-blue-600">Profile</Link>
          </nav>
          <div className="flex items-center gap-6 relative">
            <BookingNotifications 
              userId={userId}
              onNotificationCount={setNotificationCount}
            />
            <div className="relative" ref={profileRef}>
              <img src={user?.profilePicture || userImg} alt="profile" className="w-9 h-9 rounded-full ring-2 ring-blue-500 cursor-pointer" onClick={() => setShowProfileDropdown(!showProfileDropdown)} />
              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={user?.profilePicture || userImg} alt="user" className="w-14 h-14 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-gray-800">{user?.name}</h4>
                      <p className="text-sm text-gray-500">{user?.role === "user" ? "Client" : user?.role}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 my-3"></div>
                  <div className="space-y-2 text-sm">
                    <button onClick={() => { setShowProfileDropdown(false); setShowProfileModal(true); }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">View Profile</button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">Settings</button>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600">Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={() => setShowProfileModal(false)}><FaTimes /></button>
            <div className="flex flex-col items-center text-center mt-4">
              <img src={user?.profilePicture || userImg} className="w-20 h-20 rounded-full mb-4" alt="user" />
              <h3 className="font-semibold text-xl uppercase">{user?.name}</h3>
              <p className="text-sm text-gray-500">{user?.role === "user" ? "Client" : user?.role}</p>
              <div className="mt-4 text-left w-full space-y-1">
                <p><span className="font-medium">Email:</span> {user?.email}</p>
                <p><span className="font-medium">Phone:</span> {user?.phone}</p>
              </div>
              <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium">Edit Profile</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{greeting}, <span className="text-blue-600 uppercase">{user?.name}</span></h1>
          <p className="text-gray-500 mt-1">Manage your appointments and find the legal help you need.</p>
        </div>

        <div className="bg-linear-to-b from-blue-700 to-blue-950 rounded-xl p-10 text-white shadow-xl">
          <h2 className="text-2xl font-semibold text-center mb-3">Find the right legal help today</h2>
          <p className="text-sm text-center mb-6 opacity-90">Search by specialty, location, or name to book your next consultation.</p>
          <div className="flex justify-center">
            <div className="flex bg-white rounded-full overflow-hidden max-w-xl w-full">
              <div className="flex items-center justify-center px-4 text-gray-400"><FaSearch /></div>
              <input type="text" placeholder="Family Law, Corporate, Real Estate..." className="flex-1 px-3 py-2 outline-none text-gray-700" />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 text-white font-medium">Search</button>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg">Upcoming Appointment</h3>
            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">CONFIRMED</span>
          </div>
          <h4 className="font-semibold flex justify-center">Consultation with Sarah Jenkins</h4>
          <p className="text-sm flex justify-center text-blue-600 mb-3">Family Law Specialist</p>
          <div className="text-sm text-gray-600 text-center space-y-1 mb-4">
            <p>📅 Tomorrow, Oct 24, 2023</p>
            <p>⏰ 10:00 AM – 11:00 AM (1 hr)</p>
            <p>🎥 Video Call via Zoom</p>
          </div>
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"><FaVideo /> Join Video Call</button>
            <button className="border px-4 py-2 rounded-lg text-sm">Reschedule</button>
          </div>
        </section>

        {/* Client Appointments Component */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h3 className="font-semibold text-lg mb-4">My Appointments</h3>
          <ClientAppointments userId={userId} userRole="client" />
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
