import React, { useRef, useState } from 'react'
import { FaGavel, FaSearch, FaVideo, FaTimes } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TfiMenuAlt } from "react-icons/tfi";
import { Link, useNavigate } from 'react-router-dom';

const ClientHeader = () => {
    // const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const profileRef = useRef(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
    logout();
    navigate("/");
  };

    const showMenu = () => {
    setIsMenuVisible((current) => !current);
  };
  return (
    <>
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={showMenu} className="sm:hidden">
            <TfiMenuAlt />
            {isMenuVisible && (
              <div className="absolute top-19 left-0 w-50 rounded-br-2xl rounded-tr-2xl border border-dashed border-gray-300 bg-white pt-5 pb-5">
                <nav className="flex flex-col items-center gap-8 text-sm font-medium text-slate-600 md:hidden">
                  <Link
                    to="/client/lawyer-list"
                    className="flex items-center gap-2 transition hover:text-blue-600"
                  >
                    <FaSearch /> Find Lawyer
                  </Link>
                  {user ? (
                    <Link
                      to={
                        user.role === "lawyer"
                          ? "/lawyer/lawyer-dashboard"
                          : "/client/client-dashboard"
                      }
                      className="transition hover:text-blue-600"
                    >
                      Your Dashboard
                    </Link>
                  ) : null}
                  <Link className="font-semibold text-blue-600">Dashboard</Link>
                  <Link
                    to="/client/appointment-history"
                    className="hover:text-blue-600"
                  >
                    Appointments
                  </Link>
                </nav>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FaGavel className="text-xl text-blue-700" />
            <Link to="/">
              <span className="text-xl font-bold text-gray-800">
                Justif<span className="text-blue-500">Ai</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 font-medium text-gray-600 md:flex">
            <Link to="/client/client-dashboard" className="font-semibold text-blue-600">Dashboard</Link>
            <Link to="/client/lawyer-list" className="hover:text-blue-600">
              Search Lawyers
            </Link>
            <Link
              to="/client/appointment-history"
              className="hover:text-blue-600"
            >
              Appointments
            </Link>
          </nav>

          <div className="relative flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/messages")}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
              aria-label="Open messages"
            >
              <MessageCircle size={18} />
            </button>

            {/* <div
              className="relative cursor-pointer"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <LuBellRing className="text-xl text-gray-700" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </div>

            {showNotifications && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl bg-white p-4 shadow-xl">
                <h4 className="mb-3 font-semibold">Notifications</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Appointment confirmed</li>
                  <li>Lawyer sent you a message</li>
                  <li>Payment successful</li>
                </ul>
              </div>
            )} */}

            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold uppercase text-blue-600 ring-2 ring-blue-500"
              >
                {user.name?.charAt(0) || "U"}
              </div>

              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl transition-all duration-300 ease-out z-50 ${
                  showProfileDropdown
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2 scale-95 opacity-0 pointer-events-none"
                }`}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold uppercase text-blue-600 ring-2 ring-blue-500">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{user.name}</h4>
                    <p className="text-sm text-gray-500">
                      {user.role === "user" ? "Client" : user.role}
                    </p>
                  </div>
                </div>

                <div className="my-3 border-t border-gray-100"></div>

                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100">
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="relative w-80 rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowProfileModal(false)}
            >
              <FaTimes />
            </button>

            <div className="mt-4 flex flex-col items-center text-center">
              <img
                src={user.profilePicture || "/assets/images/user.png"}
                className="mb-4 h-20 w-20 rounded-full"
                alt="user"
              />
              <h3 className="text-xl font-semibold uppercase">{user.name}</h3>
              <p className="text-sm text-gray-500">
                {user.role === "user" ? "Client" : user.role}
              </p>
              <div className="mt-4 w-full space-y-1 text-left">
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {user.phone}
                </p>
              </div>
              <button className="mt-6 w-full rounded-xl bg-blue-600 py-2 font-medium text-white hover:bg-blue-700">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ClientHeader
