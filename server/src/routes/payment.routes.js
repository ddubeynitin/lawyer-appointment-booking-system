const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentByAppointmentId,
} = require("../controllers/payment.controller");

router.post("/create-order", authMiddleware, createRazorpayOrder);
router.post("/verify", authMiddleware, verifyRazorpayPayment);
router.get("/appointment/:appointmentId", authMiddleware, getPaymentByAppointmentId);

module.exports = router;
