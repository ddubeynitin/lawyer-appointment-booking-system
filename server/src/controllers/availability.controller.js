const Availability = require("../models/availability.model");

// Create or update availability
const createAvailability = async (req, res) => {
  try {
    const { lawyerId, date, slots } = req.body;
    let availability = await Availability.findOne({ lawyerId, date });
    if (!availability) {
      availability = new Availability({ lawyerId, date, slots });
    } else {
      availability.slots = slots;
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
    const availability = await Availability.findOne({ lawyerId, date });
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
    const { lawyerId, date, slotIndex } = req.body;
    const availability = await Availability.findOne({ lawyerId, date });
    
    if (!availability || slotIndex >= availability.slots.length || slotIndex < 0) {
      return res.status(404).json({ message: "Slot not available" });
    }

    if (availability.slots[slotIndex].booked) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    availability.slots[slotIndex].booked = true;
    
    await availability.save();
    
    res.json(availability);
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

module.exports = { createAvailability, getAvailabilityByLawyerAndDate, getAvailabilityByLawyer, updateBookedSlot, deleteAvailability };