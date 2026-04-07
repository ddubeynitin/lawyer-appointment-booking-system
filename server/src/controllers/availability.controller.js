const Availability = require("../models/availability.model");

const TIME_SLOT_REGEX = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
const MAX_BULK_RANGE_DAYS = 90;

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

const parseDateInput = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDayBounds = (value) => {
  const start = parseDateInput(value);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const getDateKeysInRange = (startValue, endValue) => {
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);

  if (!start || !end || start.getTime() > end.getTime()) {
    return [];
  }

  const keys = [];
  const cursor = new Date(start);

  while (cursor.getTime() <= end.getTime()) {
    keys.push(cursor.toISOString().split("T")[0]);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
};

const sortSlots = (slots = []) =>
  slots.sort((a, b) => {
    const timeA = normalizeTimeSlot(a.time);
    const timeB = normalizeTimeSlot(b.time);

    const toMinutes = (time) => {
      const match = String(time || "").trim().match(TIME_SLOT_REGEX);
      if (!match) return Number.POSITIVE_INFINITY;

      let hours = Number(match[1]) % 12;
      const minutes = Number(match[2]);
      if (match[3].toUpperCase() === "PM") hours += 12;

      return hours * 60 + minutes;
    };

    return toMinutes(timeA) - toMinutes(timeB);
  });

const mergeSlotsForDay = (existingSlots = [], templateSlots = []) => {
  const slotMap = new Map();

  for (const slot of templateSlots) {
    const time = normalizeTimeSlot(slot.time);
    if (!time) continue;
    slotMap.set(time, {
      time,
      isBooked: Boolean(slot.isBooked),
    });
  }

  for (const slot of existingSlots) {
    const time = normalizeTimeSlot(slot.time);
    if (!time) continue;
    const current = slotMap.get(time);
    slotMap.set(time, {
      time,
      isBooked: Boolean(current?.isBooked || slot.isBooked),
    });
  }

  return sortSlots(Array.from(slotMap.values()));
};

// Create or update availability
const createAvailability = async (req, res) => {
  try {
    const { lawyerId, date, slots } = req.body;
    const bounds = getDayBounds(date);

    if (!lawyerId || !bounds) {
      return res.status(400).json({ error: "lawyerId and date are required" });
    }

    const normalizedSlots = Array.isArray(slots)
      ? sortSlots(
          slots
            .map((slot) => ({
              time: normalizeTimeSlot(typeof slot === "string" ? slot : slot?.time || slot?.startTime),
              isBooked: Boolean(slot?.isBooked),
            }))
            .filter((slot) => slot.time),
        )
      : [];

    if (normalizedSlots.length === 0) {
      return res.status(400).json({ error: "At least one valid time slot is required" });
    }

    let availability = await Availability.findOne({
      lawyerId,
      date: { $gte: bounds.start, $lt: bounds.end },
    });

    if (!availability) {
      availability = new Availability({ lawyerId, date: bounds.start, slots: normalizedSlots });
    } else {
      availability.date = bounds.start;
      availability.slots = mergeSlotsForDay(availability.slots, normalizedSlots);
    }
    await availability.save();
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get availability by lawyer and date
const getAvailabilityByLawyerAndDate = async (req, res) => {
  try {
    const { lawyerId, date } = req.params;
    const bounds = getDayBounds(date);
    if (!lawyerId || !bounds) {
      return res.status(400).json({ message: "lawyerId and date are required" });
    }

    const availability = await Availability.findOne({
      lawyerId,
      date: { $gte: bounds.start, $lt: bounds.end },
    });
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all availability for a specific lawyer
const getAvailabilityByLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const availabilities = await Availability.find({ lawyerId });
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update booked slot
const updateBookedSlot = async (req, res) => {
  try {
    const { lawyerId, date, slotIndex, isBooked = true } = req.body;
    const bounds = getDayBounds(date);
    if (!lawyerId || !bounds) {
      return res.status(400).json({ message: "lawyerId and date are required" });
    }

    const availability = await Availability.findOne({
      lawyerId,
      date: { $gte: bounds.start, $lt: bounds.end },
    });
    
    if (!availability || slotIndex >= availability.slots.length || slotIndex < 0) {
      return res.status(404).json({ message: "Slot not available" });
    }

    availability.slots[slotIndex].isBooked = Boolean(isBooked);
    
    await availability.save();
    
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBulkAvailability = async (req, res) => {
  try {
    const { lawyerId, startDate, endDate, slots } = req.body;
    const dateKeys = getDateKeysInRange(startDate, endDate);

    if (!lawyerId || !startDate || !endDate) {
      return res.status(400).json({ error: "lawyerId, startDate, and endDate are required" });
    }

    if (dateKeys.length === 0) {
      return res.status(400).json({ error: "Please choose a valid date range" });
    }

    if (dateKeys.length > MAX_BULK_RANGE_DAYS) {
      return res.status(400).json({
        error: `Bulk scheduling is limited to ${MAX_BULK_RANGE_DAYS} days at a time`,
      });
    }

    const normalizedSlots = Array.isArray(slots)
      ? sortSlots(
          slots
            .map((slot) => ({
              time: normalizeTimeSlot(typeof slot === "string" ? slot : slot?.time || slot?.startTime),
              isBooked: Boolean(slot?.isBooked),
            }))
            .filter((slot) => slot.time),
        )
      : [];

    if (normalizedSlots.length === 0) {
      return res.status(400).json({ error: "At least one valid time slot is required" });
    }

    const results = [];

    for (const dateKey of dateKeys) {
      const bounds = getDayBounds(dateKey);
      const existingAvailability = await Availability.findOne({
        lawyerId,
        date: { $gte: bounds.start, $lt: bounds.end },
      });

      const nextSlots = existingAvailability
        ? mergeSlotsForDay(existingAvailability.slots, normalizedSlots)
        : normalizedSlots.map((slot) => ({ ...slot }));

      const availability = existingAvailability || new Availability({ lawyerId, date: bounds.start });
      availability.date = bounds.start;
      availability.slots = nextSlots;
      await availability.save();
      results.push(availability);
    }

    res.status(201).json({
      message: "Bulk availability saved successfully",
      createdCount: results.length,
      availabilities: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete availability
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedAvailability = await Availability.findByIdAndDelete(id);
    
    if (!deletedAvailability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    res.json(deletedAvailability);
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

module.exports = { createAvailability, createBulkAvailability, getAvailabilityByLawyerAndDate, getAvailabilityByLawyer, updateBookedSlot, deleteAvailability };
