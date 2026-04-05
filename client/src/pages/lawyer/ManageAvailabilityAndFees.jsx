import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  IndianRupee,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { API_URL } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import LawyerHeader from "../../components/common/LawyerHeader";
import LoadingFallback from "../../components/LoadingFallback";

const DEFAULT_TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

const FEE_HINTS = ["Consultation", "Drafting", "Court Appearance", "Documentation", "Retainer"];
const TIME_SLOT_REGEX = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;

const getTodayDateInputValue = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const toDateInputValue = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatDateLabel = (value) => {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const timeToMinutes = (time) => {
  const match = String(time || "").trim().match(TIME_SLOT_REGEX);
  if (!match) return Number.POSITIVE_INFINITY;
  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + minutes;
};

const normalizeTimeLabel = (time) => {
  const match = String(time || "").trim().match(TIME_SLOT_REGEX);
  if (!match) return "";
  const hours = Number(match[1]);
  const minutes = match[2];
  const meridiem = match[3].toUpperCase();
  if (!Number.isFinite(hours) || hours < 1 || hours > 12) return "";
  return `${String(hours).padStart(2, "0")}:${minutes} ${meridiem}`;
};

const isBookedSlot = (slot) =>
  slot?.isBooked === true || slot?.booked === true || slot?.isAvailable === false;

const normalizeAvailabilityList = (items = []) =>
  items
    .map((item) => ({
      ...item,
      dateKey: toDateInputValue(item?.date),
      slots: Array.isArray(item?.slots)
        ? item.slots
            .map((slot) => ({
              time: normalizeTimeLabel(typeof slot === "string" ? slot : slot?.time || slot?.startTime),
              isBooked: isBookedSlot(slot),
            }))
            .filter((slot) => slot.time)
            .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
        : [],
    }))
    .filter((item) => item.dateKey)
    .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

const normalizeFeeRows = (feesByCategory = []) =>
  Array.isArray(feesByCategory) && feesByCategory.length > 0
    ? feesByCategory.map((row) => ({ category: row?.category || "", fee: row?.fee ?? "" }))
    : [{ category: "", fee: "" }];

const ManageAvailabilityAndFees = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const lawyerId = user?.id || user?._id || "";

  const [lawyerProfile, setLawyerProfile] = useState(null);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateInputValue());
  const [selectedOpenSlots, setSelectedOpenSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [customTime, setCustomTime] = useState("");
  const [feeRows, setFeeRows] = useState([{ category: "", fee: "" }]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [savingFees, setSavingFees] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth/login");
      return;
    }
    if (user.role !== "lawyer") navigate("/client/client-dashboard");
  }, [navigate, user]);

  useEffect(() => {
    if (!lawyerId) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await axios.get(`${API_URL}/lawyers/${lawyerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setLawyerProfile(response.data);
        setFeeRows(normalizeFeeRows(response.data?.feesByCategory));
      } catch (error) {
        console.error("Failed to load lawyer profile:", error);
        setPageError("Unable to load your profile right now.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [lawyerId, token]);

  useEffect(() => {
    if (!lawyerId) return;
    const fetchAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const response = await axios.get(`${API_URL}/availability/lawyer/${lawyerId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setAvailabilityData(
          normalizeAvailabilityList(
            Array.isArray(response.data)
              ? response.data
              : response.data?.data || response.data?.availabilities || [],
          ),
        );
      } catch (error) {
        console.error("Failed to load availability:", error);
        setAvailabilityData([]);
      } finally {
        setLoadingAvailability(false);
      }
    };
    fetchAvailability();
  }, [lawyerId, token]);

  const selectedDayRecord = useMemo(
    () => availabilityData.find((entry) => entry.dateKey === selectedDate) || null,
    [availabilityData, selectedDate],
  );

  useEffect(() => {
    if (!selectedDayRecord) {
      setSelectedOpenSlots([]);
      setBookedSlots([]);
      setCustomTime("");
      return;
    }
    setBookedSlots(
      selectedDayRecord.slots.filter((slot) => slot.isBooked).map((slot) => slot.time),
    );
    setSelectedOpenSlots(
      selectedDayRecord.slots.filter((slot) => !slot.isBooked).map((slot) => slot.time),
    );
    setCustomTime("");
  }, [selectedDayRecord]);

  const availableDayCount = availabilityData.length;
  const totalSlotCount = availabilityData.reduce((count, entry) => count + entry.slots.length, 0);
  const bookedSlotCount = availabilityData.reduce(
    (count, entry) => count + entry.slots.filter((slot) => slot.isBooked).length,
    0,
  );

  const sortedTimeChoices = useMemo(
    () =>
      [...new Set([...DEFAULT_TIME_SLOTS, ...selectedOpenSlots, ...bookedSlots])].sort(
        (a, b) => timeToMinutes(a) - timeToMinutes(b),
      ),
    [bookedSlots, selectedOpenSlots],
  );

  const handleToggleSlot = (time) => {
    if (bookedSlots.includes(time)) return;
    setSelectedOpenSlots((current) =>
      current.includes(time)
        ? current.filter((item) => item !== time)
        : [...current, time].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
    );
  };

  const handleAddCustomTime = () => {
    const normalized = normalizeTimeLabel(customTime);
    if (!normalized) {
      toast.error("Use a time like 09:00 AM");
      return;
    }
    if (bookedSlots.includes(normalized) || selectedOpenSlots.includes(normalized)) {
      toast.error("That time slot already exists for this day");
      return;
    }
    setSelectedOpenSlots((current) =>
      [...current, normalized].sort((a, b) => timeToMinutes(a) - timeToMinutes(b)),
    );
    setCustomTime("");
  };

  const handleSaveAvailability = async () => {
    if (!lawyerId) return;

    const finalTimes = [...new Set([...selectedOpenSlots, ...bookedSlots])]
      .filter(Boolean)
      .sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    if (finalTimes.length === 0) {
      toast.error("Add at least one consultation time before saving");
      return;
    }

    setSavingAvailability(true);
    try {
      const response = await axios.post(
        `${API_URL}/availability`,
        {
          lawyerId,
          date: selectedDate,
          slots: finalTimes.map((time) => ({
            time,
            isBooked: bookedSlots.includes(time),
          })),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      const savedEntry = normalizeAvailabilityList([response.data])[0];
      setAvailabilityData((current) =>
        normalizeAvailabilityList([
          ...current.filter((entry) => entry.dateKey !== selectedDate),
          savedEntry,
        ]),
      );
      toast.success("Availability saved");
    } catch (error) {
      console.error("Failed to save availability:", error);
      toast.error(error?.response?.data?.message || "Unable to save availability");
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleDeleteDay = async () => {
    if (!selectedDayRecord?._id) {
      toast.error("No saved availability for this date");
      return;
    }

    if (!window.confirm(`Delete availability for ${formatDateLabel(selectedDate)}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/availability/${selectedDayRecord._id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setAvailabilityData((current) =>
        current.filter((entry) => entry._id !== selectedDayRecord._id),
      );
      setSelectedOpenSlots([]);
      setBookedSlots([]);
      toast.success("Availability removed");
    } catch (error) {
      console.error("Failed to delete availability:", error);
      toast.error(error?.response?.data?.message || "Unable to delete availability");
    }
  };

  const handleFeeRowChange = (index, field, value) => {
    setFeeRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    );
  };

  const handleAddFeeRow = (category = "") => {
    setFeeRows((current) => [...current, { category, fee: "" }]);
  };

  const handleRemoveFeeRow = (index) => {
    setFeeRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSaveFees = async () => {
    if (!lawyerId) return;

    const cleanedFees = feeRows
      .map((row) => ({ category: row.category.trim(), fee: Number(row.fee) }))
      .filter((row) => row.category && Number.isFinite(row.fee) && row.fee > 0);

    if (cleanedFees.length === 0) {
      toast.error("Add at least one valid fee category");
      return;
    }

    const duplicateCategory = cleanedFees.some(
      (row, index) =>
        cleanedFees.findIndex(
          (candidate) => candidate.category.toLowerCase() === row.category.toLowerCase(),
        ) !== index,
    );

    if (duplicateCategory) {
      toast.error("Each fee category should be unique");
      return;
    }

    setSavingFees(true);
    try {
      const response = await axios.put(
        `${API_URL}/lawyers/update-lawyer/${lawyerId}`,
        { feesByCategory: cleanedFees },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      );

      setLawyerProfile((current) => ({ ...current, ...response.data }));
      setFeeRows(normalizeFeeRows(response.data?.feesByCategory || cleanedFees));
      toast.success("Fees updated");
    } catch (error) {
      console.error("Failed to update fees:", error);
      toast.error(error?.response?.data?.message || "Unable to save fees");
    } finally {
      setSavingFees(false);
    }
  };

  if (loadingProfile) {
    return <LoadingFallback />;
  }

  if (pageError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
        <LawyerHeader />
        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-6 py-12">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-slate-800">{pageError}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/lawyer/lawyer-dashboard")}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Back to dashboard
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      <LawyerHeader />
      <Toaster position="top-right" />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="bg-linear-to-r from-slate-950 via-slate-900 to-blue-900 px-6 py-8 text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-blue-100">
                  <BadgeCheck size={14} />
                  Lawyer controls
                </div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  Manage availability and fees
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                  Set the consultation times clients can book, keep booked slots
                  protected, and update your fee categories from one place.
                </p>
              </div>
              <Link
                to="/lawyer/lawyer-dashboard"
                className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <ArrowLeft size={16} />
                Back to dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-3 sm:p-8">
            <StatCard
              icon={<CalendarDays size={18} />}
              label="Saved days"
              value={availableDayCount}
              note="Dates with published time slots"
            />
            <StatCard
              icon={<Clock3 size={18} />}
              label="Total slots"
              value={totalSlotCount}
              note={loadingAvailability ? "Refreshing availability..." : "Across all saved days"}
            />
            <StatCard
              icon={<BadgeCheck size={18} />}
              label="Booked slots"
              value={bookedSlotCount}
              note="Locked by appointments"
            />
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1.3fr_0.9fr] lg:p-8">
            <section className="space-y-6">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                      Availability
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      Choose a date and publish time slots
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Existing booked slots stay locked. Open slots can be added,
                      removed, or expanded with custom times.
                    </p>
                  </div>
                  <div className="w-full md:max-w-xs">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Selected date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      className="w-full rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatDateLabel(selectedDate)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedDayRecord
                          ? `${selectedDayRecord.slots.length} slots saved for this day`
                          : "No availability has been saved for this day yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        {selectedOpenSlots.length} open
                      </span>
                      <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
                        {bookedSlots.length} booked
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        Quick slot picker
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedOpenSlots([])}
                        className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                      >
                        Clear open slots
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                      {sortedTimeChoices.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        const isSelected = selectedOpenSlots.includes(time);

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => handleToggleSlot(time)}
                            disabled={isBooked}
                            className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                              isBooked
                                ? "cursor-not-allowed border-rose-100 bg-rose-50 text-rose-500"
                                : isSelected
                                ? "border-blue-500 bg-blue-600 text-white shadow-md"
                                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {time}
                            {isBooked ? " (booked)" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Add custom time
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={customTime}
                        onChange={(event) => setCustomTime(event.target.value)}
                        placeholder="09:00 AM"
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomTime}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Plus size={16} />
                        Add slot
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Use a 12-hour format like 02:30 PM.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveAvailability}
                      disabled={savingAvailability}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Save size={16} />
                      {savingAvailability ? "Saving availability..." : "Save day"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteDay}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Trash2 size={16} />
                      Delete day
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Saved availability dates
                    </h3>
                    <p className="text-sm text-slate-500">
                      Click a date to edit its slots.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(getTodayDateInputValue());
                      toast.success("Jumped back to today");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <RefreshCw size={16} />
                    Today
                  </button>
                </div>

                <div className="mt-4">
                  {loadingAvailability ? (
                    <p className="text-sm text-slate-500">Loading saved availability...</p>
                  ) : availabilityData.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      No saved availability yet. Add your first day above.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {availabilityData.map((entry) => {
                        const openCount = entry.slots.filter((slot) => !slot.isBooked).length;
                        const bookedCount = entry.slots.filter((slot) => slot.isBooked).length;
                        const isActive = entry.dateKey === selectedDate;
                        return (
                          <button
                            key={entry._id || entry.dateKey}
                            type="button"
                            onClick={() => setSelectedDate(entry.dateKey)}
                            className={`rounded-2xl border p-4 text-left transition ${
                              isActive
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {formatDateLabel(entry.dateKey)}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700">
                                {openCount} open
                              </span>
                              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-rose-700">
                                {bookedCount} booked
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Fees
                    </p>
                    <h2 className="text-xl font-bold text-slate-900">
                      Update consultation fees
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Keep your fee categories in sync with your practice areas or
                  pricing structure.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {FEE_HINTS.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => handleAddFeeRow(hint)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      + {hint}
                    </button>
                  ))}
                </div>

                <div className="mt-5 space-y-4">
                  {feeRows.map((row, index) => (
                    <div
                      key={`${row.category || "fee"}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Category
                          </label>
                          <input
                            list="fee-categories"
                            value={row.category}
                            onChange={(event) =>
                              handleFeeRowChange(index, "category", event.target.value)
                            }
                            placeholder="Consultation"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Fee
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={row.fee}
                            onChange={(event) =>
                              handleFeeRowChange(index, "fee", event.target.value)
                            }
                            placeholder="1500"
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          Add only valid rows with a positive fee.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeeRow(index)}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => handleAddFeeRow()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Plus size={16} />
                    Add fee row
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveFees}
                    disabled={savingFees}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-slate-900 to-blue-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} />
                    {savingFees ? "Saving fees..." : "Save fees"}
                  </button>
                </div>

                <datalist id="fee-categories">
                  {FEE_HINTS.map((hint) => (
                    <option key={hint} value={hint} />
                  ))}
                </datalist>
              </div>

              <div className="rounded-3xl border border-green-100 bg-green-50 p-5">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 text-green-600" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Profile status</p>
                    <p className="mt-1 text-sm leading-6 text-green-800">
                      {lawyerProfile?.verification === "Approved"
                        ? "Your lawyer profile is verified. These updates will reflect in client booking flows."
                        : "Your profile is still pending review. Availability and fee changes will still save normally."}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value, note }) => (
  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
    <p className="mt-3 text-sm text-slate-500">{note}</p>
  </div>
);

export default ManageAvailabilityAndFees;
