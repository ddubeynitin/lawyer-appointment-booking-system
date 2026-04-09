import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, Filter, Search, Table2, Users, LayoutGrid } from "lucide-react";
import LawyerHeader from "../../components/common/LawyerHeader";
import MeetingAccessCard from "../../components/meeting/MeetingAccessCard";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Completed"];

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getStatusClasses = (status) => {
  if (status === "Completed") return "bg-green-100 text-green-700";
  if (status === "Pending") return "bg-yellow-100 text-yellow-700";
  if (status === "Approved") return "bg-blue-100 text-blue-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

const LawyerAppointmentsPage = () => {
  const { user } = useAuth();
  const lawyerId = user?.id || user?._id;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("normal");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!lawyerId) {
        setLoading(false);
        setError("Unable to load appointments because the lawyer account is missing.");
        setAppointments([]);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_URL}/appointments/lawyer/${lawyerId}`);
        setAppointments(response.data?.appointments || []);
      } catch (fetchError) {
        console.error("Failed to fetch lawyer appointments:", fetchError);
        setError("Unable to load your appointments right now.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [lawyerId]);

  const summary = useMemo(() => {
    return appointments.reduce(
      (acc, appointment) => {
        acc.total += 1;
        if (appointment.status === "Pending") acc.pending += 1;
        if (appointment.status === "Approved") acc.approved += 1;
        if (appointment.status === "Rejected") acc.rejected += 1;
        if (appointment.status === "Completed") acc.completed += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0 },
    );
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments
      .filter((appointment) => {
        const matchesStatus =
          statusFilter === "All" || appointment.status === statusFilter;

        const searchableText = [
          appointment.userId?.name,
          appointment.userId?.email,
          appointment.caseCategory,
          appointment.caseDescription,
          appointment.timeSlot,
          appointment.status,
          appointment.appointmentMode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 || searchableText.includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      })
      .sort((firstAppointment, secondAppointment) => {
        return new Date(secondAppointment.date) - new Date(firstAppointment.date);
      });
  }, [appointments, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 font-barlow">
      <LawyerHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <section className="rounded-3xl bg-white p-6 shadow-xl bg-linear-to-r from-slate-950 via-slate-900 to-blue-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between ">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
                Lawyer Appointments
              </p>
              <h1 className="mt-2 text-3xl font-bold text-white">
                All your appointments in one place
              </h1>
              <p className="mt-2 text-slate-200">
                Review every booking, track status, and open the meeting link when it is ready.
              </p>
            </div>

            
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            title="Total Appointments"
            value={summary.total}
            icon={<Users size={18} />}
          />
          <SummaryCard
            title="Pending"
            value={summary.pending}
            icon={<Clock3 size={18} />}
          />
          <SummaryCard
            title="Approved"
            value={summary.approved}
            icon={<CalendarDays size={18} />}
          />
          <SummaryCard
            title="Completed"
            value={summary.completed}
            icon={<CalendarDays size={18} />}
          />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr_auto_auto]">
            <label className="relative block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">Search appointments</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-2/3 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search client, category, slot, or status"
                className="w-full rounded-2xl border border-slate-200 py-3 pr-4 pl-11 text-slate-700 outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Filter size={16} />
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("normal")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    viewMode === "normal"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid size={16} />
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Table2 size={16} />
                  Table
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-800">{filteredAppointments.length}</span>{" "}
                of <span className="font-semibold text-slate-800">{appointments.length}</span>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {loading ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h2 className="text-xl font-semibold text-slate-800">
                No appointments found
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search or status filter.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-left text-sm text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Client</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Time</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Mode</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Meeting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="align-top hover:bg-slate-50/80">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-800">
                          {appointment.userId?.name || "Client"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {appointment.userId?.email || "Not provided"}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700">
                        {formatDate(appointment.date)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700">
                        {appointment.timeSlot}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700">
                        {appointment.caseCategory}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-700">
                        {appointment.appointmentMode || "Online"}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {appointment.status === "Completed" && appointment.meetingLink ? null : (
                          <MeetingAccessCard appointment={appointment} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAppointments.map((appointment) => (
                <article key={appointment._id} className="px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-slate-800">
                          {appointment.userId?.name || "Client"}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {appointment.appointmentMode || "Online"}
                        </span>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <DetailItem label="Date" value={formatDate(appointment.date)} />
                        <DetailItem label="Time" value={appointment.timeSlot} />
                        <DetailItem label="Category" value={appointment.caseCategory} />
                        <DetailItem label="Fee" value={`Rs ${appointment.feeCharged}`} />
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Case Description
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {appointment.caseDescription}
                        </p>
                      </div>

                      {appointment.status === "Completed" && appointment.meetingLink ? null : <MeetingAccessCard appointment={appointment} />}
                    </div>

                    <div className="min-w-full rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 lg:min-w-55">
                      <p className="font-medium text-slate-800">Client Email</p>
                      <p className="mt-1 break-all">{appointment.userId?.email || "Not provided"}</p>
                      <p className="mt-4 font-medium text-slate-800">Client Phone</p>
                      <p className="mt-1">{appointment.userId?.phone || "Not provided"}</p>
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
  <div className={`rounded-xl p-4 shadow-sm bg-linear-to-br ${ title === "Total Appointments" ? "from-gray-50 to-blue-300" : title === "Pending" ? "from-gray-50 to-yellow-300" : title === "Completed" ? "from-gray-50 to-green-300" : "from-gray-50 to-purple-300" }`}>
    <div className="mb-2 flex items-center justify-between">
      <p className="text-sm text-gray-600">{title}</p>
      {icon && <span className="text-blue-600">{icon}</span>}
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

export default LawyerAppointmentsPage;
