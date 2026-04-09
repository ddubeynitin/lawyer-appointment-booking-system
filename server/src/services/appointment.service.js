const Appointment = require("../models/appointment.model");

/**
 * Parse time slot string (e.g., "02:30 PM") to Date object for a given date
 */
const getAppointmentStartTime = (date, timeSlot) => {
  try {
    const dateObj = new Date(date);
    const timeMatch = String(timeSlot).trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    
    if (!timeMatch) return null;
    
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);
    const meridiem = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }
    
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  } catch (error) {
    console.error("Error parsing appointment time:", error);
    return null;
  }
};

/**
 * Update appointment statuses based on time:
 * - Approved → Ongoing (when current time >= appointment time)
 * - Ongoing → Completed (when current time >= appointment time + 1 hour)
 */
const updateAppointmentStatuses = async () => {
  try {
    const now = new Date();
    
    // Step 1: Update Approved appointments to Ongoing
    const approvedAppointments = await Appointment.find({
      status: "Approved"
    }).select("_id date timeSlot");
    
    for (const appointment of approvedAppointments) {
      const appointmentStartTime = getAppointmentStartTime(appointment.date, appointment.timeSlot);
      
      if (appointmentStartTime && now >= appointmentStartTime) {
        await Appointment.updateOne(
          { _id: appointment._id },
          { status: "Ongoing" }
        );
        console.log(`[Appointment Status] ID: ${appointment._id} → Ongoing`);
      }
    }
    
    // Step 2: Update Ongoing appointments to Completed (after 1 hour)
    const ongoingAppointments = await Appointment.find({
      status: "Ongoing"
    }).select("_id date timeSlot");
    
    for (const appointment of ongoingAppointments) {
      const appointmentStartTime = getAppointmentStartTime(appointment.date, appointment.timeSlot);
      
      if (appointmentStartTime) {
        const appointmentEndTime = new Date(appointmentStartTime.getTime() + 60 * 60 * 1000); // +1 hour
        
        if (now >= appointmentEndTime) {
          await Appointment.updateOne(
            { _id: appointment._id },
            { status: "Completed" }
          );
          console.log(`[Appointment Status] ID: ${appointment._id} → Completed`);
        }
      }
    }
    
    console.log(`[Appointment Status Job] Ran at ${now.toISOString()}`);
  } catch (error) {
    console.error("Error updating appointment statuses:", error);
  }
};

/**
 * Start the appointment status update scheduler
 * Runs every 5 minutes
 */
const startAppointmentStatusScheduler = () => {
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  
  console.log("[Appointment Status Scheduler] Starting...");
  
  // Run immediately on startup
  updateAppointmentStatuses();
  
  // Run periodically
  setInterval(updateAppointmentStatuses, INTERVAL_MS);
  
  console.log("[Appointment Status Scheduler] Running every 5 minutes");
};

module.exports = {
  updateAppointmentStatuses,
  startAppointmentStatusScheduler,
  getAppointmentStartTime,
};
