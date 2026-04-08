const Appointment = require("../models/appointment.model");
const Availability = require("../models/availability.model");
const User = require("../models/user.model");
const Lawyer = require("../models/lawyer.model");
const cloudinary = require("../config/cloudinary");
const {
  createAppointmentNotifications,
} = require("../services/notification.service");
const {
  sendAppointmentProofEmail,
  sendAppointmentRejectionEmail,
} = require("../services/email.service");

const TIME_SLOT_REGEX = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
const RESCHEDULE_CUTOFF_HOURS = 3;
const JITSI_BASE_URL = "https://meet.jit.si";
const MEETING_PROVIDER = "jitsi";

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

const getDateKey = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const syncAvailabilitySlotStatus = async ({ lawyerId, date, timeSlot, isBooked }) => {
  const dateKey = getDateKey(date);
  const normalizedTime = normalizeTimeSlot(timeSlot);

  if (!lawyerId || !dateKey || !normalizedTime) {
    return null;
  }

  const availabilityDate = new Date(`${dateKey}T00:00:00.000Z`);
  let availability = await Availability.findOne({ lawyerId, date: availabilityDate });

  if (!availability) {
    availability = new Availability({
      lawyerId,
      date: availabilityDate,
      slots: [{ time: normalizedTime, isBooked }],
    });
  } else {
    const slotIndex = availability.slots.findIndex(
      (slot) => normalizeTimeSlot(slot.time) === normalizedTime,
    );

    if (slotIndex >= 0) {
      availability.slots[slotIndex].time = normalizedTime;
      availability.slots[slotIndex].isBooked = isBooked;
    } else {
      availability.slots.push({ time: normalizedTime, isBooked });
    }
  }

  await availability.save();
  return availability;
};

const getAppointmentDateTime = (appointmentDate, timeSlot) => {
  if (!appointmentDate || !timeSlot) {
    return null;
  }

  const [time, meridiem] = timeSlot.split(" ");
  const [rawHours, rawMinutes] = time.split(":").map(Number);

  if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) {
    return null;
  }

  const appointmentDateTime = new Date(appointmentDate);

  if (Number.isNaN(appointmentDateTime.getTime())) {
    return null;
  }

  let hours = rawHours % 12;
  if (meridiem === "PM") {
    hours += 12;
  }

  appointmentDateTime.setHours(hours, rawMinutes, 0, 0);
  return appointmentDateTime;
};

const toAppointmentDate = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const normalized =
    typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
      ? new Date(`${dateValue}T00:00:00.000Z`)
      : new Date(dateValue);

  return Number.isNaN(normalized.getTime()) ? null : normalized;
};

const buildJitsiRoomName = (appointment) => {
  const appointmentId = String(appointment?._id || "").trim();
  if (!appointmentId) {
    return "";
  }

  return `justifai-${appointmentId}`;
};

const buildJitsiMeetingLink = (roomName) => {
  if (!roomName) {
    return "";
  }

  return `${JITSI_BASE_URL}/${encodeURIComponent(roomName)}`;
};

const ensureAppointmentMeetingDetails = async (appointment) => {
  if (
    !appointment ||
    appointment.appointmentMode !== "Online" ||
    appointment.status !== "Approved"
  ) {
    return appointment;
  }

  const meetingRoomName = appointment.meetingRoomName || buildJitsiRoomName(appointment);
  if (!meetingRoomName) {
    return appointment;
  }

  const meetingLink = appointment.meetingLink || buildJitsiMeetingLink(meetingRoomName);
  appointment.meetingProvider = MEETING_PROVIDER;
  appointment.meetingRoomName = meetingRoomName;
  appointment.meetingLink = meetingLink;
  appointment.meetingGeneratedAt = appointment.meetingGeneratedAt || new Date();

  await appointment.save();
  return appointment;
};

const ensureMeetingDetailsForAppointments = async (appointments = []) => {
  return Promise.all(
    appointments.map((appointment) => ensureAppointmentMeetingDetails(appointment)),
  );
};

const isWithinRescheduleWindow = (appointmentDateTime, now = new Date()) => {
  if (!appointmentDateTime) {
    return false;
  }

  const millisecondsUntilAppointment = appointmentDateTime.getTime() - now.getTime();
  return millisecondsUntilAppointment >= RESCHEDULE_CUTOFF_HOURS * 60 * 60 * 1000;
};

const isFutureSlot = (dateValue, timeSlot, now = new Date()) => {
  const appointmentDateTime = getAppointmentDateTime(dateValue, timeSlot);
  return appointmentDateTime && appointmentDateTime.getTime() > now.getTime();
};

