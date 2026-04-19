import React, {useState, useEffect, useRef} from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { TfiMenuAlt } from "react-icons/tfi";
import { FaGavel } from "react-icons/fa";
import {
  Banknote,
  CalendarDays,
  CalendarCog,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PencilLine,
  UserRound,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BookingNotifications from "../BookingNotifications";

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 transition ${
    isActive
      ? "font-semibold text-blue-600"
      : "text-gray-600 hover:text-blue-600"
  }`;

const LawyerHeader = () => {
  // const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showMenu = () => {
    setIsMenuVisible((current) => !current);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-lg font-barlow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={showMenu} className="sm:hidden">
            <TfiMenuAlt />
            {isMenuVisible && (
              <div className="absolute top-17 left-0 w-50 rounded-br-2xl rounded-tr-2xl bg-white pt-5 pb-5">
                <nav className="flex flex-col items-center gap-6 font-medium text-gray-600">
                  <NavLink to="/lawyer/lawyer-dashboard">
                    {({ isActive }) => (
                      <span className={navLinkClass({ isActive })}>
                        <LayoutDashboard size={16} />
                        <span>Dashboard</span>
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/calendar">
                    {({ isActive }) => (
                      <span className={navLinkClass({ isActive })}>
                        <CalendarDays size={16} />
                        <span>Calendar</span>
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/manage-availability">
                    {({ isActive }) => (
                      <span className={navLinkClass({ isActive })}>
                        <CalendarCog size={16} />
                        <span>Management</span>
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/earnings">
                    {({ isActive }) => (
                      <span className={navLinkClass({ isActive })}>
                        <Banknote size={16} />
                        <span>Earnings</span>
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/appointment-requests">
                    {({ isActive }) => (
                      <span className={navLinkClass({ isActive })}>
                        <ClipboardList size={16} />
                        <span>Requests</span>
                      </span>
                    )}
                  </NavLink>
                  {/* <Link>
                    <span className="cursor-pointer hover:text-blue-600">
                      Clients
                    </span>
                  </Link>
                  <Link>
                    <span className="cursor-pointer hover:text-blue-600">
                      Case Files
                    </span>
                  </Link> */}
                </nav>
              </div>
            )}
          </div>

          <Link to="/">
            <div className="w-23 h-15 flex items-center gap-2 hover:scale-105 transition-transform duration-300">
              <img src="/assets/images/justifai_logo_blue_1.png" alt="logo" className="w-full h-full" />
            </div>
          </Link>

          <nav className="hidden items-center gap-6 font-medium text-gray-600 md:flex">
            <NavLink to="/lawyer/lawyer-dashboard">
              {({ isActive }) => (
                <span className={navLinkClass({ isActive })}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/calendar">
              {({ isActive }) => (
                <span className={navLinkClass({ isActive })}>
                  <CalendarDays size={16} />
                  <span>Calendar</span>
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/manage-availability">
              {({ isActive }) => (
                <span className={navLinkClass({ isActive })}>
                  <CalendarCog size={16} />
                  <span>Management</span>
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/earnings">
              {({ isActive }) => (
                <span className={navLinkClass({ isActive })}>
                  <Banknote size={16} />
                  <span>Earnings</span>
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/appointment-requests">
              {({ isActive }) => (
                <span className={navLinkClass({ isActive })}>
                  <ClipboardList size={16} />
                  <span>Requests</span>
                </span>
              )}
            </NavLink>
            {/* <span className="cursor-pointer hover:text-blue-600">Clients</span>
            <span className="cursor-pointer hover:text-blue-600">
              Case Files
            </span> */}
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

            {user?.id && (
              <BookingNotifications
                userId={user.id}
                recipientType="lawyer"
              />
            )}

            <div className="relative" ref={profileRef}>
              <img
                src={user?.profileImage?.url || "/assets/images/profile.png"}
                alt="profile"
                onClick={() => setShowProfile(!showProfile)}
                className="h-9 w-9 object-cover cursor-pointer rounded-full hover:ring-2 hover:ring-blue-500 hover:scale-110 transition"
              />

              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl transition-all duration-300 ease-out z-50 ${
                  showProfile
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2 scale-95 opacity-0 pointer-events-none"
                }`}
              >
                <div className="mb-4 flex items-center gap-4 overflow-hidden">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                  <img
                    src={user?.profileImage?.url || "/assets/images/profile.png"}
                    alt="lawyer"
                    className="w-full h-full object-cover"
                    />
                    </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>

                <div className="my-3 border-t border-gray-100"></div>

                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate(`/lawyer/lawyer-profile/${user.id}`);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    <UserRound size={16} className="text-slate-600" />
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate("/lawyer/edit-profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    <PencilLine size={16} className="text-slate-600" />
                    Edit Profile
                  </button>
                  {/* <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate("/lawyer/account-settings");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    <Settings size={16} className="text-slate-600" />
                    Settings
                  </button> */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default LawyerHeader;
