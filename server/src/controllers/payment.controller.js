const crypto = require("crypto");
const https = require("https");
const Payment = require("../models/payment.model");
const Appointment = require("../models/appointment.model");
const env = require("../config/env");
const {
  sendAppointmentPaymentSuccessEmail,
  sendAppointmentPaymentSuccessEmailToLawyer,
} = require("../services/email.service");

const RAZORPAY_API_HOST = "api.razorpay.com";
const RAZORPAY_API_BASE_PATH = "/v1";
const CURRENCY = "INR";

const hasRazorpayConfig = () => Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

const readJsonResponse = (res) => {
  return new Promise((resolve) => {
    let responseBody = "";

    res.on("data", (chunk) => {
      responseBody += chunk;
    });

    res.on("end", () => {
      if (!responseBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(responseBody));
      } catch (error) {
        resolve({ raw: responseBody });
      }
    });
  });
};

const requestRazorpay = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const request = https.request(
      {
        hostname: RAZORPAY_API_HOST,
        path: `${RAZORPAY_API_BASE_PATH}${path}`,
        method,
        auth: `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      async (response) => {
        const parsedResponse = await readJsonResponse(response);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(parsedResponse);
          return;
        }

        const errorMessage =
          parsedResponse?.error?.description ||
          parsedResponse?.error?.reason ||
          parsedResponse?.error?.message ||
          parsedResponse?.message ||
          `Razorpay request failed with status ${response.statusCode}`;

        reject(new Error(errorMessage));
      },
    );

    request.on("error", reject);

    if (payload) {
      request.write(payload);
    }

    request.end();
  });
};

const normalizeAmount = (amount) => {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return null;
  }

  return Math.round(numericAmount * 100);
};

const createRazorpayOrder = async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({
        error: "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ error: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(appointmentId).populate("userId", "name email");
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const requesterId = String(req.user?.id || "");
    const appointmentUserId = String(appointment.userId?._id || appointment.userId || "");
    const isOwner = requesterId && appointmentUserId && requesterId === appointmentUserId;

    if (!isOwner) {
      return res.status(403).json({ error: "You can only pay for your own appointments" });
    }

    if (appointment.status !== "Approved") {
      return res.status(400).json({ error: "Payment is available only for approved appointments" });
    }

    const existingPayment = await Payment.findOne({ appointmentId: appointment._id }).lean();
    if (existingPayment?.paymentStatus === "Success" || appointment.paymentStatus === "Success") {
      return res.status(409).json({ error: "This appointment is already paid" });
    }

    const amount = normalizeAmount(appointment.feeCharged);
    if (!amount) {
      return res.status(400).json({ error: "Invalid appointment amount" });
    }

    const order = await requestRazorpay("POST", "/orders", {
      amount,
      currency: CURRENCY,
      receipt: `appt_${appointment._id}`,
      payment_capture: 1,
      notes: {
        appointmentId: String(appointment._id),
        userId: String(appointment.userId?._id || appointment.userId || ""),
        lawyerId: String(appointment.lawyerId || ""),
      },
    });

    return res.json({
      keyId: env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      appointment: {
        id: String(appointment._id),
        lawyerName: appointment.lawyerName,
        feeCharged: appointment.feeCharged,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to create Razorpay order",
    });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    if (!hasRazorpayConfig()) {
      return res.status(500).json({
        error: "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    const {
      appointmentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body;

    if (!appointmentId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: "Missing payment verification details" });
    }

    const appointment = await Appointment.findById(appointmentId).populate("userId", "name email");
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const requesterId = String(req.user?.id || "");
    const appointmentUserId = String(appointment.userId?._id || appointment.userId || "");
    const isOwner = requesterId && appointmentUserId && requesterId === appointmentUserId;

    if (!isOwner) {
      return res.status(403).json({ error: "You can only verify your own payment" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await Payment.findOneAndUpdate(
        { appointmentId: appointment._id },
        {
          appointmentId: appointment._id,
          transactionId: razorpayPaymentId,
          razorpayOrderId: razorpayOrderId,
          amount: appointment.feeCharged,
          paymentStatus: "Failed",
          paymentMode: "Razorpay",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return res.status(400).json({ error: "Payment signature verification failed" });
    }

    const existingSuccessPayment = await Payment.findOne({
      appointmentId: appointment._id,
      paymentStatus: "Success",
    }).lean();

    const payment = await Payment.findOneAndUpdate(
      { appointmentId: appointment._id },
      {
        appointmentId: appointment._id,
        transactionId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId,
        amount: appointment.feeCharged,
        paymentStatus: "Success",
        paymentMode: "Razorpay",
        confirmationEmailSent: existingSuccessPayment?.confirmationEmailSent || false,
        lawyerConfirmationEmailSent:
          existingSuccessPayment?.lawyerConfirmationEmailSent || false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    appointment.paymentStatus = "Success";
    appointment.paymentMode = "Razorpay";
    appointment.paymentTransactionId = razorpayPaymentId;
    appointment.paymentOrderId = razorpayOrderId;
    appointment.paymentAmount = appointment.feeCharged;
    await appointment.save();

    if (!payment.confirmationEmailSent) {
      try {
        const appointmentForEmail = await Appointment.findById(appointment._id)
          .populate("userId", "name email")
          .populate("lawyerId", "name email location");

        if (appointmentForEmail?.userId?.email) {
          await sendAppointmentPaymentSuccessEmail({
            email: appointmentForEmail.userId.email,
            name: appointmentForEmail.userId.name,
            lawyerName: appointmentForEmail.lawyerId?.name || appointmentForEmail.lawyerName,
            lawyerSpecialization: appointmentForEmail.lawyerSpecialization,
            appointmentMode: appointmentForEmail.appointmentMode,
            date: appointmentForEmail.date,
            timeSlot: appointmentForEmail.timeSlot,
            caseCategory: appointmentForEmail.caseCategory,
            feeCharged: appointmentForEmail.feeCharged,
            lawyerLocation: appointmentForEmail.lawyerId?.location,
            meetingLink: appointmentForEmail.meetingLink,
          });

          payment.confirmationEmailSent = true;
          await payment.save();
        }
      } catch (emailError) {
        console.error("Failed to send payment confirmation email:", emailError);
      }
    }

    if (!payment.lawyerConfirmationEmailSent) {
      try {
        const appointmentForEmail = await Appointment.findById(appointment._id)
          .populate("userId", "name email")
          .populate("lawyerId", "name email location");

        if (appointmentForEmail?.lawyerId?.email) {
          await sendAppointmentPaymentSuccessEmailToLawyer({
            email: appointmentForEmail.lawyerId.email,
            name: appointmentForEmail.lawyerId.name,
            clientName: appointmentForEmail.userId?.name,
            lawyerName: appointmentForEmail.lawyerId?.name || appointmentForEmail.lawyerName,
            lawyerSpecialization: appointmentForEmail.lawyerSpecialization,
            appointmentMode: appointmentForEmail.appointmentMode,
            date: appointmentForEmail.date,
            timeSlot: appointmentForEmail.timeSlot,
            caseCategory: appointmentForEmail.caseCategory,
            feeCharged: appointmentForEmail.feeCharged,
            lawyerLocation: appointmentForEmail.lawyerId?.location,
            meetingLink: appointmentForEmail.meetingLink,
          });

          payment.lawyerConfirmationEmailSent = true;
          await payment.save();
        }
      } catch (emailError) {
        console.error("Failed to send lawyer payment confirmation email:", emailError);
      }
    }

    return res.json({
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to verify Razorpay payment",
    });
  }
};

const listPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "appointmentId",
        select: "lawyerName feeCharged userId lawyerId",
        populate: [
          { path: "userId", select: "name email" },
          { path: "lawyerId", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const normalizedPayments = payments.map((payment) => ({
      _id: payment._id,
      appointmentId: payment.appointmentId?._id || payment.appointmentId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      status: payment.paymentStatus,
      paymentStatus: payment.paymentStatus,
      paymentMode: payment.paymentMode,
      clientName: payment.appointmentId?.userId?.name || "N/A",
      clientEmail: payment.appointmentId?.userId?.email || "N/A",
      lawyerName: payment.appointmentId?.lawyerId?.name || payment.appointmentId?.lawyerName || "N/A",
      createdAt: payment.createdAt,
      orderId: payment.razorpayOrderId,
      appointmentPaymentStatus: payment.appointmentId?.paymentStatus,
    }));

    return res.json(normalizedPayments);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to fetch payments" });
  }
};

const listRefunds = async (req, res) => {
  return res.json([]);
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
  listPayments,
  listRefunds,
};
