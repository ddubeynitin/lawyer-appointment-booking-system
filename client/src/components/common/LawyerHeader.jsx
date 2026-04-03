import React, {useState, useEffect, useRef} from "react";
import { LuBellRing } from "react-icons/lu";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { TfiMenuAlt } from "react-icons/tfi";
import { FaGavel } from "react-icons/fa";
import { MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
                      <span
                        className={
                          isActive
                            ? "font-semibold text-blue-600"
                            : "cursor-pointer hover:text-blue-600"
                        }
                      >
                        Dashboard
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/calendar">
                    {({ isActive }) => (
                      <span
                        className={
                          isActive
                            ? "font-semibold text-blue-600"
                            : "cursor-pointer hover:text-blue-600"
                        }
                      >
                        Calendar
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/manage-availability">
                    {({ isActive }) => (
                      <span
                        className={
                          isActive
                            ? "font-semibold text-blue-600"
                            : "cursor-pointer hover:text-blue-600"
                        }
                      >
                        Manage Availability
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/earnings">
                    {({ isActive }) => (
                      <span
                        className={
                          isActive
                            ? "font-semibold text-blue-600"
                            : "cursor-pointer hover:text-blue-600"
                        }
                      >
                        Earnings
                      </span>
                    )}
                  </NavLink>
                  <NavLink to="/lawyer/appointment-requests">
                    {({ isActive }) => (
                      <span
                        className={
                          isActive
                            ? "font-semibold text-blue-600"
                            : "cursor-pointer hover:text-blue-600"
                        }
                      >
                        Requests
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
            <div className="flex items-center gap-2">
              <FaGavel className="text-xl text-blue-700" />
              <span className="font-barlow text-xl font-bold text-gray-800">
                Justif<span className="text-blue-500">Ai</span>
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 font-medium text-gray-600 md:flex">
            <NavLink to="/lawyer/lawyer-dashboard">
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? "font-semibold text-blue-600"
                      : "cursor-pointer hover:text-blue-600"
                  }
                >
                  Dashboard
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/calendar">
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? "font-semibold text-blue-600"
                      : "cursor-pointer hover:text-blue-600"
                  }
                >
                  Calendar
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/manage-availability">
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? "font-semibold text-blue-600"
                      : "cursor-pointer hover:text-blue-600"
                  }
                >
                  Management
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/earnings">
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? "font-semibold text-blue-600"
                      : "cursor-pointer hover:text-blue-600"
                  }
                >
                  Earnings
                </span>
              )}
            </NavLink>
            <NavLink to="/lawyer/appointment-requests">
              {({ isActive }) => (
                <span
                  className={
                    isActive
                      ? "font-semibold text-blue-600"
                      : "cursor-pointer hover:text-blue-600"
                  }
                >
                  Requests
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
                  <li>Appointment booked by client</li>
                  <li>New message from Sarah Jenkins</li>
                  <li>Payment received</li>
                </ul>
              </div>
            )} */}

            <div className="relative" ref={profileRef}>
              <img
                src={user.profileImage.url}
                alt="profile"
                onClick={() => setShowProfile(!showProfile)}
                className="h-9 w-9 cursor-pointer rounded-full ring-2 ring-blue-500"
              />

              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl transition-all duration-300 ease-out z-50 ${
                  showProfile
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-2 scale-95 opacity-0 pointer-events-none"
                }`}
              >
                <div className="mb-4 flex items-center gap-4">
                  <img
                    src={user.profileImage.url}
                    alt="lawyer"
                    className="h-14 w-14 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>

                <div className="my-3 border-t border-gray-100"></div>

                <div className="space-y-2 text-sm">
                  <button
                    onClick={() =>
                      navigate(`/lawyer/lawyer-profile/${user.id}`)
                    }
                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  {/* <button className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100">
                    Account Settings
                  </button> */}
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
    </>
  );
};

export default LawyerHeader;
