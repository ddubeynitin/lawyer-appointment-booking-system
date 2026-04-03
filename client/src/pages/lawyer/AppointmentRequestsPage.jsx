import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, CheckCircle2, Clock3, Mail, Phone, XCircle } from "lucide-react";
import LawyerHeader from "../../components/common/LawyerHeader";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";

const formatAppointmentDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const AppointmentRequestsPage = () => {
  const { user } = useAuth();
  const lawyerId = user?.id || user?._id;

  const [appointments, setAppointments] = useState([]);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleLoading, setRescheduleLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");
  const [processing, setProcessing] = useState({ id: null, action: null });
  const [feedback, setFeedback] = useState("");

  const fetchPendingAppointments = async () => {
    if (!lawyerId) {
      setAppointments([]);
      setRescheduleRequests([]);
      setLoading(false);
      setRescheduleLoading(false);
      setError("Unable to load requests because the lawyer account is missing.");
      setRescheduleError("Unable to load requests because the lawyer account is missing.");
      return;
    }

    try {
      setLoading(true);
      setRescheduleLoading(true);
      setError("");
      setRescheduleError("");
      const response = await axios.get(
        `${API_URL}/appointments/lawyer/${lawyerId}?status=Pending`,
      );
      setAppointments(response.data?.appointments || []);

      const rescheduleResponse = await axios.get(
        `${API_URL}/appointments/lawyer/${lawyerId}/reschedule-requests?rescheduleStatus=Pending`,
      );
      setRescheduleRequests(rescheduleResponse.data?.appointments || []);
    } catch (fetchError) {
      console.error("Failed to fetch appointment requests:", fetchError);
      setError("Unable to load pending requests right now.");
      setRescheduleError("Unable to load reschedule requests right now.");
      setAppointments([]);
      setRescheduleRequests([]);
    } finally {
      setLoading(false);
      setRescheduleLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAppointments();
  }, [lawyerId]);

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      setProcessing({
        id: appointmentId,
        action: status.toLowerCase(),
      });
      setFeedback("");

      await axios.put(`${API_URL}/appointments/${appointmentId}`, { status });

      setAppointments((currentAppointments) =>
        currentAppointments.filter(
          (appointment) => appointment._id !== appointmentId,
        ),
      );
      setFeedback(
        `Appointment ${status === "Approved" ? "approved" : "rejected"} successfully.`,
      );
    } catch (updateError) {
      console.error(`Failed to ${status.toLowerCase()} appointment:`, updateError);
      setFeedback(
        updateError.response?.data?.error ||
          `Unable to ${status.toLowerCase()} this appointment right now.`,
      );
    } finally {
      setProcessing({ id: null, action: null });
    }
  };

  const handleRescheduleDecision = async (appointmentId, action) => {
    try {
      setProcessing({
        id: appointmentId,
        action: action.toLowerCase(),
      });
      setFeedback("");
      setRescheduleError("");

      await axios.put(`${API_URL}/appointments/${appointmentId}/reschedule-response`, {
        action,
      });

      setRescheduleRequests((currentRequests) =>
        currentRequests.filter((appointment) => appointment._id !== appointmentId),
      );

      setFeedback(
        `Reschedule request ${action === "Approved" ? "approved" : "rejected"} successfully.`,
      );
    } catch (updateError) {
      console.error(`Failed to ${action.toLowerCase()} reschedule request:`, updateError);
      setRescheduleError(
        updateError.response?.data?.error ||
          `Unable to ${action.toLowerCase()} this reschedule request right now.`,
      );
    } finally {
      setProcessing({ id: null, action: null });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <LawyerHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              Appointment Requests
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-800">
              Pending client requests
            </h1>
            <p className="mt-2 text-slate-500">
              Review each booking request and approve or reject it from one place.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
            <span className="font-semibold text-slate-800">{appointments.length}</span>{" "}
            request{appointments.length === 1 ? "" : "s"} awaiting action
          </div>
        </div>

        {feedback && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {feedback}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading pending requests...
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-800">
                No pending requests
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                New appointment requests will appear here when clients book a slot.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {appointments.map((appointment) => {
                const isApproving =
                  processing.id === appointment._id &&
                  processing.action === "approved";
                const isRejecting =
                  processing.id === appointment._id &&
                  processing.action === "rejected";
                const clientName = appointment.userId?.name || "Client";

                return (
                  <article
                    key={appointment._id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold text-slate-800">
                              {clientName}
                            </h2>
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                              {appointment.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {appointment.caseCategory} consultation request
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <InfoItem
                            icon={<CalendarDays size={16} />}
                            label="Appointment Date"
                            value={formatAppointmentDate(appointment.date)}
                          />
                          <InfoItem
                            icon={<Clock3 size={16} />}
                            label="Time Slot"
                            value={appointment.timeSlot}
                          />
                          <InfoItem
                            icon={<Mail size={16} />}
                            label="Email"
                            value={appointment.userId?.email || "Not provided"}
                          />
                          <InfoItem
                            icon={<Phone size={16} />}
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

                      <div className="flex min-w-full flex-col gap-3 lg:min-w-[220px]">
                        <button
                          type="button"
                          onClick={() =>
                            updateAppointmentStatus(appointment._id, "Approved")
                          }
                          disabled={processing.id === appointment._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <CheckCircle2 size={18} />
                          {isApproving ? "Approving..." : "Approve"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateAppointmentStatus(appointment._id, "Rejected")
                          }
                          disabled={processing.id === appointment._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <XCircle size={18} />
                          {isRejecting ? "Rejecting..." : "Reject"}
                        </button>

                        <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
                          <p className="font-medium text-slate-800">Fee</p>
                          <p className="mt-1">Rs {appointment.feeCharged}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
                Reschedule Requests
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-800">
                Pending reschedule approvals
              </h2>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{rescheduleRequests.length}</span>{" "}
              request{rescheduleRequests.length === 1 ? "" : "s"} awaiting decision
            </div>
          </div>

          {rescheduleError && (
            <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {rescheduleError}
            </div>
          )}

          {rescheduleLoading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading reschedule requests...
            </div>
          ) : rescheduleRequests.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Clock3 size={28} />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-800">
                No pending reschedule requests
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Reschedule requests will appear here when a client needs to move a confirmed appointment.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {rescheduleRequests.map((appointment) => {
                const isApproving =
                  processing.id === appointment._id &&
                  processing.action === "approved";
                const isRejecting =
                  processing.id === appointment._id &&
                  processing.action === "rejected";

                return (
                  <article
                    key={appointment._id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold text-slate-800">
                              {appointment.userId?.name || "Client"}
                            </h2>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                              Reschedule Pending
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {appointment.caseCategory} consultation
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <InfoItem
                            icon={<CalendarDays size={16} />}
                            label="Current Date"
                            value={formatAppointmentDate(appointment.date)}
                          />
                          <InfoItem
                            icon={<Clock3 size={16} />}
                            label="Current Time"
                            value={appointment.timeSlot}
                          />
                          <InfoItem
                            icon={<CalendarDays size={16} />}
                            label="New Date"
                            value={formatAppointmentDate(appointment.rescheduleRequestedDate)}
                          />
                          <InfoItem
                            icon={<Clock3 size={16} />}
                            label="New Time"
                            value={appointment.rescheduleRequestedTimeSlot}
                          />
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Reason
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {appointment.rescheduleReason || "No reason provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-full flex-col gap-3 lg:min-w-[220px]">
                        <button
                          type="button"
                          onClick={() =>
                            handleRescheduleDecision(appointment._id, "Approved")
                          }
                          disabled={processing.id === appointment._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <CheckCircle2 size={18} />
                          {isApproving ? "Approving..." : "Approve Move"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleRescheduleDecision(appointment._id, "Rejected")
                          }
                          disabled={processing.id === appointment._id}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <XCircle size={18} />
                          {isRejecting ? "Rejecting..." : "Reject Move"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-white p-4">
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span className="text-blue-600">{icon}</span>
      <span>{label}</span>
    </div>
    <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

export default AppointmentRequestsPage;