const findConflictingAppointment = async ({ lawyerId, date, timeSlot, ignoreAppointmentId }) => {
  return Appointment.findOne({
    lawyerId,
    date,
    timeSlot,
    _id: { $ne: ignoreAppointmentId },
    status: { $nin: ["Rejected"] },
  }).lean();
};

const isSlotAvailableForLawyer = async ({ lawyerId, date, timeSlot, ignoreAppointmentId }) => {
  const normalizedDate = toAppointmentDate(date);
  if (!lawyerId || !normalizedDate || !timeSlot) {
    return false;
  }

  const availability = await Availability.findOne({ lawyerId, date: normalizedDate }).lean();
  if (availability) {
    const slot = (availability.slots || []).find(
      (slotEntry) => normalizeTimeSlot(slotEntry.time) === normalizeTimeSlot(timeSlot),
    );

    if (!slot || slot.isBooked) {
      return false;
    }
  }

  const conflict = await findConflictingAppointment({
    lawyerId,
    date: normalizedDate,
    timeSlot,
    ignoreAppointmentId,
  });

  return !conflict;
};

const syncCompletedAppointments = async (baseQuery = {}) => {
  const appointmentsToCheck = await Appointment.find({
    ...baseQuery,
    status: { $nin: ["Rejected", "Completed"] },
  }).select("_id date timeSlot status");

  const now = new Date();
  const completedAppointmentIds = appointmentsToCheck
    .filter((appointment) => {
      const appointmentDateTime = getAppointmentDateTime(
        appointment.date,
        appointment.timeSlot,
      );

      return appointmentDateTime && appointmentDateTime < now;
    })
    .map((appointment) => appointment._id);

  if (completedAppointmentIds.length > 0) {
    await Appointment.updateMany(
      { _id: { $in: completedAppointmentIds } },
      { $set: { status: "Completed" } },
    );
  }
};

