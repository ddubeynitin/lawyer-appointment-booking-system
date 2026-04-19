import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CalendarDays, Clock3, Filter, RefreshCcw, Search, Star, X, AlertCircle, CreditCard } from "lucide-react";
import ClientHeader from "../../components/common/ClientHeader";
import ReviewRating from "../../components/ReviewRating";
import DateTimeSlotPicker from "../../components/DateTimeSlotPicker";
import MeetingAccessCard from "../../components/meeting/MeetingAccessCard";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
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

const getPaymentStatusClasses = (paymentStatus) => {
  if (paymentStatus === "Success") return "bg-green-100 text-green-700";
  if (paymentStatus === "Failed") return "bg-red-100 text-red-700";
  if (paymentStatus === "Pending") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

const RESCHEDULE_CUTOFF_HOURS = 1;

/**
 * Check if appointment can be cancelled (Pending status)
 */
const canCancelAppointment = (appointment) => {
  return appointment?.status === "Pending";
};

/**
 * Check if appointment can be rescheduled
 * Must be Approved AND at least 1 hour before appointment time
 */
const canRescheduleAppointment = (appointment) => {
  if (!appointment || appointment.status !== "Approved" || appointment.rescheduleStatus === "Pending") {
    return false;
  }

  const appointmentDateTime = getAppointmentDateTime(appointment.date, appointment.timeSlot);
  if (!appointmentDateTime) {
    return false;
  }

  const timeRemainingMs = appointmentDateTime.getTime() - Date.now();
  return timeRemainingMs >= RESCHEDULE_CUTOFF_HOURS * 60 * 60 * 1000;
};

/**
 * Check if we should show the meeting card with timer
 * Show when appointment is Approved and within 1 hour of start time
 */
const shouldShowMeetingCard = (appointment) => {
  if (!appointment || !["Approved", "Ongoing"].includes(appointment.status)) {
    return false;
  }

  const appointmentDateTime = getAppointmentDateTime(appointment.date, appointment.timeSlot);
  if (!appointmentDateTime) {
    return false;
  }

  const timeRemainingMs = appointmentDateTime.getTime() - Date.now();
  // Show card if appointment is within 1 hour OR already started
  return timeRemainingMs < RESCHEDULE_CUTOFF_HOURS * 60 * 60 * 1000;
};

/**
 * Check if Join Meeting button should be enabled
 * Only enable if status is Ongoing OR appointment time has passed
 */
const canJoinMeeting = (appointment) => {
  if (!appointment || !["Approved", "Ongoing"].includes(appointment.status)) {
    return false;
  }

  if (appointment.status === "Ongoing") {
    return true;
  }

  const appointmentDateTime = getAppointmentDateTime(appointment.date, appointment.timeSlot);
  if (!appointmentDateTime) {
    return false;
  }

  const timeRemainingMs = appointmentDateTime.getTime() - Date.now();
  return timeRemainingMs <= 0; // Appointment time has passed
};

const getAppointmentDateTime = (dateValue, timeSlot) => {
  if (!dateValue || !timeSlot) return null;

  const appointmentDate = new Date(dateValue);
  if (Number.isNaN(appointmentDate.getTime())) return null;

  const [time, meridiem] = String(timeSlot).split(" ");
  const [rawHours, rawMinutes] = time.split(":").map(Number);
  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) return null;

  let hours = rawHours % 12;
  if (meridiem === "PM") hours += 12;
  appointmentDate.setHours(hours, rawMinutes, 0, 0);
  return appointmentDate;
};

