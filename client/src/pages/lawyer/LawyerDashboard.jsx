import { FaCalendarAlt, FaClock, FaMoneyBill, FaVideo } from "react-icons/fa";
import {
  CalendarDays,
  Clock3,
  FileText,
  Mail,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { API_URL } from "../../utils/api";
import LawyerHeader from "../../components/common/LawyerHeader";
import MeetingAccessCard from "../../components/meeting/MeetingAccessCard";
import { Link, useNavigate } from "react-router-dom";

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

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const normalizeTimeSlot = (time) => {
  const match = String(time || "")
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();

  if (!Number.isFinite(hours) || hours < 1 || hours > 12) return "";

  return `${String(hours).padStart(2, "0")}:${minutes} ${meridiem}`;
};

const LawyerDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDateAvailability, setSelectedDateAvailability] =
    useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(
    `${API_URL}/appointments/lawyer/${user.id}?status=Pending`,
  );
  const { data: allAppointmentsData, loading: allAppointmentsLoading } =
    useFetch(`${API_URL}/appointments/lawyer/${user.id}`);
  const appointments = data?.appointments || [];
  const allAppointments = allAppointmentsData?.appointments || [];
  const totalAppointments = data?.totalAppointments || 0;
  const pendingAppointments = data?.pendingAppointments || 0;
  const completedRevenue = allAppointments
    .filter((appointment) => appointment?.status === "Completed")
    .reduce(
      (sum, appointment) => sum + Number(appointment?.feeCharged || 0),
      0,
    );
  const selectedDateLabel = formatScheduleDateLabel(selectedDate);
  const selectedDateSlots = Array.isArray(selectedDateAvailability?.slots)
    ? selectedDateAvailability.slots
        .map((slot) => ({
          time: normalizeTimeSlot(
            typeof slot === "string" ? slot : slot?.time || slot?.startTime,
          ),
          isBooked:
            slot?.isBooked === true ||
            slot?.booked === true ||
            slot?.isAvailable === false,
        }))
        .filter((slot) => slot.time)
    : [];
  const hasAvailabilityForSelectedDate = selectedDateSlots.length > 0;
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

  useEffect(() => {
    if (!user?.id || !selectedDate) {
      setSelectedDateAvailability(null);
      return undefined;
    }

    let isMounted = true;

    const fetchAvailability = async () => {
      setAvailabilityLoading(true);

      try {
        const response = await axios.get(
          `${API_URL}/availability/${user.id}/${selectedDate}`,
        );

        if (isMounted) {
          setSelectedDateAvailability(response.data || null);
        }
      } catch (fetchError) {
        if (fetchError?.response?.status !== 404) {
          console.error("Failed to load availability:", fetchError);
        }

        if (isMounted) {
          setSelectedDateAvailability(null);
        }
      } finally {
        if (isMounted) {
          setAvailabilityLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, user?.id]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    if (!selectedAppointment) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedAppointment(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedAppointment]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 font-barlow">
      <LawyerHeader />
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-10">
        <div>
          <h1 className="flex flex-col lg:flex-row text-3xl font-bold text-gray-800">
            {greeting}, <span className="text-blue-600">{user.name}</span>
          </h1>
          <p className="mt-1 text-gray-500">
            Here&apos;s what&apos;s happening in your practice today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Appointments"
            value={loading ? "..." : totalAppointments}
            icon={<FaCalendarAlt />}
            onClick={() => navigate("/lawyer/appointments")}
            sub={
              <Link to="/lawyer/appointments" className="font-medium text-blue-600">
                View Appointment details
              </Link>
            }
          />
          <StatCard
            title="Pending Requests"
            value={loading ? "..." : pendingAppointments}
            onClick={() => navigate("/lawyer/appointment-requests")}
            icon={<FaClock />}
            sub={
              <Link to="/lawyer/appointment-requests" className="font-medium text-blue-600">
                View Request details
              </Link>
            }
          />
          <StatCard
            title="Total Earnings"
            value={
              allAppointmentsLoading ? "..." : formatCurrency(completedRevenue)
            }
            icon={<FaMoneyBill />}
            onClick={() => navigate("/lawyer/earnings")}
            sub={
              <Link to="/lawyer/earnings" className="font-medium text-blue-600">
                View earnings details
              </Link>
            }
          />
        </div>
        {/* Up Next Appointment */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card
              title="Up Next"
              badge={
                upcomingAppointment
                  ? new Date(upcomingAppointment.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )
                  : "No upcoming"
              }
            >
              {allAppointmentsLoading ? (
                <p className="text-sm text-gray-500">
                  Loading next appointment...
                </p>
              ) : upcomingAppointment ? (
                <>
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
                          {upcomingAppointment.caseCategory} •{" "}
                          {upcomingAppointment.timeSlot}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(
                            upcomingAppointment.date,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAppointment(upcomingAppointment)
                        }
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:border-blue-300 hover:text-blue-600"
                      >
                        Details
                      </button>
                      {/* <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                      <FaVideo /> Join Meeting
                    </button> */}
                    </div>
                  </div>
                  <MeetingAccessCard
                    appointment={upcomingAppointment}
                    className="mt-4"
                  />
                </>
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
              {availabilityLoading ? (
                <p className="text-sm text-gray-500">Loading schedule...</p>
              ) : hasAvailabilityForSelectedDate ? (
                <>
                  <p className="mb-4 text-sm text-gray-500">
                    Showing your saved availability for {selectedDateLabel}
                  </p>
                  <div className="space-y-3">
                    {selectedDateSlots.map((slot) => (
                      <ScheduleItem
                        key={slot.time}
                        time={slot.time}
                        title={slot.isBooked ? "Booked slot" : "Available slot"}
                        sub={
                          slot.isBooked
                            ? "This consultation time is already reserved"
                            : "Open for new bookings"
                        }
                        status={slot.isBooked ? "booked" : "available"}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-5 text-center">
                  <p className="text-base font-semibold text-slate-800">
                    Create schedule for this date
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    No availability has been set for {selectedDateLabel} yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/lawyer/manage-availability")}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Create Schedule
                  </button>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-7">
            <Card
              title="New Requests"
              action={
                <Link
                  to="/lawyer/appointment-requests"
                  className="text-sm text-blue-600"
                >
                  View All
                </Link>
              }
            >
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

            {/* <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="mb-2 font-semibold">Quick Notes</h4>
              <textarea
                placeholder="Type a note..."
                className="h-24 w-full bg-transparent text-sm outline-none"
              />
              <button className="mt-2 text-sm text-blue-600">Save</button>
            </div> */}

            {/* <div className="rounded-3xl bg-linear-to-b from-blue-700 to-blue-900 p-6 text-center text-white shadow-xl">
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
            </div> */}
          </div>
        </div>
      </main>

      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full rounded-xl bg-white p-4 text-left shadow-sm transition lg:grid grid-cols-2 ${
      onClick
        ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border hover:border-blue-500"
        : ""
    }`}
  >
    <div className=" flex flex-col items-center justify-center">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className="flex justify-center items-center">{icon && <span className="text-blue-600 text-5xl p-3 rounded-2xl bg-gray-100/50">{icon}</span>}</div>
    {sub &&
      (typeof sub === "string" ? (
        <p className="text-xs text-green-600">{sub}</p>
      ) : (
        sub
      ))}
  </button>
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
      {action &&
        (typeof action === "string" ? (
          <span className="text-sm text-blue-600">{action}</span>
        ) : (
          action
        ))}
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

const AppointmentDetailsModal = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-4xl rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-details-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
          aria-label="Close appointment details"
        >
          <X size={18} />
        </button>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.95fr]">
          <section className="rounded-3xl bg-slate-50 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <CalendarDays size={24} />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-600">
                  Appointment Details
                </p>
                <h2
                  id="appointment-details-title"
                  className="mt-2 text-2xl font-semibold text-slate-800"
                >
                  {appointment.caseCategory} Consultation
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Review the scheduled meeting and the client information in one
                  place.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ModalInfoCard
                icon={<CalendarDays size={16} />}
                label="Appointment Date"
                value={new Date(appointment.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
              <ModalInfoCard
                icon={<Clock3 size={16} />}
                label="Time Slot"
                value={appointment.timeSlot}
              />
              <ModalInfoCard
                icon={<FileText size={16} />}
                label="Status"
                value={appointment.status}
              />
              <ModalInfoCard
                icon={<FileText size={16} />}
                label="Consultation Fee"
                value={`Rs ${appointment.feeCharged}`}
              />
            </div>

            <div className="mt-5 rounded-3xl bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Case Description
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {appointment.caseDescription || "No case description provided."}
              </p>
            </div>
          </section>

          <section className="rounded-3xl bg-blue-600 p-5 text-white sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <UserRound size={24} />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-100">
                  Client Details
                </p>
                <h3 className="mt-1 text-xl font-semibold">
                  {appointment.userId?.name || "Client"}
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <ClientInfoRow
                icon={<Mail size={16} />}
                label="Email"
                value={appointment.userId?.email || "Not provided"}
              />
              <ClientInfoRow
                icon={<Phone size={16} />}
                label="Phone"
                value={appointment.userId?.phone || "Not provided"}
              />
              <ClientInfoRow
                icon={<FileText size={16} />}
                label="Appointment ID"
                value={appointment._id}
              />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Close
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

const ModalInfoCard = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-white p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      <span className="text-blue-600">{icon}</span>
      <span>{label}</span>
    </div>
    <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

const ClientInfoRow = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
    <p className="mt-2 break-all text-sm font-medium text-white">{value}</p>
  </div>
);

export default LawyerDashboard;
