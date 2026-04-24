const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  listPayments,
  listRefunds,
} = require("../controllers/payment.controller");

router.get("/", listPayments);
router.get("/refunds", listRefunds);
router.post("/create-order", authMiddleware, createRazorpayOrder);
router.post("/verify", authMiddleware, verifyRazorpayPayment);

module.exports = router;
