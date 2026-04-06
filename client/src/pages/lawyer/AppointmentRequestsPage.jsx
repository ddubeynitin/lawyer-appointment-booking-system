import { useEffect, useState } from "react";
import axios from "axios";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Mail,
  Paperclip,
  X,
  XCircle,
} from "lucide-react";
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

const isImageEvidence = (evidence = {}) => {
  const value = String(evidence?.originalName || evidence?.url || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/.test(value);
};

const getEvidenceLabel = (evidence = {}) =>
  evidence?.originalName || evidence?.url?.split?.("/").pop() || "Uploaded evidence";

const formatJoinedDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getClientId = (appointment) =>
  appointment?.userId?._id || appointment?.userId?.id || appointment?.userId || "";

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
  const [rejectingAppointment, setRejectingAppointment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [clientDetailsAppointment, setClientDetailsAppointment] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [clientProfileLoading, setClientProfileLoading] = useState(false);
  const [clientProfileError, setClientProfileError] = useState("");

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

  const updateAppointmentStatus = async (appointmentId, status, reason = "") => {
    try {
      setProcessing({
        id: appointmentId,
        action: status.toLowerCase(),
      });
      setFeedback("");

      const response = await axios.put(`${API_URL}/appointments/${appointmentId}`, {
        status,
        rejectionReason: reason,
      });

      setAppointments((currentAppointments) =>
        currentAppointments.filter(
          (appointment) => appointment._id !== appointmentId,
        ),
      );
      const updatedAppointment = response.data || {};
      const meetingNote =
        status === "Approved" &&
        updatedAppointment.appointmentMode === "Online" &&
        updatedAppointment.meetingLink
          ? " Meeting link generated."
          : "";

      setFeedback(
        `Appointment ${status === "Approved" ? "approved" : "rejected"} successfully.${meetingNote}`,
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

  const openRejectModal = (appointment) => {
    setRejectingAppointment(appointment);
    setRejectionReason("");
    setRejectionError("");
  };

  const closeRejectModal = () => {
    setRejectingAppointment(null);
    setRejectionReason("");
    setRejectionError("");
  };

  const openClientDetails = (appointment) => {
    setClientDetailsAppointment(appointment);
  };

  const closeClientDetails = () => {
    setClientDetailsAppointment(null);
    setClientProfile(null);
    setClientProfileLoading(false);
    setClientProfileError("");
  };

  useEffect(() => {
    const fetchClientProfile = async () => {
      const clientId = getClientId(clientDetailsAppointment);

      if (!clientDetailsAppointment || !clientId) {
        setClientProfile(clientDetailsAppointment?.userId || null);
        setClientProfileLoading(false);
        setClientProfileError("");
        return;
      }

      const inlineProfile =
        typeof clientDetailsAppointment.userId === "object"
          ? clientDetailsAppointment.userId
          : null;

      if (
        inlineProfile?.city ||
        inlineProfile?.state ||
        inlineProfile?.gender ||
        inlineProfile?.profilePicture
      ) {
        setClientProfile(inlineProfile);
        setClientProfileLoading(false);
        setClientProfileError("");
        return;
      }

      setClientProfileLoading(true);
      setClientProfileError("");

      try {
        const response = await axios.get(`${API_URL}/users/${clientId}`);
        setClientProfile(response.data || inlineProfile || null);
      } catch (error) {
        console.error("Failed to fetch client profile:", error);
        setClientProfile(inlineProfile || null);
        setClientProfileError("Some profile details could not be loaded right now.");
      } finally {
        setClientProfileLoading(false);
      }
    };

    fetchClientProfile();
  }, [clientDetailsAppointment]);

  const submitRejection = async () => {
    const reason = rejectionReason.trim();

    if (!reason) {
      setRejectionError("Please enter a rejection reason before continuing.");
      return;
    }

    if (!rejectingAppointment?._id) return;

    await updateAppointmentStatus(rejectingAppointment._id, "Rejected", reason);
    closeRejectModal();
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
                const evidence = appointment.caseEvidence || {};
                const hasEvidence = Boolean(evidence?.url);

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
                            <button
                              type="button"
                              onClick={() => openClientDetails(appointment)}
                              className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                            >
                              See Client Details
                            </button>
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
                            value="Hidden"
                          />
                          <InfoItem
                            icon={<FileText size={16} />}
                            label="Appointment Mode"
                            value={appointment.appointmentMode || "Online"}
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

                        <div className="rounded-2xl bg-white p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <Paperclip size={14} className="text-blue-600" />
                            <span>Case Evidence</span>
                          </div>

                          {hasEvidence ? (
                            <div className="mt-3 space-y-3">
                              {isImageEvidence(evidence) ? (
                                <a
                                  href={evidence.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                                >
                                  <img
                                    src={evidence.url}
                                    alt={getEvidenceLabel(evidence)}
                                    className="h-56 w-full object-cover"
                                  />
                                </a>
                              ) : null}

                              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <Paperclip size={18} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800">
                                      {getEvidenceLabel(evidence)}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                      Click to review the uploaded evidence.
                                    </p>
                                  </div>
                                </div>

                                <a
                                  href={evidence.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                >
                                  <ExternalLink size={16} />
                                  Open file
                                </a>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-slate-500">
                              No supporting evidence was uploaded for this appointment.
                            </p>
                          )}
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
                          onClick={() => openRejectModal(appointment)}
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

        <section className="rounded-3xl bg-white p-6 shadow-xl mt-5">
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

        {clientDetailsAppointment ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            onClick={closeClientDetails}
            role="presentation"
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Client details"
            >
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                      Client Profile
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      {clientProfile?.name || clientDetailsAppointment.userId?.name || "Client"}
                    </h2>
                   
                  </div>

                  <button
                    type="button"
                    onClick={closeClientDetails}
                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label="Close client details dialog"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.3fr]">
                <div className="border-b border-slate-200 bg-slate-50 p-6 lg:border-b-0 lg:border-r">
                  <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                    {clientProfile?.profilePicture ? (
                      <img
                        src={clientProfile.profilePicture}
                        alt={clientProfile?.name || "Client"}
                        className="h-28 w-28 rounded-3xl object-cover shadow-lg ring-4 ring-white"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg ring-4 ring-white">
                        {(clientProfile?.name || clientDetailsAppointment.userId?.name || "C")
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Contact
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-800">
                        {clientProfile?.email || clientDetailsAppointment.userId?.email || "Not provided"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {clientProfile?.phone || clientDetailsAppointment.userId?.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {clientProfile?.gender || clientDetailsAppointment.userId?.gender || "Gender not set"}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {clientProfile?.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </div>

                    {clientProfileError ? (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-700">
                        {clientProfileError}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailCard label="Full Name" value={clientProfile?.name || "Not provided"} />
                    <DetailCard label="Email Address" value={clientProfile?.email || "Not provided"} />
                    <DetailCard label="Phone Number" value={clientProfile?.phone || "Not provided"} />
                    <DetailCard label="Gender" value={clientProfile?.gender || "Not provided"} />
                    <DetailCard label="City" value={clientProfile?.city || "Not provided"} />
                    <DetailCard label="State" value={clientProfile?.state || "Not provided"} />
                    <DetailCard label="Account Created" value={formatJoinedDate(clientProfile?.createdAt)} />
                    <DetailCard label="Account Status" value={clientProfile?.isActive === false ? "Inactive" : "Active"} />
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Profile Status
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {clientProfileLoading
                        ? "Loading the latest client profile details..."
                        : "These details are pulled from the client account record, not the appointment itself."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {rejectingAppointment ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
            onClick={closeRejectModal}
            role="presentation"
          >
            <div
              className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Reject appointment"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
                    Reject Appointment
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-800">
                    Add a rejection reason
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    The client will receive your reason in the rejection email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close rejection dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-600">Appointment</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {rejectingAppointment.userId?.name || "Client"} on{" "}
                  {formatAppointmentDate(rejectingAppointment.date)} at{" "}
                  {rejectingAppointment.timeSlot}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {rejectingAppointment.caseCategory} consultation
                </p>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Rejection reason
                </span>
                <textarea
                  rows="5"
                  value={rejectionReason}
                  onChange={(event) => {
                    setRejectionReason(event.target.value);
                    if (rejectionError) setRejectionError("");
                  }}
                  placeholder="Explain clearly why this request is being rejected"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-red-500"
                />
              </label>

              {rejectionError ? (
                <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {rejectionError}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRejection}
                  disabled={processing.id === rejectingAppointment._id}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {processing.id === rejectingAppointment._id ? "Rejecting..." : "Send rejection"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
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

const DetailCard = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-medium text-slate-800">{value}</p>
  </div>
);

export default AppointmentRequestsPage;
