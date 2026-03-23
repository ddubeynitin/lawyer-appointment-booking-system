import { FaGavel, FaSearch, FaVideo, FaTimes } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import userImg from "../../assets/gifs/icons8-user.gif";
import axios from "axios";
import { API_URL } from "../../utils/api";
import { TfiMenuAlt } from "react-icons/tfi";
import useFetch from "../../hooks/useFetch";

const ClientDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [profileUpdateError, setProfileUpdateError] = useState("");
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const profileRef = useRef(null);

  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const { data: lawyersData } = useFetch(`${API_URL}/lawyers`);
  const lawyers = Array.isArray(lawyersData) ? lawyersData : [];

  const recommendedLawyers = lawyers
    .filter((lawyer) => lawyer._id !== user?.id)
    .sort(
      (firstLawyer, secondLawyer) =>
        (secondLawyer.rating || 0) - (firstLawyer.rating || 0),
    )
    .slice(0, 2);

  const matchedLawyers = useMemo(() => {
    const normalizedQuery = searchInput.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

    return lawyers
      .filter((lawyer) => {
        const searchableText = [
          lawyer.name,
          ...(lawyer.specializations || []),
          lawyer.location?.city,
          lawyer.location?.state,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return tokens.every((token) => searchableText.includes(token));
      })
      .slice(0, 3);
  }, [lawyers, searchInput]);

  const upcomingAppointment = appointmentHistory
    .filter((appointment) => {
      if (!appointment?.date || !appointment?.timeSlot) return false;

      const appointmentDateTime = new Date(
        `${new Date(appointment.date).toISOString().split("T")[0]} ${appointment.timeSlot}`,
      );

      return (
        !Number.isNaN(appointmentDateTime.getTime()) &&
        appointmentDateTime >= new Date() &&
        appointment.status !== "Rejected" &&
        appointment.status !== "Completed"
      );
    })
    .sort((firstAppointment, secondAppointment) => {
      const firstDate = new Date(
        `${new Date(firstAppointment.date).toISOString().split("T")[0]} ${firstAppointment.timeSlot}`,
      );
      const secondDate = new Date(
        `${new Date(secondAppointment.date).toISOString().split("T")[0]} ${secondAppointment.timeSlot}`,
      );

      return firstDate - secondDate;
    })[0];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const fetchAppointmentHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/appointments/user/${user.id}`,
      );
      setAppointmentHistory(response.data.appointments || []);
    } catch (error) {
      console.error("Error fetching appointment history:", error);
      setAppointmentHistory([]);
    }
  };

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

  useEffect(() => {
    if (!showProfileModal) {
      return;
    }

    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditingProfile(false);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");
  }, [showProfileModal, user]);

  const showMenu = () => {
    setIsMenuVisible((current) => !current);
  };

  const handleLawyerSearch = () => {
    const trimmedSearch = searchInput.trim();

    navigate(
      trimmedSearch
        ? `/client/lawyer-list?search=${encodeURIComponent(trimmedSearch)}`
        : "/client/lawyer-list",
    );
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim().toLowerCase();
    const trimmedPhone = profileForm.phone.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone) {
      setProfileUpdateError("Name, email, and phone are required.");
      setProfileUpdateSuccess("");
      return;
    }

    setIsSavingProfile(true);
    setProfileUpdateError("");
    setProfileUpdateSuccess("");

    try {
      const response = await axios.put(`${API_URL}/users/${user.id}`, {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });

      const updatedUser = response.data;

      login({
        token,
        user: {
          ...user,
          id: updatedUser._id || updatedUser.id || user.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
        },
      });

      setProfileForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });
      setIsEditingProfile(false);
      setProfileUpdateSuccess("Profile updated successfully.");
    } catch (error) {
      setProfileUpdateError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update profile right now.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
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
            <div
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
            )}

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
                src={user.profilePicture || userImg}
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
              <div className="mt-4 w-full space-y-3 text-left">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileInputChange}
                    disabled={!isEditingProfile || isSavingProfile}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              {profileUpdateError ? (
                <p className="mt-4 w-full text-left text-sm text-red-600">
                  {profileUpdateError}
                </p>
              ) : null}

              {profileUpdateSuccess ? (
                <p className="mt-4 w-full text-left text-sm text-green-600">
                  {profileUpdateSuccess}
                </p>
              ) : null}

              {isEditingProfile ? (
                <div className="mt-6 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={handleProfileSave}
                    disabled={isSavingProfile}
                    className="w-full rounded-xl bg-blue-600 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileForm({
                        name: user?.name || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                      });
                      setProfileUpdateError("");
                      setProfileUpdateSuccess("");
                    }}
                    disabled={isSavingProfile}
                    className="w-full rounded-xl border border-gray-300 py-2 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(true);
                    setProfileUpdateError("");
                    setProfileUpdateSuccess("");
                  }}
                  className="mt-6 w-full rounded-xl bg-blue-600 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, <span className="uppercase text-blue-600">{user.name}</span>
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your appointments and find the legal help you need.
          </p>
        </div>

        <div className="rounded-xl bg-linear-to-b from-blue-700 to-blue-950 p-10 text-white shadow-xl">
          <h2 className="mb-3 text-center text-2xl font-semibold">
            Find the right legal help today
          </h2>
          <p className="mb-6 text-center text-sm opacity-90">
            Search by specialty, location, or name to book your next consultation.
          </p>

          <div className="flex justify-center">
            <div className="w-full max-w-xl">
              <div className="flex overflow-hidden rounded-full bg-white">
                <div className="flex items-center justify-center px-4 text-gray-400">
                  <FaSearch />
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleLawyerSearch();
                    }
                  }}
                  placeholder="Family Law, Corporate, Real Estate..."
                  className="flex-1 px-3 py-2 text-gray-700 outline-none"
                />
                <button
                  type="button"
                  onClick={handleLawyerSearch}
                  className="bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              {searchInput.trim() ? (
                <div className="mt-4 rounded-2xl bg-white/95 p-4 text-left text-slate-700 shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Quick matches
                  </p>
                  {matchedLawyers.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {matchedLawyers.map((lawyer) => (
                        <button
                          key={lawyer._id}
                          type="button"
                          onClick={() =>
                            navigate(`/lawyer/lawyer-profile/${lawyer._id}`)
                          }
                          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div>
                            <p className="font-semibold text-slate-800">
                              {lawyer.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {(lawyer.specializations || []).slice(0, 2).join(", ") ||
                                "General Practice"}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            View
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      No direct matches found. Press search to browse all lawyers.
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-lg font-semibold">Upcoming Appointment</h3>
            {upcomingAppointment && (
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  upcomingAppointment.status === "Approved"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {upcomingAppointment.status.toUpperCase()}
              </span>
            )}
          </div>

          {upcomingAppointment ? (
            <>
              <h4 className="flex justify-center font-semibold">
                Consultation with {upcomingAppointment.lawyerName}
              </h4>
              <p className="mb-3 flex justify-center text-sm text-blue-600">
                {upcomingAppointment.lawyerSpecialization}
              </p>
              <div className="mb-4 space-y-1 text-center text-sm text-gray-600">
                <p>
                  {new Date(upcomingAppointment.date).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
                <p>{upcomingAppointment.timeSlot}</p>
                <p>{upcomingAppointment.caseCategory} consultation</p>
              </div>
              <div className="flex justify-center gap-4">
                <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                  <FaVideo /> Join Video Call
                </button>
                <button className="rounded-lg border px-4 py-2 text-sm">
                  Reschedule
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 text-center text-gray-500">
              <p>No upcoming appointments scheduled.</p>
              <Link
                to="/client/lawyer-list"
                className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              >
                Book a Lawyer
              </Link>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Appointment History</h3>
              <Link
                to="/client/appointment-history"
                className="text-sm text-blue-600"
              >
                View All
              </Link>
            </div>

            <section className="overflow-x-auto rounded-3xl bg-white p-6 shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-3 text-center text-gray-600">DATE</th>
                    <th className="px-2 py-3 text-center text-gray-600">LAWYER</th>
                    <th className="px-2 py-3 text-center text-gray-600">TYPE</th>
                    <th className="px-2 py-3 text-center text-gray-600">STATUS</th>
                    <th className="px-2 py-3 text-center text-gray-600">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentHistory.length > 0 ? (
                    appointmentHistory.map((appointment, index) => (
                      <tr
                        key={appointment._id || index}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        <td className="py-4 text-center">
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                        <td className="text-center">{appointment.lawyerName}</td>
                        <td className="text-center">{appointment.caseCategory}</td>
                        <td className="text-center">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              appointment.status === "Completed"
                                ? "bg-green-100 text-green-600"
                                : appointment.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-600"
                                  : appointment.status === "Approved"
                                    ? "bg-blue-100 text-blue-600"
                                    : appointment.status === "Rejected"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="text-center">
                          {appointment.status === "Completed" ? (
                            <span className="cursor-pointer text-blue-600">
                              View Notes
                            </span>
                          ) : appointment.status === "Approved" ? (
                            <span className="cursor-pointer text-blue-600">
                              Book Again
                            </span>
                          ) : (
                            <span className="cursor-not-allowed text-gray-400">
                              No Action
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No appointment history found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <h3 className="mb-2 text-lg font-semibold">Recommended</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recommendedLawyers.length > 0 ? (
                recommendedLawyers.map((lawyer) => (
                  <div
                    key={lawyer._id}
                    className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-md transition hover:shadow-xl"
                  >
                    <img
                      src={
                        lawyer.profileImage?.url ||
                        "https://randomuser.me/api/portraits/lego/1.jpg"
                      }
                      className="mb-4 h-16 w-16 rounded-full object-cover"
                      alt={lawyer.name}
                    />
                    <p className="font-medium text-gray-800">{lawyer.name}</p>
                    <p className="mb-2 text-xs text-gray-500">
                      {(lawyer.specializations || []).slice(0, 2).join(", ") ||
                        "General Practice"}{" "}
                      • {lawyer.experience || 0} yrs
                    </p>
                    <p className="mb-4 line-clamp-3 px-2 text-sm text-gray-600">
                      {lawyer.bio ||
                        "Experienced lawyer ready to help with your legal matter."}
                    </p>
                    <Link
                      to={`/lawyer/lawyer-profile/${lawyer._id}`}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Profile
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No recommended lawyers available.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
