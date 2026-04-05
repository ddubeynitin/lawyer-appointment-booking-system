import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Filter, Search, Star } from "lucide-react";
import ClientHeader from "../../components/common/ClientHeader";
import ReviewRating from "../../components/ReviewRating";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Completed"];
const ALL_CATEGORIES = "All";

const formatAppointmentDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getStatusClasses = (status) => {
  if (status === "Completed") return "bg-green-100 text-green-700";
  if (status === "Pending") return "bg-yellow-100 text-yellow-700";
  if (status === "Approved") return "bg-blue-100 text-blue-700";
  if (status === "Rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
};

export default function MyAppointments() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [reviews, setReviews] = useState([]);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) {
        setAppointments([]);
        setLoading(false);
        setError("Unable to load appointment history because the client account is missing.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`${API_URL}/appointments/user/${userId}`);
        setAppointments(response.data?.appointments || []);
      } catch (fetchError) {
        console.error("Failed to fetch client appointments:", fetchError);
        setAppointments([]);
        setError("Unable to load appointment history right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [userId]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!userId) {
        setReviews([]);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/reviews/user/${userId}`);
        setReviews(response.data || []);
      } catch (fetchError) {
        console.error("Failed to fetch client reviews:", fetchError);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [userId]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        appointments
          .map((appointment) => appointment.caseCategory)
          .filter(Boolean),
      ),
    ];

    return [ALL_CATEGORIES, ...uniqueCategories];
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...appointments]
      .sort((firstAppointment, secondAppointment) => {
        return new Date(secondAppointment.date) - new Date(firstAppointment.date);
      })
      .filter((appointment) => {
        const matchesStatus =
          statusFilter === "All" || appointment.status === statusFilter;
        const matchesCategory =
          categoryFilter === ALL_CATEGORIES ||
          appointment.caseCategory === categoryFilter;

        const searchableText = [
          appointment.lawyerName,
          appointment.lawyerSpecialization,
          appointment.caseCategory,
          appointment.status,
          appointment.timeSlot,
          appointment.caseDescription,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          normalizedSearch.length === 0 ||
          searchableText.includes(normalizedSearch);

        return matchesStatus && matchesCategory && matchesSearch;
      });
  }, [appointments, categoryFilter, searchTerm, statusFilter]);

  const appointmentSummary = useMemo(() => {
    return appointments.reduce(
      (summary, appointment) => {
        summary.total += 1;
        if (appointment.status === "Pending") summary.pending += 1;
        if (appointment.status === "Approved") summary.approved += 1;
        if (appointment.status === "Completed") summary.completed += 1;
        return summary;
      },
      { total: 0, pending: 0, approved: 0, completed: 0 },
    );
  }, [appointments]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter(ALL_CATEGORIES);
  };

  const reviewedAppointmentIds = useMemo(() => {
    return new Set(
      reviews
        .map((review) => review.appointmentId?._id || review.appointmentId)
        .filter(Boolean),
    );
  }, [reviews]);

  const handleReviewSubmitted = (createdReview) => {
    setReviews((currentReviews) => [createdReview, ...currentReviews]);
    setSelectedAppointmentForReview(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 font-barlow">
      <ClientHeader />

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
                Appointment History
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-800">
                Track all your consultations
              </h1>
              <p className="mt-2 text-slate-500">
                Search your bookings, filter by status or category, and review your past and upcoming appointments.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Total" value={appointmentSummary.total} />
              <SummaryCard label="Pending" value={appointmentSummary.pending} />
              <SummaryCard label="Approved" value={appointmentSummary.approved} />
              <SummaryCard label="Completed" value={appointmentSummary.completed} />
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_0.8fr_0.8fr_auto]">
            <label className="relative flex">
              <span className="sr-only">Search appointments</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by lawyer, specialization, category, slot, or status"
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

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">
                <CalendarDays size={16} />
                Category
              </span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-blue-500"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
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
              Loading appointment history...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <h2 className="text-xl font-semibold text-slate-800">
                No appointments found
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search or filter to see more results.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden grid-cols-[1.1fr_1.1fr_1fr_0.9fr_0.9fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-600 md:grid">
                <span>Date</span>
                <span>Lawyer</span>
                <span>Category</span>
                <span>Status</span>
                <span>Fee</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredAppointments.map((appointment) => {
                  const hasReview = reviewedAppointmentIds.has(appointment._id);

                  return (
                    <article
                      key={appointment._id}
                      className="px-6 py-5 transition hover:bg-slate-50"
                    >
                    <div className="hidden items-start gap-4 md:grid md:grid-cols-[1.1fr_1.1fr_1fr_0.9fr_0.9fr_1fr]">
                      <div>
                        <p className="font-medium text-slate-800">
                          {formatAppointmentDate(appointment.date)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {appointment.timeSlot}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {appointment.lawyerName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {appointment.lawyerSpecialization}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          {appointment.caseCategory}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {appointment.caseDescription}
                        </p>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div>
                        <p className="font-medium text-slate-800">
                          Rs {appointment.feeCharged}
                        </p>
                      </div>

                      <div>
                        {appointment.status === "Completed" ? (
                          hasReview ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <Star size={12} className="fill-current" />
                              Reviewed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedAppointmentForReview(appointment)}
                              className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 transition hover:bg-yellow-200"
                            >
                              <Star size={12} className="fill-current" />
                              Review & Rate
                            </button>
                          )
                        ) : (
                          <span className="text-sm text-slate-400">Not available</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 md:hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {appointment.lawyerName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {appointment.lawyerSpecialization}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            appointment.status,
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">Date</p>
                          <p className="font-medium text-slate-800">
                            {formatAppointmentDate(appointment.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Time</p>
                          <p className="font-medium text-slate-800">
                            {appointment.timeSlot}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Category</p>
                          <p className="font-medium text-slate-800">
                            {appointment.caseCategory}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Fee</p>
                          <p className="font-medium text-slate-800">
                            Rs {appointment.feeCharged}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Case Description</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {appointment.caseDescription}
                        </p>
                      </div>

                      <div className="pt-1">
                        {appointment.status === "Completed" ? (
                          hasReview ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <Star size={12} className="fill-current" />
                              Reviewed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedAppointmentForReview(appointment)}
                              className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700"
                            >
                              <Star size={12} className="fill-current" />
                              Review & Rate
                            </button>
                          )
                        ) : null}
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {selectedAppointmentForReview ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-md"
            onClick={() => setSelectedAppointmentForReview(null)}
            role="presentation"
          >
            <div
              className="w-full max-w-lg"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Review and rating"
            >
              <ReviewRating
                appointment={selectedAppointmentForReview}
                onClose={() => setSelectedAppointmentForReview(null)}
                onSubmitSuccess={handleReviewSubmitted}
              />
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

const SummaryCard = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 px-4 py-3">
    <p className="text-sm text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
  </div>
);
