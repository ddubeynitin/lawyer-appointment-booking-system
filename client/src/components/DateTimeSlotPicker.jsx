import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar, Check } from "lucide-react";
import axios from "axios";
import { API_URL } from "../utils/api";

const formatLocalDate = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const normalizeTimeSlot = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
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
      time: normalizeTimeSlot(typeof slot === "string" ? slot : slot?.time || slot?.startTime),
      isBooked:
        slot?.isBooked === true ||
        slot?.booked === true ||
        slot?.isAvailable === false,
    }))
    .filter((slot) => slot.time);

const getLawyerIdValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return String(value);
};

export default function DateTimeSlotPicker({ 
  lawyerId, 
  onSelect, 
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange 
}) {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate next 30 days for date selection
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    setAvailableDates(dates);
    setLoading(false);
  }, []);

  // Fetch available slots when date is selected
  useEffect(() => {
    const normalizedLawyerId = getLawyerIdValue(lawyerId);
    if (!selectedDate || !normalizedLawyerId) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/availability/${normalizedLawyerId}/${formatLocalDate(selectedDate)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const responseData = response.data;
        const availabilityRecord = Array.isArray(responseData)
          ? responseData[0]
          : responseData;

        const slots = normalizeAvailabilitySlots(availabilityRecord?.slots || []);

        setSelectedDateSlots(
          slots.filter((slot) => slot.isBooked !== true),
        );
      } catch (err) {
        console.error("Failed to fetch slots:", err);
        setError("Failed to load available time slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, lawyerId]);

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isDateToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  const formatDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDayNumber = (date) => {
    return date.getDate();
  };

  // Time slot helpers
  const isTimeSelected = (time) => {
    return selectedTime === time;
  };

  const handleTimeSelect = (time) => {
    if (onTimeChange) {
      onTimeChange(time);
    }
    if (onSelect) {
      onSelect({ date: selectedDate, time });
    }
  };

  const handleDateSelect = (date) => {
    if (onDateChange) {
      onDateChange(date);
    }
    if (onTimeChange) {
      onTimeChange(null);
    }
  };

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  });

  const days = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-500">Loading availability...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg text-gray-800">Select Date & Time</h3>
      </div>

      {/* Date Selection - Calendar View */}
      <div className="mb-1">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h4 className="font-medium text-gray-800">{monthYear}</h4>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => (
            <div key={index} className="aspect-square">
              {date && (
                <button
                  onClick={() => !isDateDisabled(date) && handleDateSelect(date)}
                  disabled={isDateDisabled(date)}
                  className={`w-full h-full flex flex-col items-center justify-center rounded-lg transition-all ${
                    isDateSelected(date)
                      ? "bg-blue-600 text-white shadow-md"
                      : isDateToday(date)
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : isDateDisabled(date)
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xs font-medium">{formatDayName(date)}</span>
                  <span className="text-lg font-semibold">{formatDayNumber(date)}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-800">
              Available Times for {formatDate(selectedDate)}
            </h4>
          </div>

          {error ? (
            <div className="text-center py-4">
              {/* <p className="text-sm text-red-500 mb-2">{error}</p> */}
              <button 
                className="text-sm text-blue-600 hover:underline"
              >
                Slots Not Available for this date.
              </button>
            </div>
          ) : selectedDateSlots.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No available time slots for this date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {selectedDateSlots.map((slot, index) => {
                const time = slot.time || `slot-${index}`;
                return (
                  <button
                    key={`${formatLocalDate(selectedDate)}-${time}-${index}`}
                    onClick={() => handleTimeSelect(time)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      isTimeSelected(time)
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Selected Appointment</p>
              <p className="font-semibold text-gray-800">
                {formatDate(selectedDate)}
              </p>
              <p className="text-sm text-blue-600">{selectedTime}</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

