import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, FileText, UserRound } from "lucide-react";
import LawyerHeader from "../../components/common/LawyerHeader";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatSelectedDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const LawyerCalendarPage = () => {
  const { user } = useAuth();
  const lawyerId = user?.id || user?._id;
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!lawyerId) {
        setError("Unable to load calendar because the lawyer account is missing.");
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await axios.get(
          `${API_URL}/appointments/lawyer/${lawyerId}?date=${selectedDate}`,
        );
        setAppointments(response.data?.appointments || []);
      } catch (fetchError) {
        console.error("Failed to fetch calendar appointments:", fetchError);
        setError("Unable to load appointments for the selected date.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [lawyerId, selectedDate]);

  const appointmentSummary = useMemo(() => {
    return appointments.reduce(
      (summary, appointment) => {
        if (appointment.status === "Approved") summary.approved += 1;
        if (appointment.status === "Pending") summary.pending += 1;
        if (appointment.status === "Rejected") summary.rejected += 1;
        return summary;
      },
      { approved: 0, pending: 0, rejected: 0 },
    );
  }, [appointments]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 font-barlow">
      <LawyerHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
                Lawyer Calendar
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-800">
                Manage your daily schedule
              </h1>
              <p className="mt-2 text-slate-500">
                Check bookings for a selected day and review each client appointment.
              </p>
            </div>

            <div className="w-full max-w-xs">
              <label
                htmlFor="calendar-date"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Select date
              </label>
              <input
                id="calendar-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Selected Date"
            value={formatSelectedDate(selectedDate)}
            icon={<CalendarDays size={18} />}
          />
          <SummaryCard
            title="Total Appointments"
            value={appointments.length}
            icon={<Clock3 size={18} />}
          />
          <SummaryCard
            title="Approved"
            value={appointmentSummary.approved}
            icon={<UserRound size={18} />}
          />
          <SummaryCard
            title="Pending"
            value={appointmentSummary.pending}
            icon={<FileText size={18} />}
          />
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                Appointments for {formatSelectedDate(selectedDate)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sorted by the order they were booked for that day.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading calendar appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <h3 className="text-lg font-semibold text-slate-800">
                No appointments scheduled
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                This date is currently open on your calendar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <article
                  key={appointment._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-slate-800">
                          {appointment.userId?.name || "Client"}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            appointment.status === "Approved"
                              ? "bg-green-100 text-green-700"
                              : appointment.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <DetailItem label="Time Slot" value={appointment.timeSlot} />
                        <DetailItem
                          label="Case Category"
                          value={appointment.caseCategory}
                        />
                        <DetailItem
                          label="Email"
                          value={appointment.userId?.email || "Not provided"}
                        />
                        <DetailItem
                          label="Phone"
                          value={appointment.userId?.phone || "Not provided"}
                        />
                      </div>

                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Case Description
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {appointment.caseDescription}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-full rounded-2xl bg-white p-4 text-sm text-slate-600 lg:min-w-[180px]">
                      <p className="font-medium text-slate-800">Consultation Fee</p>
                      <p className="mt-1">Rs {appointment.feeCharged}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const SummaryCard = ({ title, value, icon }) => (
  <div className="rounded-3xl bg-white p-5 shadow-sm">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-sm text-slate-500">{title}</p>
      <span className="text-blue-600">{icon}</span>
    </div>
    <p className="text-lg font-semibold text-slate-800">{value}</p>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

export default LawyerCalendarPage;
