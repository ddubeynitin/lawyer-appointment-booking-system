import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  Clock3,
  FileText,
  Paperclip,
  Scale,
  UserRound,
  UploadCloud,
} from "lucide-react";
import ClientHeader from "../../components/common/ClientHeader";
import AppointmentBooked from "../../components/appointment/AppointmentBooked";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../utils/api";
import useFetch from "../../hooks/useFetch";
import LoadingFallback from "../../components/LoadingFallback";

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
];

const TIME_SLOT_REGEX = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;

const CASE_CATEGORIES = ["Criminal", "Civil", "Corporate", "Family", "Property"];
const APPOINTMENT_MODES = ["Online", "Office"];

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDateTimeFromDateAndSlot = (dateValue, slot) => {
  if (!dateValue || !slot) {
    return null;
  }

  const [time, meridiem] = slot.split(" ");
  const [rawHours, rawMinutes] = time.split(":").map(Number);

  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) {
    return null;
  }

  let hours = rawHours % 12;
  if (meridiem === "PM") {
    hours += 12;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day, hours, rawMinutes, 0, 0);
};

const normalizeTimeSlot = (time) => {
  const match = String(time || "").trim().match(TIME_SLOT_REGEX);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();

  if (!Number.isFinite(hours) || hours < 1 || hours > 12) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${minutes} ${meridiem}`;
};

const normalizeAvailabilitySlots = (slots = []) =>
  slots
    .map((slot) => ({
      time: normalizeTimeSlot(
        typeof slot === "string" ? slot : slot?.time || slot?.startTime,
      ),
      isBooked:
        slot?.isBooked === true ||
        slot?.booked === true ||
        slot?.isAvailable === false,
    }))
    .filter((slot) => slot.time);

const AppointmentSchedulingPage = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const { data: lawyersData, loading: lawyersLoading } = useFetch(`${API_URL}/lawyers`);
  const bookingAnimationTimeoutRef = useRef(null);

  const [selectedLawyerId, setSelectedLawyerId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [caseCategory, setCaseCategory] = useState(CASE_CATEGORIES[0]);
  const [appointmentMode, setAppointmentMode] = useState(APPOINTMENT_MODES[0]);
  const [caseDescription, setCaseDescription] = useState("");
  const [caseEvidence, setCaseEvidence] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingAnimationActive, setBookingAnimationActive] = useState(false);
  const [error, setError] = useState("");

  const lawyers = useMemo(
    () => (Array.isArray(lawyersData) ? lawyersData : []),
    [lawyersData],
  );

  useEffect(() => {
    return () => {
      if (bookingAnimationTimeoutRef.current) {
        window.clearTimeout(bookingAnimationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (lawyers.length === 0) return;

    const lawyerFromParams = lawyers.find((lawyer) => lawyer._id === id);

    if (lawyerFromParams) {
      setSelectedLawyerId(lawyerFromParams._id);
      return;
    }

    if (!selectedLawyerId) {
      setSelectedLawyerId(lawyers[0]._id);
    }
  }, [id, lawyers, selectedLawyerId]);

  const selectedLawyer = useMemo(
    () => lawyers.find((lawyer) => lawyer._id === selectedLawyerId),
    [lawyers, selectedLawyerId],
  );

  const selectedFee = useMemo(() => {
    const feeMatch = selectedLawyer?.feesByCategory?.find(
      (feeItem) => feeItem.category === caseCategory,
    );

    return feeMatch?.fee || 0;
  }, [selectedLawyer, caseCategory]);

  const timeSlotsToDisplay =
    availabilitySlots.length > 0
      ? availabilitySlots
      : TIME_SLOTS.map((slot) => ({
          time: slot,
          isBooked: false,
        }));
  const isUsingDynamicAvailability = availabilitySlots.length > 0;
  const morningSlots = useMemo(
    () => timeSlotsToDisplay.filter((slot) => /AM$/i.test(slot.time || slot)),
    [timeSlotsToDisplay],
  );
  const afternoonSlots = useMemo(
    () => timeSlotsToDisplay.filter((slot) => /PM$/i.test(slot.time || slot)),
    [timeSlotsToDisplay],
  );

  const renderSlotButton = (slot) => {
    const slotTime = slot.time || slot;
    const isBooked = isUsingDynamicAvailability
      ? slot.isBooked || bookedSlots.includes(slotTime)
      : bookedSlots.includes(slotTime);
    const isPastSlot = (() => {
      const slotDateTime = getDateTimeFromDateAndSlot(selectedDate, slotTime);

      return slotDateTime ? slotDateTime < new Date() : false;
    })();
    const isSelected = selectedTimeSlot === slotTime;
    const isDisabled = isBooked || isPastSlot;

    return (
      <button
        key={slotTime}
        type="button"
        disabled={isDisabled}
        onClick={() => setSelectedTimeSlot(slotTime)}
        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
          isDisabled
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : isSelected
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-500"
        }`}
      >
        {slotTime}
      </button>
    );
  };

  useEffect(() => {
    const fetchScheduleData = async () => {
      if (!selectedLawyerId || !selectedDate) {
        setBookedSlots([]);
        setAvailabilitySlots([]);
        return;
      }

      setSlotsLoading(true);

      try {
        const [appointmentsResponse, availabilityResponse] = await Promise.allSettled([
          axios.get(
            `${API_URL}/appointments/lawyer/${selectedLawyerId}?date=${selectedDate}`,
          ),
          axios.get(`${API_URL}/availability/${selectedLawyerId}/${selectedDate}`),
        ]);

        if (appointmentsResponse.status === "fulfilled") {
          const appointments = appointmentsResponse.value.data?.appointments || [];
          setBookedSlots(appointments.map((appointment) => appointment.timeSlot));
        } else {
          console.error("Failed to fetch booked slots:", appointmentsResponse.reason);
          setBookedSlots([]);
        }

        if (availabilityResponse.status === "fulfilled") {
          const responseData = availabilityResponse.value.data;
          const slots = Array.isArray(responseData?.slots)
            ? responseData.slots
            : Array.isArray(responseData)
              ? responseData
              : [];

          setAvailabilitySlots(normalizeAvailabilitySlots(slots));
        } else if (availabilityResponse.reason?.response?.status === 404) {
          setAvailabilitySlots([]);
        } else {
          console.error("Failed to fetch availability:", availabilityResponse.reason);
          setAvailabilitySlots([]);
        }
      } catch (fetchError) {
        console.error("Failed to fetch schedule data:", fetchError);
        setBookedSlots([]);
        setAvailabilitySlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchScheduleData();
  }, [selectedLawyerId, selectedDate]);

  useEffect(() => {
    if (!selectedTimeSlot) {
      return;
    }

    const selectedSlotDateTime = getDateTimeFromDateAndSlot(
      selectedDate,
      selectedTimeSlot,
    );

    if (selectedSlotDateTime && selectedSlotDateTime < new Date()) {
      setSelectedTimeSlot("");
    }
  }, [selectedDate, selectedTimeSlot]);

  useEffect(() => {
    if (!selectedTimeSlot) {
      return;
    }

    const slotStillExists = timeSlotsToDisplay.some(
      (slot) => (slot.time || slot) === selectedTimeSlot,
    );

    const slotIsBooked = isUsingDynamicAvailability
      ? timeSlotsToDisplay.some(
          (slot) => (slot.time || slot) === selectedTimeSlot && slot.isBooked,
        )
      : bookedSlots.includes(selectedTimeSlot);

    if (!slotStillExists || slotIsBooked) {
      setSelectedTimeSlot("");
    }
  }, [bookedSlots, isUsingDynamicAvailability, selectedTimeSlot, timeSlotsToDisplay]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBookingDetails(null);
    setBookingAnimationActive(false);
    setError("");

    if (bookingAnimationTimeoutRef.current) {
      window.clearTimeout(bookingAnimationTimeoutRef.current);
      bookingAnimationTimeoutRef.current = null;
    }

    if (!user?.id) {
      setError("Please log in to book an appointment.");
      return;
    }

    if (!selectedLawyer || !selectedTimeSlot || !caseDescription.trim()) {
      setError("Please select a lawyer, choose a time slot, and describe your case.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("userId", user.id);
      payload.append("lawyerId", selectedLawyer._id);
      payload.append("lawyerName", selectedLawyer.name);
      payload.append(
        "lawyerSpecialization",
        selectedLawyer.specializations?.[0] || "General Practice",
      );
      payload.append("caseCategory", caseCategory);
      payload.append("appointmentMode", appointmentMode);
      payload.append("caseDescription", caseDescription.trim());
      payload.append("date", selectedDate);
      payload.append("timeSlot", selectedTimeSlot);
      payload.append("feeCharged", String(selectedFee));

      if (caseEvidence) {
        payload.append("caseEvidence", caseEvidence);
      }

      await axios.post(`${API_URL}/appointments`, payload, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setBookingDetails({
        lawyerName: selectedLawyer.name,
        lawyerSpecialization:
          selectedLawyer.specializations?.[0] || "General Practice",
        lawyerLocation:
          [
            selectedLawyer.location?.address,
            selectedLawyer.location?.city,
            selectedLawyer.location?.state,
          ]
            .map((part) => String(part || "").trim())
            .filter(Boolean)
            .join(", ") || "Office location not available",
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        caseCategory,
        appointmentMode,
        feeCharged: selectedFee,
      });
      setSelectedTimeSlot("");
      setCaseDescription("");
      setCaseEvidence(null);
      setBookingAnimationActive(true);
      bookingAnimationTimeoutRef.current = window.setTimeout(() => {
        setBookingAnimationActive(false);
        bookingAnimationTimeoutRef.current = null;
      }, 1800);
    } catch (submitError) {
      setError(
        submitError.response?.data?.error ||
          "Unable to book this appointment right now.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <LoadingFallback />;
  }

  if (bookingAnimationActive && bookingDetails) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-100">
        <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-10">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_42%)]" />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 shadow-sm">
                <img
                  src="/assets/gifs/checklist.gif"
                  alt="Booking in progress"
                  className="h-full w-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Finalizing your appointment
              </h1>
              <p className="mt-2 text-slate-500">
                We&apos;re securing your booking and preparing the confirmation card.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (bookingDetails) {
    return <AppointmentBooked bookingDetails={bookingDetails} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <ClientHeader />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Schedule Your Appointment
          </h1>
          <p className="mt-2 text-slate-500">
            Choose a lawyer, pick an available slot, and submit your case details.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                  <UserRound size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Select Lawyer
                  </h2>
                  <p className="text-sm text-slate-500">
                    Pick who you want to consult with.
                  </p>
                </div>
              </div>

              <select
                value={selectedLawyerId}
                onChange={(event) => setSelectedLawyerId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-blue-500"
                disabled={lawyersLoading}
              >
                {lawyers.map((lawyer) => (
                  <option key={lawyer._id} value={lawyer._id}>
                    {lawyer.name} - {(lawyer.specializations || []).join(", ") || "General Practice"}
                  </option>
                ))}
              </select>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <CalendarDays size={18} className="text-blue-600" />
                  <h3 className="font-semibold">Choose Date</h3>
                </div>
                <input
                  type="date"
                  min={getTodayDateInputValue()}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSelectedTimeSlot("");
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 text-slate-800">
                  <Scale size={18} className="text-blue-600" />
                  <h3 className="font-semibold">Case Category</h3>
                </div>
                <select
                  value={caseCategory}
                  onChange={(event) => setCaseCategory(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                >
                  {CASE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 text-slate-800">
                <UserRound size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold">Appointment Mode</h3>
                  <p className="text-sm text-slate-500">
                    Choose whether you want the consultation online or at the office.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {APPOINTMENT_MODES.map((mode) => {
                  const isSelected = appointmentMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAppointmentMode(mode)}
                      className={`rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    >
                      <p>{mode}</p>
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {mode === "Online"
                          ? "Meet virtually without visiting the office."
                          : "Visit the lawyer's office for the consultation."}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 text-slate-800">
                <Clock3 size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold">Available Time Slots</h3>
                  <p className="text-sm text-slate-500">
                    {isUsingDynamicAvailability
                      ? "Showing the lawyer's saved availability for this date."
                      : "Booked and past slots are disabled automatically."}
                  </p>
                </div>
              </div>

              {slotsLoading ? (
                <p className="text-sm text-slate-500">Loading available slots...</p>
              ) : (
                <div className="space-y-4">
                  {isUsingDynamicAvailability && (
                    <p className="text-sm text-emerald-700">
                      {availabilitySlots.length} time slot
                      {availabilitySlots.length === 1 ? "" : "s"} available for this date.
                    </p>
                  )}

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-900">
                          Morning Slots
                        </h4>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                          {morningSlots.length}
                        </span>
                      </div>

                      {morningSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {morningSlots.map((slot) => renderSlotButton(slot))}
                        </div>
                      ) : (
                        <p className="text-sm text-amber-800/70">
                          No morning slots available.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-900">
                          Afternoon Slots
                        </h4>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                          {afternoonSlots.length}
                        </span>
                      </div>

                      {afternoonSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {afternoonSlots.map((slot) => renderSlotButton(slot))}
                        </div>
                      ) : (
                        <p className="text-sm text-blue-800/70">
                          No afternoon slots available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3 text-slate-800">
                <FileText size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold">Case Details</h3>
                  <p className="text-sm text-slate-500">
                    Help the lawyer understand your matter before the consultation.
                  </p>
                </div>
              </div>

              <textarea
                rows="6"
                value={caseDescription}
                onChange={(event) => setCaseDescription(event.target.value)}
                placeholder="Describe your legal issue, what kind of help you need, and any important background."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
                    <Paperclip size={18} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">Case Evidence</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional. Upload any file or image that helps explain your case.
                    </p>

                    <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center transition hover:border-blue-300 hover:bg-blue-50">
                      <UploadCloud size={22} className="text-blue-600" />
                      <span className="mt-2 text-sm font-semibold text-slate-800">
                        {caseEvidence ? caseEvidence.name : "Click to upload evidence"}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        PDF, image, or document
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setCaseEvidence(file);
                        }}
                        className="hidden"
                      />
                    </label>

                    {caseEvidence ? (
                      <button
                        type="button"
                        onClick={() => setCaseEvidence(null)}
                        className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedLawyerId}
              className="w-full rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Booking Appointment..." : "Confirm Appointment"}
            </button>
          </form>

          <aside className="h-fit space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div>
              <p className="text-sm font-medium text-blue-600">Booking Summary</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-800">
                {selectedLawyer?.name || "Select a lawyer"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {(selectedLawyer?.specializations || []).join(", ") || "General Practice"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <img
                src={
                  selectedLawyer?.profileImage?.url ||
                  "https://randomuser.me/api/portraits/lego/1.jpg"
                }
                alt={selectedLawyer?.name || "Lawyer"}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <span>Date</span>
                  <span className="font-medium text-slate-800">
                    {selectedDate || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Time Slot</span>
                  <span className="font-medium text-slate-800">
                    {selectedTimeSlot || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Category</span>
                  <span className="font-medium text-slate-800">{caseCategory}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Mode</span>
                  <span className="font-medium text-slate-800">{appointmentMode}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Consultation Fee</span>
                  <span className="font-medium text-slate-800">Rs {selectedFee}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Terms & Rescheduling Rules
              </p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900/90">
                <li>Rescheduling is allowed only for approved appointments.</li>
                <li>You can request a reschedule up to 3 hours before the session.</li>
                <li>Choose a future time slot that is not already booked.</li>
                <li>Upload case evidence only if it helps explain your matter.</li>
                <li>All appointment details should be accurate before confirming.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Before you book</p>
              <ul className="mt-3 space-y-2">
                <li>Choose a slot that is not marked as booked.</li>
                <li>Your appointment will be created with the selected lawyer and case type.</li>
                <li>Choose Online for a virtual consultation or Office to visit in person.</li>
                <li>Fees are calculated automatically from the lawyer profile.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AppointmentSchedulingPage;
