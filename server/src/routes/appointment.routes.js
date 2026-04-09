const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  requestReschedule,
  respondToRescheduleRequest,
  deleteAppointment,
  getAllLawyerAppointments,
  getAllUserAppointments,
  triggerStatusUpdate,
} = require("../controllers/appointment.controller");

// appointment.routes.js
router.post("/", authMiddleware, upload.single("caseEvidence"), createAppointment);
router.get("/", getAllAppointments);
router.get("/admin/trigger-status-update", triggerStatusUpdate);
router.get("/lawyer/:id", getAllLawyerAppointments);
router.get("/lawyer/:id/reschedule-requests", getAllLawyerAppointments);
router.get("/user/:id", getAllUserAppointments);
router.get("/:id", getAppointmentById);
router.put("/:id/reschedule-request", requestReschedule);
router.put("/:id/reschedule-response", respondToRescheduleRequest);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
module.exports = router;