const buildLawyerAppointmentQuery = (lawyerId, queryParams = {}) => {
  const query = { lawyerId };
  const status = queryParams.status?.trim();
  const date = queryParams.date?.trim();
  const rescheduleStatus = queryParams.rescheduleStatus?.trim();

  if (status) {
    query.status = status;
  }

  if (rescheduleStatus) {
    query.rescheduleStatus = rescheduleStatus;
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
    const appointmentMode =
      ["Online", "Office"].includes(String(req.body.appointmentMode))
        ? String(req.body.appointmentMode)
        : "Online";
    const appointmentDate = toAppointmentDate(req.body.date);
    const timeSlot = normalizeTimeSlot(req.body.timeSlot);

    if (!appointmentDate) {
      return res.status(400).json({ error: "Valid appointment date is required" });
    }

    if (!timeSlot) {
      return res.status(400).json({ error: "Valid time slot is required" });
    }

    const appointmentPayload = {
      ...req.body,
      userId: req.user?.id || req.body.userId,
      date: appointmentDate,
      timeSlot,
      appointmentMode,
      rescheduleStatus: null,
      rescheduleRequestedBy: null,
      rescheduleRequestedAt: null,
      rescheduleRequestedDate: null,
      rescheduleRequestedTimeSlot: null,
      rescheduleReason: null,
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "appointments",
      });

      appointmentPayload.caseEvidence = {
        url: result.secure_url,
        public_id: req.file.filename,
        originalName: req.file.originalname,
      };
    }

    const appointment = await Appointment.create(appointmentPayload);
    const [bookedUser, bookedLawyer] = await Promise.all([
      req.user?.id
        ? User.findById(req.user.id).select("name email").lean()
        : Promise.resolve(null),
      Lawyer.findById(appointment.lawyerId).select("name location").lean(),
    ]);

    try {
      await syncAvailabilitySlotStatus({
        lawyerId: appointment.lawyerId,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        isBooked: true,
      });

      await createAppointmentNotifications({
        appointment,
        type: "appointment_created",
        userTitle: "Appointment request received",
        userDescription: `Your consultation with ${appointment.lawyerName} is waiting for review.`,
        userMessage: `Your appointment request with ${appointment.lawyerName} for ${appointment.timeSlot} on ${new Date(appointment.date).toLocaleDateString()} has been received.`,
        lawyerTitle: "New appointment request",
        lawyerDescription: `${appointment.caseCategory} consultation from ${appointment.userId?.name || "a client"}.`,
        lawyerMessage: `New appointment request from ${appointment.userId?.name || "a client"} for ${appointment.timeSlot} on ${new Date(appointment.date).toLocaleDateString()}.`,
      });

      if (bookedUser?.email) {
        try {
          await sendAppointmentProofEmail({
            email: bookedUser.email,
            name: bookedUser.name,
            lawyerName: appointment.lawyerName,
            lawyerSpecialization: appointment.lawyerSpecialization,
            appointmentMode: appointment.appointmentMode,
            date: appointment.date,
            timeSlot: appointment.timeSlot,
            caseCategory: appointment.caseCategory,
            feeCharged: appointment.feeCharged,
            lawyerLocation: bookedLawyer?.location,
          });
        } catch (emailError) {
          console.error("Failed to send appointment proof email:", emailError);
        }
      }
    } catch (syncError) {
      await Appointment.findByIdAndDelete(appointment._id);
      throw syncError;
    }

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    await syncCompletedAppointments();
    const appointments = await Appointment.find()
      .populate("userId", "name email phone gender city state profilePicture createdAt")
      .populate("lawyerId", "name email phone profileImage location");
    const enrichedAppointments = await ensureMeetingDetailsForAppointments(appointments);
    res.json(enrichedAppointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    await syncCompletedAppointments({ lawyerId: req.params.id });
    const baseQuery = { lawyerId: req.params.id };
    const status = req.query.status?.trim();
    const query = buildLawyerAppointmentQuery(req.params.id, req.query);

    const [appointments, totalAppointments, pendingAppointments] = await Promise.all([
      Appointment.find(query)
        .populate("userId", "name email phone gender city state profilePicture createdAt")
        .populate("lawyerId", "name email phone profileImage location")
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(baseQuery),
      Appointment.countDocuments({ ...baseQuery, status: "Pending" }),
    ]);

    const enrichedAppointments = await ensureMeetingDetailsForAppointments(appointments);

    if (enrichedAppointments.length === 0) {
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
      filteredAppointments: enrichedAppointments.length,
      appointments: enrichedAppointments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const existingAppointment = await Appointment.findById(req.params.id);
    if (!existingAppointment) return res.status(404).json({ error: "Appointment not found" });

    if (
      req.body?.status === "Rejected" &&
      req.user?.role === "user" &&
      existingAppointment.status !== "Pending"
    ) {
      return res.status(400).json({
        error: "You can cancel an appointment only while it is pending",
      });
    }

    const previousStatus = existingAppointment.status;
    const previousRejectionReason = existingAppointment.rejectionReason || null;
    const rejectionReason =
      req.body?.status === "Rejected"
        ? String(req.body?.rejectionReason || "").trim()
        : null;

    if (req.body?.status === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        error: "A rejection reason is required",
      });
    }

    let appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    try {
      if (req.body?.status === "Rejected") {
        appointment.rejectionReason = rejectionReason;
        await appointment.save();

        await syncAvailabilitySlotStatus({
          lawyerId: existingAppointment.lawyerId,
          date: existingAppointment.date,
          timeSlot: existingAppointment.timeSlot,
          isBooked: false,
        });
      } else if (req.body?.status === "Approved" || req.body?.status === "Pending") {
        await syncAvailabilitySlotStatus({
          lawyerId: existingAppointment.lawyerId,
          date: existingAppointment.date,
          timeSlot: existingAppointment.timeSlot,
          isBooked: true,
        });
      }

      if (req.body?.status === "Approved") {
        appointment = await ensureAppointmentMeetingDetails(appointment);
      }

      if (req.body?.status && req.body.status !== previousStatus) {
        await createAppointmentNotifications({
          appointment,
          type: `appointment_${req.body.status.toLowerCase()}`,
          userTitle:
            req.body.status === "Approved"
              ? "Appointment approved"
              : "Appointment updated",
          userDescription:
            req.body.status === "Approved"
              ? `Your appointment with ${appointment.lawyerName} is now confirmed.`
              : `Your appointment with ${appointment.lawyerName} has been updated to ${req.body.status.toLowerCase()}.`,
          userMessage:
            req.body.status === "Approved"
              ? `Your appointment with ${appointment.lawyerName} for ${appointment.timeSlot} on ${new Date(appointment.date).toLocaleDateString()} has been approved.`
              : `Your appointment with ${appointment.lawyerName} was rejected. Reason: ${rejectionReason}`,
          lawyerTitle:
            req.body.status === "Approved"
              ? "Appointment approved"
              : "Appointment updated",
          lawyerDescription:
            req.body.status === "Approved"
              ? `Appointment with ${appointment.userId?.name || "a client"} has been confirmed.`
              : `Appointment with ${appointment.userId?.name || "a client"} has been updated to ${req.body.status.toLowerCase()}.`,
          lawyerMessage:
            req.body.status === "Approved"
              ? `You approved the appointment with ${appointment.userId?.name || "a client"} for ${appointment.timeSlot} on ${new Date(appointment.date).toLocaleDateString()}.`
              : `You rejected the appointment with ${appointment.userId?.name || "a client"}.`,
        });

        if (req.body.status === "Rejected") {
          try {
            const populatedAppointment = await Appointment.findById(req.params.id)
              .populate("userId", "name email")
              .populate("lawyerId", "name");

            if (populatedAppointment?.userId?.email) {
              await sendAppointmentRejectionEmail({
                email: populatedAppointment.userId.email,
                name: populatedAppointment.userId.name,
                lawyerName: populatedAppointment.lawyerId?.name || appointment.lawyerName,
                date: populatedAppointment.date,
                timeSlot: populatedAppointment.timeSlot,
                caseCategory: populatedAppointment.caseCategory,
                rejectionReason,
              });
            }
          } catch (emailError) {
            console.error("Failed to send appointment rejection email:", emailError);
          }
        }
      }
    } catch (syncError) {
      await Appointment.findByIdAndUpdate(req.params.id, {
        status: previousStatus,
        rejectionReason: previousRejectionReason,
      });
      throw syncError;
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requestReschedule = async (req, res) => {
  try {
    const { date, timeSlot, reason } = req.body;
    const requestedDate = toAppointmentDate(date);
    const normalizedTimeSlot = normalizeTimeSlot(timeSlot);
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.status !== "Approved") {
      return res.status(400).json({
        error: "Only approved appointments can be rescheduled",
      });
    }

    if (appointment.rescheduleStatus === "Pending") {
      return res.status(409).json({
        error: "A reschedule request is already pending for this appointment",
      });
    }

    if (!isWithinRescheduleWindow(getAppointmentDateTime(appointment.date, appointment.timeSlot))) {
      return res.status(400).json({
        error: "Rescheduling is allowed only up to 3 hours before the appointment",
      });
    }

    if (!requestedDate || !normalizedTimeSlot) {
      return res.status(400).json({
        error: "New date and time slot are required",
      });
    }

    if (!isFutureSlot(requestedDate, normalizedTimeSlot)) {
      return res.status(400).json({
        error: "Please choose a future time slot",
      });
    }

    if (
      getAppointmentDateTime(appointment.date, appointment.timeSlot)?.getTime() ===
      getAppointmentDateTime(requestedDate, normalizedTimeSlot)?.getTime()
    ) {
      return res.status(400).json({
        error: "Please choose a different date or time slot",
      });
    }

    const slotAvailable = await isSlotAvailableForLawyer({
      lawyerId: appointment.lawyerId,
      date: requestedDate,
      timeSlot: normalizedTimeSlot,
      ignoreAppointmentId: appointment._id,
    });

    if (!slotAvailable) {
      return res.status(409).json({
        error: "The selected reschedule slot is no longer available",
      });
    }

    appointment.rescheduleStatus = "Pending";
    appointment.rescheduleRequestedBy = req.body.userId || appointment.userId;
    appointment.rescheduleRequestedAt = new Date();
    appointment.rescheduleRequestedDate = requestedDate;
    appointment.rescheduleRequestedTimeSlot = normalizedTimeSlot;
    appointment.rescheduleReason = String(reason || "").trim();
    await appointment.save();

    await createAppointmentNotifications({
      appointment,
      type: "appointment_reschedule_requested",
      userTitle: "Reschedule request submitted",
      userDescription: `Your reschedule request for ${appointment.lawyerName} has been sent.`,
      userMessage: `Your request to move the appointment to ${normalizedTimeSlot} on ${requestedDate.toLocaleDateString()} was sent to the lawyer.`,
      lawyerTitle: "Reschedule request received",
      lawyerDescription: `A client asked to move an approved appointment.`,
      lawyerMessage: `A reschedule request is waiting for approval for ${normalizedTimeSlot} on ${requestedDate.toLocaleDateString()}.`,
    });

    res.json({
      message: "Reschedule request submitted successfully",
      appointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const respondToRescheduleRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.rescheduleStatus !== "Pending") {
      return res.status(400).json({
        error: "There is no pending reschedule request for this appointment",
      });
    }

    const requestedDate = appointment.rescheduleRequestedDate;
    const requestedTimeSlot = appointment.rescheduleRequestedTimeSlot;

    if (!requestedDate || !requestedTimeSlot) {
      return res.status(400).json({
        error: "Requested reschedule details are missing",
      });
    }

      if (action === "Approved") {
      const slotAvailable = await isSlotAvailableForLawyer({
        lawyerId: appointment.lawyerId,
        date: requestedDate,
        timeSlot: requestedTimeSlot,
        ignoreAppointmentId: appointment._id,
      });

      if (!slotAvailable) {
        return res.status(409).json({
          error: "The requested slot is no longer available",
        });
      }

      const previousDate = appointment.date;
      const previousTimeSlot = appointment.timeSlot;

      appointment.date = requestedDate;
      appointment.timeSlot = requestedTimeSlot;
      appointment.rescheduleStatus = null;
      appointment.rescheduleRequestedBy = null;
      appointment.rescheduleRequestedAt = null;
      appointment.rescheduleRequestedDate = null;
      appointment.rescheduleRequestedTimeSlot = null;
      appointment.rescheduleReason = null;
      await appointment.save();

      await syncAvailabilitySlotStatus({
        lawyerId: appointment.lawyerId,
        date: previousDate,
        timeSlot: previousTimeSlot,
        isBooked: false,
      });

      await syncAvailabilitySlotStatus({
        lawyerId: appointment.lawyerId,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        isBooked: true,
      });

      appointment = await ensureAppointmentMeetingDetails(appointment);

      await createAppointmentNotifications({
        appointment,
        type: "appointment_rescheduled",
        userTitle: "Appointment rescheduled",
        userDescription: `Your appointment with ${appointment.lawyerName} was rescheduled.`,
        userMessage: `Your appointment now takes place on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
        lawyerTitle: "Appointment rescheduled",
        lawyerDescription: `The approved appointment was moved to a new slot.`,
        lawyerMessage: `Appointment moved from ${new Date(previousDate).toLocaleDateString()} ${previousTimeSlot} to ${new Date(appointment.date).toLocaleDateString()} ${appointment.timeSlot}.`,
      });

      return res.json({
        message: "Reschedule request approved",
        appointment,
      });
    }

    if (action === "Rejected") {
      appointment.rescheduleStatus = "Rejected";
      appointment.rescheduleRequestedBy = null;
      appointment.rescheduleRequestedAt = null;
      appointment.rescheduleRequestedDate = null;
      appointment.rescheduleRequestedTimeSlot = null;
      appointment.rescheduleReason = null;
      await appointment.save();

      await createAppointmentNotifications({
        appointment,
        type: "appointment_reschedule_rejected",
        userTitle: "Reschedule request rejected",
        userDescription: `Your lawyer could not approve the requested slot.`,
        userMessage: `The requested reschedule for ${appointment.lawyerName} was rejected.`,
        lawyerTitle: "Reschedule request rejected",
        lawyerDescription: `The pending reschedule request was rejected.`,
        lawyerMessage: `You rejected the reschedule request for this appointment.`,
      });

      return res.json({
        message: "Reschedule request rejected",
        appointment,
      });
    }

    return res.status(400).json({
      error: "Action must be Approved or Rejected",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    await syncAvailabilitySlotStatus({
      lawyerId: appointment.lawyerId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      isBooked: false,
    });

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllLawyerAppointments = async (req, res) => {
  try {
    await syncCompletedAppointments({ lawyerId: req.params.id });
    const baseQuery = { lawyerId: req.params.id };
    const query = buildLawyerAppointmentQuery(req.params.id, req.query);

    const [appointments, totalAppointments, pendingAppointments] = await Promise.all([
      Appointment.find(query)
        .populate("userId", "name email phone")
        .populate("lawyerId", "name email phone profileImage location")
        .sort({ createdAt: -1 }),
      Appointment.countDocuments(baseQuery),
      Appointment.countDocuments({ ...baseQuery, status: "Pending" }),
    ]);

    const enrichedAppointments = await ensureMeetingDetailsForAppointments(appointments);

    res.json({
      message: "Appointments retrieved successfully",
      totalAppointments,
      pendingAppointments,
      filteredAppointments: enrichedAppointments.length,
      appointments: enrichedAppointments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllUserAppointments = async (req, res) => {
  try {
    await syncCompletedAppointments({ userId: req.params.id });
    const appointments = await Appointment.find({ userId: req.params.id })
      .populate("userId", "name email phone gender city state profilePicture createdAt")
      .populate("lawyerId", "name email phone profileImage location");
    const enrichedAppointments = await ensureMeetingDetailsForAppointments(appointments);
    
    res.json({ message: "Appointments retrieved successfully", appointments: enrichedAppointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  requestReschedule,
  respondToRescheduleRequest,
  deleteAppointment,
  getAllLawyerAppointments,
  getAllUserAppointments,
};