const formatLocalDate = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function MyAppointments() {
  const { user } = useAuth();
  const location = useLocation();
  const userId = user?.id || user?._id;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [reviews, setReviews] = useState([]);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState(null);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState(null);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [autoOpenedRescheduleId, setAutoOpenedRescheduleId] = useState("");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const fetchAppointments = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

  const canRescheduleAppointment = (appointment) => {
    if (!appointment || appointment.status !== "Approved" || appointment.rescheduleStatus === "Pending") {
      return false;
    }

    const appointmentDateTime = getAppointmentDateTime(appointment.date, appointment.timeSlot);
    if (!appointmentDateTime) {
      return false;
    }

    const timeRemainingMs = appointmentDateTime.getTime() - Date.now();
    return timeRemainingMs >= RESCHEDULE_CUTOFF_HOURS * 60 * 60 * 1000;
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointmentForReschedule(appointment);
    setRescheduleDate(new Date(appointment.date));
    setRescheduleTime("");
    setRescheduleReason("");
    setRescheduleError("");
  };

  const closeRescheduleModal = () => {
    setSelectedAppointmentForReschedule(null);
    setRescheduleDate(null);
    setRescheduleTime("");
    setRescheduleReason("");
    setRescheduleError("");
  };

  const handleSubmitReschedule = async (event) => {
    event.preventDefault();

    if (!selectedAppointmentForReschedule || !rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please choose a new date and time slot.");
      return;
    }

    try {
      setRescheduleSubmitting(true);
      setRescheduleError("");

      await axios.put(`${API_URL}/appointments/${selectedAppointmentForReschedule._id}/reschedule-request`, {
        userId,
        date: formatLocalDate(rescheduleDate),
        timeSlot: rescheduleTime,
        reason: rescheduleReason.trim(),
      });

      await axios.get(`${API_URL}/appointments/user/${userId}`).then((response) => {
        setAppointments(response.data?.appointments || []);
      });
      closeRescheduleModal();
    } catch (submitError) {
      setRescheduleError(
        submitError.response?.data?.error || "Unable to submit your reschedule request right now.",
      );
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointmentForCancel) return;

    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setCancelSubmitting(true);
      await axios.delete(`${API_URL}/appointments/${selectedAppointmentForCancel._id}`);
      
      // Refresh appointments after cancellation
      await axios.get(`${API_URL}/appointments/user/${userId}`).then((response) => {
        setAppointments(response.data?.appointments || []);
      });

      setSelectedAppointmentForCancel(null);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      alert(error.response?.data?.error || "Unable to cancel appointment.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  useEffect(() => {
    const targetAppointmentId = location.state?.rescheduleAppointmentId;
    if (!targetAppointmentId || appointments.length === 0) {
      return;
    }

    if (autoOpenedRescheduleId === targetAppointmentId) {
      return;
    }

    const targetAppointment = appointments.find(
      (appointment) => appointment._id === targetAppointmentId,
    );

    if (!targetAppointment || targetAppointment.status !== "Approved") {
      return;
    }

    const appointmentDateTime = getAppointmentDateTime(
      targetAppointment.date,
      targetAppointment.timeSlot,
    );

    if (!appointmentDateTime || appointmentDateTime.getTime() - Date.now() < RESCHEDULE_CUTOFF_HOURS * 60 * 60 * 1000) {
      return;
    }

    openRescheduleModal(targetAppointment);
    setAutoOpenedRescheduleId(targetAppointmentId);
  }, [appointments, autoOpenedRescheduleId, location.state]);

  const reviewedAppointmentIds = useMemo(() => {
    return new Set(
      reviews
        .map((review) => review.appointmentId?._id || review.appointmentId)
        .filter(Boolean),
    );
  }, [reviews]);

  const rescheduleLawyerId =
    selectedAppointmentForReschedule?.lawyerId?._id ||
    selectedAppointmentForReschedule?.lawyerId?.id ||
    selectedAppointmentForReschedule?.lawyerId ||
    "";

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
            <label className="relative ">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-600">Search appointments</span>
              <Search
                size={18}
                className="pointer-events-none absolute left-4 lg:top-1/2 top-2/3 -translate-y-1/2 text-slate-400"
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

            <div className="flex flex-col items-end gap-3">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={fetchAppointments}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw size={16} />
                Refresh
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
              <div className="hidden grid-cols-[1.1fr_1.1fr_1fr_0.9fr_0.9fr_0.9fr_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-600 md:grid">
                <span>Date</span>
                <span>Lawyer</span>
                <span>Category</span>
                <span>Status</span>
                <span>Fee</span>
                <span>Payment</span>
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
                    <div className="hidden items-start gap-4 md:grid md:grid-cols-[1.1fr_1.1fr_1fr_0.9fr_0.9fr_0.9fr_1fr]">
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
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                            appointment.paymentStatus || "Pending",
                          )}`}
                        >
                          {appointment.paymentStatus || "Pending"}
                        </span>
                      </div>

                      <div>
                        {appointment.rescheduleStatus === "Pending" ? (
                          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Clock3 size={12} className="fill-current" />
                            Reschedule Pending
                          </span>
                        ) : null}

                        {/* Pending: Show Cancel Button */}
                        {appointment.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() => setSelectedAppointmentForCancel(appointment)}
                            className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        ) : null}

                        {/* Approved: Show Reschedule or Meeting Card with Timer */}
                        {appointment.status === "Approved" ? (
                          <>
                            <div className="space-y-2">
                              {canRescheduleAppointment(appointment) ? (
                                <button
                                  type="button"
                                  onClick={() => openRescheduleModal(appointment)}
                                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                                >
                                  <Clock3 size={12} className="fill-current" />
                                  Reschedule
                                </button>
                              ) : null}
                              {appointment.paymentStatus !== "Success" && (
                                <button
                                  type="button"
                                  className="ml-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-200"
                                >
                                  <CreditCard size={12} />
                                  Pay Now
                                </button>
                              )}
                            </div>
                            {shouldShowMeetingCard(appointment) ? (
                              <MeetingAccessCard
                                appointment={appointment}
                                canJoin={canJoinMeeting(appointment)}
                                className="mt-2"
                              />
                            ) : null}
                          </>
                        ) : null}

                        {/* Ongoing: Show Meeting Card with Join enabled */}
                        {appointment.status === "Ongoing" ? (
                          <MeetingAccessCard
                            appointment={appointment}
                            canJoin={true}
                            className="mt-2"
                          />
                        ) : null}

                        {/* Completed: Show Review Button if not reviewed */}
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
                        ) : null}

                        {/* Rejected: Show No action available */}
                        {appointment.status === "Rejected" ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            <AlertCircle size={12} />
                            No action available
                          </span>
                        ) : null}
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

                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm text-slate-500">Payment</p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                            appointment.paymentStatus || "Pending",
                          )}`}
                        >
                          {appointment.paymentStatus || "Pending"}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Case Description</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">
                          {appointment.caseDescription}
                        </p>
                      </div>

                      <div className="pt-1">
                        {appointment.rescheduleStatus === "Pending" ? (
                          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Clock3 size={12} className="fill-current" />
                            Reschedule Pending
                          </span>
                        ) : null}

                        {/* Pending: Show Cancel Button */}
                        {appointment.status === "Pending" ? (
                          <button
                            type="button"
                            onClick={() => setSelectedAppointmentForCancel(appointment)}
                            className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-200"
                          >
                            <X size={12} />
                            Cancel
                          </button>
                        ) : null}

                        {/* Approved: Show Reschedule or Meeting Card with Timer */}
                        {appointment.status === "Approved" ? (
                          <>
                            <div className="space-y-2">
                              {canRescheduleAppointment(appointment) ? (
                                <button
                                  type="button"
                                  onClick={() => openRescheduleModal(appointment)}
                                  className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                                >
                                  <Clock3 size={12} className="fill-current" />
                                  Reschedule
                                </button>
                              ) : null}
                              {appointment.paymentStatus !== "Success" && (
                                <button
                                  type="button"
                                  className="ml-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 transition hover:bg-green-200"
                                >
                                  <CreditCard size={12} />
                                  Pay Now
                                </button>
                              )}
                            </div>
                            {shouldShowMeetingCard(appointment) ? (
                              <MeetingAccessCard
                                appointment={appointment}
                                canJoin={canJoinMeeting(appointment)}
                                className="mt-2"
                              />
                            ) : null}
                          </>
                        ) : null}

                        {/* Ongoing: Show Meeting Card with Join enabled */}
                        {appointment.status === "Ongoing" ? (
                          <MeetingAccessCard
                            appointment={appointment}
                            canJoin={true}
                            className="mt-2"
                          />
                        ) : null}

                        {/* Completed: Show Review Button if not reviewed */}
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

                        {/* Rejected: Show No action available */}
                        {appointment.status === "Rejected" ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            <AlertCircle size={12} />
                            No action available
                          </span>
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

        {selectedAppointmentForReschedule ? (
          <div
            className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-md"
            onClick={closeRescheduleModal}
            role="presentation"
          >
            <div
              className="w-full max-w-6xl   overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Reschedule appointment"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Reschedule Appointment
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-800">
                    {selectedAppointmentForReschedule.lawyerName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    You can reschedule until 3 hours before the appointment time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRescheduleModal}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close reschedule dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_0.8fr] overflow-y-auto max-h-[80vh]">
                <DateTimeSlotPicker
                  lawyerId={rescheduleLawyerId}
                  selectedDate={rescheduleDate}
                  selectedTime={rescheduleTime}
                  onDateChange={setRescheduleDate}
                  onTimeChange={setRescheduleTime}
                />

                <form onSubmit={handleSubmitReschedule} className="space-y-4 rounded-3xl bg-slate-50 p-6">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Current Appointment</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">
                      {formatAppointmentDate(selectedAppointmentForReschedule.date)} at{" "}
                      {selectedAppointmentForReschedule.timeSlot}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600">New Slot</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Selected date:{" "}
                      {rescheduleDate
                        ? rescheduleDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Not selected"}
                    </p>
                    <p className="text-sm text-slate-500">
                      Selected time: {rescheduleTime || "Not selected"}
                    </p>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">
                      Reason for reschedule
                    </span>
                    <textarea
                      rows="4"
                      value={rescheduleReason}
                      onChange={(event) => setRescheduleReason(event.target.value)}
                      placeholder="Optional, but helpful for the lawyer"
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-blue-500"
                    />
                  </label>

                  {rescheduleError ? (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {rescheduleError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={rescheduleSubmitting}
                    className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {rescheduleSubmitting ? "Submitting request..." : "Send Reschedule Request"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {selectedAppointmentForCancel ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-md"
            onClick={() => setSelectedAppointmentForCancel(null)}
            role="presentation"
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Cancel appointment confirmation"
            >
              <div className="bg-red-50 px-6 py-6 text-center">
                <div className="mx-auto w-fit rounded-full bg-red-100 p-3">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-800">
                  Cancel Appointment?
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Are you sure you want to cancel this appointment with{" "}
                  <strong>{selectedAppointmentForCancel.lawyerName}</strong>?
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatAppointmentDate(selectedAppointmentForCancel.date)} at{" "}
                  {selectedAppointmentForCancel.timeSlot}
                </p>
              </div>

              <div className="flex gap-3 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedAppointmentForCancel(null)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={handleCancelAppointment}
                  disabled={cancelSubmitting}
                  className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {cancelSubmitting ? "Cancelling..." : "Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
