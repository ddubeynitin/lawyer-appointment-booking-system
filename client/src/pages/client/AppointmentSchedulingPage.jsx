import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { CalendarDays, Clock3, FileText, Scale, UserRound } from "lucide-react";
import ClientHeader from "../../components/common/ClientHeader";
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

const CASE_CATEGORIES = ["Criminal", "Civil", "Corporate", "Family", "Property"];

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

const AppointmentSchedulingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { data: lawyersData, loading: lawyersLoading } = useFetch(`${API_URL}/lawyers`);

  const [selectedLawyerId, setSelectedLawyerId] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [caseCategory, setCaseCategory] = useState(CASE_CATEGORIES[0]);
  const [caseDescription, setCaseDescription] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState("");

  const lawyers = Array.isArray(lawyersData) ? lawyersData : [];

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

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedLawyerId || !selectedDate) {
        setBookedSlots([]);
        return;
      }

      setSlotsLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/appointments/lawyer/${selectedLawyerId}?date=${selectedDate}`,
        );
        const appointments = response.data?.appointments || [];
        setBookedSlots(appointments.map((appointment) => appointment.timeSlot));
      } catch (fetchError) {
        console.error("Failed to fetch booked slots:", fetchError);
        setBookedSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchBookedSlots();
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBookingDetails(null);
    setError("");

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
      await axios.post(`${API_URL}/appointments`, {
        userId: user.id,
        lawyerId: selectedLawyer._id,
        lawyerName: selectedLawyer.name,
        lawyerSpecialization:
          selectedLawyer.specializations?.[0] || "General Practice",
        caseCategory,
        caseDescription: caseDescription.trim(),
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        feeCharged: selectedFee,
      });

      setBookingDetails({
        lawyerName: selectedLawyer.name,
        lawyerSpecialization:
          selectedLawyer.specializations?.[0] || "General Practice",
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        caseCategory,
        feeCharged: selectedFee,
      });
      setSelectedTimeSlot("");
      setCaseDescription("");
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

  if (bookingDetails) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
        <ClientHeader />
        <main className="flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-10">
          <div className="w-full max-w-xl rounded-3xl border border-green-100 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl text-green-600">
              ✓
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Appointment Booked Successfully
            </h1>
            <p className="mt-2 text-slate-500">
              Your consultation has been confirmed and saved to your dashboard.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left">
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <span>Lawyer</span>
                  <span className="font-medium text-slate-800">
                    {bookingDetails.lawyerName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Specialization</span>
                  <span className="font-medium text-slate-800">
                    {bookingDetails.lawyerSpecialization}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Date</span>
                  <span className="font-medium text-slate-800">
                    {bookingDetails.date}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Time Slot</span>
                  <span className="font-medium text-slate-800">
                    {bookingDetails.timeSlot}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Category</span>
                  <span className="font-medium text-slate-800">
                    {bookingDetails.caseCategory}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Fee</span>
                  <span className="font-medium text-slate-800">
                    Rs {bookingDetails.feeCharged}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/client/client-dashboard")}
              className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go To Dashboard
            </button>
          </div>
        </main>
      </div>
    );
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
                <Clock3 size={18} className="text-blue-600" />
                <div>
                  <h3 className="font-semibold">Available Time Slots</h3>
                  <p className="text-sm text-slate-500">
                    Booked and past slots are disabled automatically.
                  </p>
                </div>
              </div>

              {slotsLoading ? (
                <p className="text-sm text-slate-500">Loading available slots...</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TIME_SLOTS.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isPastSlot = (() => {
                      const slotDateTime = getDateTimeFromDateAndSlot(
                        selectedDate,
                        slot,
                      );

                      return slotDateTime ? slotDateTime < new Date() : false;
                    })();
                    const isSelected = selectedTimeSlot === slot;
                    const isDisabled = isBooked || isPastSlot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          isDisabled
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:border-blue-500"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
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
                  <span>Consultation Fee</span>
                  <span className="font-medium text-slate-800">
                    Rs {selectedFee}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Before you book</p>
              <ul className="mt-3 space-y-2">
                <li>Choose a slot that is not marked as booked.</li>
                <li>Your appointment will be created with the selected lawyer and case type.</li>
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
