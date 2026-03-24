const https = require("https");
const crypto = require("crypto");
const Appointment = require("../models/appointment.model");
const Payment = require("../models/payment.model");
const env = require("../config/env");

const ensureRazorpayConfig = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    const error = new Error("Razorpay keys are not configured on the server");
    error.statusCode = 500;
    throw error;
  }
};

const createBasicAuthHeader = () => {
  const encodedCredentials = Buffer.from(
    `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
  ).toString("base64");

  return `Basic ${encodedCredentials}`;
};

const makeRazorpayRequest = (path, method, payload) =>
  new Promise((resolve, reject) => {
    const requestBody = payload ? JSON.stringify(payload) : null;

    const request = https.request(
      {
        hostname: "api.razorpay.com",
        path,
        method,
        headers: {
          Authorization: createBasicAuthHeader(),
          "Content-Type": "application/json",
          ...(requestBody ? { "Content-Length": Buffer.byteLength(requestBody) } : {}),
        },
      },
      (response) => {
        let responseData = "";

        response.on("data", (chunk) => {
          responseData += chunk;
        });

        response.on("end", () => {
          const parsedBody = responseData ? JSON.parse(responseData) : {};

          if (response.statusCode >= 200 && response.statusCode < 300) {
            return resolve(parsedBody);
          }

          const error = new Error(
            parsedBody.error?.description || "Razorpay request failed"
          );
          error.statusCode = response.statusCode || 500;
          error.details = parsedBody;
          return reject(error);
        });
      }
    );

    request.on("error", reject);

    if (requestBody) {
      request.write(requestBody);
    }

    request.end();
  });

const getAuthorizedAppointment = async (appointmentId, user) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    const error = new Error("Appointment not found");
    error.statusCode = 404;
    throw error;
  }

  const isAppointmentOwner = appointment.userId.toString() === user.id;
  const isPrivilegedRole = ["admin", "lawyer"].includes(user.role);

  if (!isAppointmentOwner && !isPrivilegedRole) {
    const error = new Error("You are not allowed to access this appointment");
    error.statusCode = 403;
    throw error;
  }

  return appointment;
};

const detectPaymentMode = (method) => {
  if (!method) {
    return "Unknown";
  }

  const normalizedMethod = method.toLowerCase();

  if (normalizedMethod === "upi") return "UPI";
  if (normalizedMethod === "card") return "Card";
  if (normalizedMethod === "netbanking") return "NetBanking";
  if (normalizedMethod === "wallet") return "Wallet";
  if (normalizedMethod === "emi") return "EMI";

  return "Unknown";
};

const createRazorpayOrder = async (req, res) => {
  try {
    ensureRazorpayConfig();

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: "appointmentId is required" });
    }

    const appointment = await getAuthorizedAppointment(appointmentId, req.user);
    const existingPayment = await Payment.findOne({ appointmentId });

    if (existingPayment?.paymentStatus === "Success") {
      return res.status(400).json({ error: "Payment has already been completed for this appointment" });
    }

    const amountInPaise = Math.round(Number(appointment.feeCharged) * 100);

    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ error: "Appointment fee is invalid for payment" });
    }

    const razorpayOrder = await makeRazorpayRequest("/v1/orders", "POST", {
      amount: amountInPaise,
      currency: "INR",
      receipt: `appt_${appointment._id.toString().slice(-20)}`,
      notes: {
        appointmentId: appointment._id.toString(),
        userId: appointment.userId.toString(),
        lawyerId: appointment.lawyerId.toString(),
      },
    });

    await Payment.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        razorpayOrderId: razorpayOrder.id,
        amount: appointment.feeCharged,
        currency: razorpayOrder.currency || "INR",
        paymentStatus: "Created",
        paymentMode: "Unknown",
        transactionId: null,
        razorpayPaymentId: null,
        razorpaySignature: null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({
      message: "Razorpay order created successfully",
      keyId: env.RAZORPAY_KEY_ID,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
      appointment: {
        id: appointment._id,
        feeCharged: appointment.feeCharged,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "Unable to create Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    ensureRazorpayConfig();

    const {
      appointmentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      paymentMethod,
    } = req.body;

    if (!appointmentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error: "appointmentId, razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    await getAuthorizedAppointment(appointmentId, req.user);

    const payment = await Payment.findOne({ appointmentId });

    if (!payment) {
      return res.status(404).json({ error: "No Razorpay order found for this appointment" });
    }

    if (payment.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ error: "Razorpay order does not match this appointment" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${payment.razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      payment.paymentStatus = "Failed";
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      payment.transactionId = razorpayPaymentId;
      payment.paymentMode = detectPaymentMode(paymentMethod);
      await payment.save();

      return res.status(400).json({ error: "Invalid Razorpay payment signature" });
    }

    payment.paymentStatus = "Success";
    payment.transactionId = razorpayPaymentId;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paymentMode = detectPaymentMode(paymentMethod);
    await payment.save();

    return res.json({
      message: "Payment verified successfully",
      payment: {
        appointmentId: payment.appointmentId,
        transactionId: payment.transactionId,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        paymentStatus: payment.paymentStatus,
        paymentMode: payment.paymentMode,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "Unable to verify Razorpay payment",
    });
  }
};

const getPaymentByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    await getAuthorizedAppointment(appointmentId, req.user);

    const payment = await Payment.findOne({ appointmentId }).lean();

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found for this appointment" });
    }

    return res.json({
      message: "Payment retrieved successfully",
      payment,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      error: error.message || "Unable to fetch payment details",
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentByAppointmentId,
};
