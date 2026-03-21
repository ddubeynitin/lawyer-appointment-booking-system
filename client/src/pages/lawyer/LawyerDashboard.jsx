import { FaCalendarAlt, FaGavel, FaVideo } from "react-icons/fa";
import { LuBellRing } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { API_URL } from "../../utils/api";
import { TfiMenuAlt } from "react-icons/tfi";

const SCHEDULE_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
];

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatScheduleDateLabel = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const LawyerDashboard = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(
    `${API_URL}/appointments/lawyer/${user.id}?status=Pending`,
  );
  const { data: allAppointmentsData, loading: allAppointmentsLoading } = useFetch(
    `${API_URL}/appointments/lawyer/${user.id}`,
  );
  const { data: scheduleData, loading: scheduleLoading } = useFetch(
    `${API_URL}/appointments/lawyer/${user.id}?date=${selectedDate}`,
  );

  const appointments = data?.appointments || [];
  const allAppointments = allAppointmentsData?.appointments || [];
  const totalAppointments = data?.totalAppointments || 0;
  const pendingAppointments = data?.pendingAppointments || 0;
  const selectedDateAppointments = scheduleData?.appointments || [];
  const selectedDateSlots = new Map(
    selectedDateAppointments.map((appointment) => [
      appointment.timeSlot,
      appointment,
    ]),
  );
  const selectedDateLabel = formatScheduleDateLabel(selectedDate);
  const upcomingAppointment = allAppointments
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
    navigate("/auth/login");
  };

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showMenu = () => {
    setIsMenuVisible((current) => !current);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div onClick={showMenu} className="sm:hidden">
            <TfiMenuAlt />
            {isMenuVisible && (
              <div className="absolute top-17 left-0 w-50 rounded-br-2xl rounded-tr-2xl bg-white pt-5 pb-5">
                <nav className="flex flex-col items-center gap-6 font-medium text-gray-600">
                  <Link to="/lawyer/lawyer-dashboard">
                    <span className="font-semibold text-blue-600">Dashboard</span>
                  </Link>
                  <Link to="/hhggkj">
                    <span className="cursor-pointer hover:text-blue-600">
                      Calendar
                    </span>
                  </Link>
                  <Link to="/lawyer/appointment-requests">
                    <span className="cursor-pointer hover:text-blue-600">
                      Requests
                    </span>
                  </Link>
                  <Link>
                    <span className="cursor-pointer hover:text-blue-600">
                      Clients
                    </span>
                  </Link>
                  <Link>
                    <span className="cursor-pointer hover:text-blue-600">
                      Case Files
                    </span>
                  </Link>
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
            <span className="font-semibold text-blue-600">Dashboard</span>
            <span className="cursor-pointer hover:text-blue-600">Calendar</span>
            <span className="cursor-pointer hover:text-blue-600">Requests</span>
            <span className="cursor-pointer hover:text-blue-600">Clients</span>
            <span className="cursor-pointer hover:text-blue-600">Case Files</span>
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
                  <li>Appointment booked by client</li>
                  <li>New message from Sarah Jenkins</li>
                  <li>Payment received</li>
                </ul>
              </div>
            )}

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
                    onClick={() => navigate(`/lawyer/lawyer-profile/${user.id}`)}
                    className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100"
                  >
                    View Profile
                  </button>
                  <button className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-gray-100">
                    Account Settings
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

      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div>
          <h1 className="flex flex-col lg:flex-row text-3xl font-bold text-gray-800">
            {greeting}, <span className="text-blue-600">{user.name}</span>
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s what&apos;s happening in your practice today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Appointments"
            value={loading ? "..." : totalAppointments}
            icon={<FaCalendarAlt />}
          />
          <StatCard
            title="Pending Requests"
            value={loading ? "..." : pendingAppointments}
            sub={error ? "Unable to load" : undefined}
          />
        </div>
        {/* Up Next Appointment */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card
              title="Up Next"
              badge={
                upcomingAppointment
                  ? new Date(upcomingAppointment.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "No upcoming"
              }
            >
              {allAppointmentsLoading ? (
                <p className="text-sm text-gray-500">Loading next appointment...</p>
              ) : upcomingAppointment ? (
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src="/assets/images/user.png"
                      className="h-14 w-14 rounded-lg"
                      alt="client"
                    />
                    <div>
                      <p className="font-semibold">
                        {upcomingAppointment.userId?.name || "Client"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {upcomingAppointment.caseCategory} • {upcomingAppointment.timeSlot}
                      </p>
                      <p className="text-xs text-gray-400">
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
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                      Details
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                      <FaVideo /> Join Meeting
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No upcoming appointments scheduled.
                </p>
              )}
            </Card>

            <Card
              title="Daily Schedule"
              right={
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-500"
                />
              }
            >
              <p className="mb-4 text-sm text-gray-500">
                Showing all time slots for {selectedDateLabel}
              </p>
              {scheduleLoading ? (
                <p className="text-sm text-gray-500">Loading schedule...</p>
              ) : (
                SCHEDULE_TIME_SLOTS.map((time) => {
                  const bookedAppointment = selectedDateSlots.get(time);

                  return (
                    <ScheduleItem
                      key={time}
                      time={time}
                      title={
                        bookedAppointment
                          ? `${bookedAppointment.userId?.name || "Client"} booked this slot`
                          : "Available slot"
                      }
                      sub={
                        bookedAppointment
                          ? `${bookedAppointment.caseCategory} • ${bookedAppointment.status}`
                          : "No appointment booked"
                      }
                      status={bookedAppointment ? "booked" : "available"}
                    />
                  );
                })
              )}
            </Card>
          </div>

          <div className="space-y-7">
            <Card title="New Requests" action="View All">
              {loading ? (
                <p className="text-sm text-gray-500">
                  Loading pending appointments...
                </p>
              ) : appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <RequestItem
                    key={appointment._id}
                    name={appointment.userId?.name || "Client"}
                    type={appointment.caseCategory}
                    date={appointment.date}
                    timeSlot={appointment.timeSlot}
                    status={appointment.status}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No pending appointments found.
                </p>
              )}
            </Card>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="mb-2 font-semibold">Quick Notes</h4>
              <textarea
                placeholder="Type a note..."
                className="h-24 w-full bg-transparent text-sm outline-none"
              />
              <button className="mt-2 text-sm text-blue-600">Save</button>
            </div>

            <div className="rounded-3xl bg-linear-to-b from-blue-700 to-blue-900 p-6 text-center text-white shadow-xl">
              <h4 className="mb-2 flex justify-center font-semibold">
                Need urgent assistance?
              </h4>
              <p className="mb-4 flex justify-center text-sm">
                Match with a client or urgent case immediately.
              </p>
              <div className="flex justify-center">
                <button className="w-40 rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-200">
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

const StatCard = ({ title, value, sub, icon }) => (
  <div className="rounded-xl bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-sm text-gray-600">{title}</p>
      {icon && <span className="text-blue-600">{icon}</span>}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    {sub && <p className="text-xs text-green-600">{sub}</p>}
  </div>
);

const Card = ({ title, badge, action, right, children }) => (
  <div className="rounded-xl bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="font-semibold">{title}</h3>
      {badge && (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
          {badge}
        </span>
      )}
      {action && <span className="text-sm text-blue-600">{action}</span>}
      {right &&
        (typeof right === "string" ? (
          <span className="text-sm text-gray-500">{right}</span>
        ) : (
          right
        ))}
    </div>
    {children}
  </div>
);

const ScheduleItem = ({ time, title, sub, status }) => (
  <div
    className={`flex gap-4 border-l-4 py-3 pl-4 ${
      status === "booked"
        ? "border-red-400 bg-red-50"
        : "border-green-500 bg-green-50"
    }`}
  >
    <span className="w-20 text-sm text-gray-500">{time}</span>
    <div>
      <p className="font-medium">{title}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  </div>
);

const RequestItem = ({ name, type, date, timeSlot, status }) => (
  <div className="mb-4 flex items-center justify-between">
    <div>
      <p className="font-medium">{name}</p>
      <p className="text-xs text-gray-500">{type}</p>
      <p className="text-xs text-gray-400">
        {new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}{" "}
        at {timeSlot}
      </p>
    </div>
    <div className="flex gap-2">
      <span className="rounded-lg bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
        {status}
      </span>
    </div>
  </div>
);

export default LawyerDashboard;
