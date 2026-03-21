const Appointment = require("../models/appointment.model");

const buildLawyerAppointmentQuery = (lawyerId, queryParams = {}) => {
  const query = { lawyerId };
  const status = queryParams.status?.trim();
  const date = queryParams.date?.trim();

  if (status) {
    query.status = status;
  }

  if (date) {
    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    if (!Number.isNaN(selectedDate.getTime())) {
      const nextDate = new Date(selectedDate);
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);

      query.date = {
        $gte: selectedDate,
        $lt: nextDate,
      };
    }
  }

  return query;
};

const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const baseQuery = { lawyerId: req.params.id };
    const status = req.query.status?.trim();
    const query = buildLawyerAppointmentQuery(req.params.id, req.query);

    const [appointments, totalAppointments, pendingAppointments] = await Promise.all([
      Appointment.find(query)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(baseQuery),
      Appointment.countDocuments({ ...baseQuery, status: "Pending" }),
    ]);

    if (appointments.length === 0) {
      return res.json({
        message: status
          ? `No ${status.toLowerCase()} appointments found for this lawyer`
          : "No appointments found for this lawyer",
        totalAppointments,
        pendingAppointments,
        filteredAppointments: 0,
        appointments: [],
      });
    }

    res.json({
      message: "Appointments retrieved successfully",
      totalAppointments,
      pendingAppointments,
      filteredAppointments: appointments.length,
      appointments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllLawyerAppointments = async (req, res) => {
  try {
    const baseQuery = { lawyerId: req.params.id };
    const query = buildLawyerAppointmentQuery(req.params.id, req.query);

    const [appointments, totalAppointments, pendingAppointments] = await Promise.all([
      Appointment.find(query)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(baseQuery),
      Appointment.countDocuments({ ...baseQuery, status: "Pending" }),
    ]);

    res.json({
      message: "Appointments retrieved successfully",
      totalAppointments,
      pendingAppointments,
      filteredAppointments: appointments.length,
      appointments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.id });
    
    res.json({ message: "Appointments retrieved successfully", appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createAppointment, getAllAppointments, getAppointmentById, updateAppointment, deleteAppointment, getAllLawyerAppointments, getAllUserAppointments };
