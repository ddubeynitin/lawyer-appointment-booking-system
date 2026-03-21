const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAllLawyerAppointments,
  getAllUserAppointments
} = require("../controllers/appointment.controller");

// appointment.routes.js
router.post("/", createAppointment);
router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.put("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);
router.get("/lawyer/:id", getAllLawyerAppointments);
router.get("/user/:id", getAllUserAppointments);
module.exports = router;