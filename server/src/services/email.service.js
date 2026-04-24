const env = require("../config/env");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const hasBrevoConfig = () =>
  Boolean(env.BREVO_API_KEY && env.BREVO_SENDER_EMAIL && env.BREVO_SENDER_NAME);

const sendBrevoEmail = async ({ to, subject, html, text }) => {
  if (!hasBrevoConfig()) {
    throw new Error("Brevo email configuration is missing");
  }

  const payload = {
    sender: {
      email: env.BREVO_SENDER_EMAIL,
      name: env.BREVO_SENDER_NAME,
    },
    to: Array.isArray(to) ? to : [to],
    subject,
    htmlContent: html,
    textContent: text,
  };

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": env.BREVO_API_KEY,
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let responseBody = {};

  try {
    responseBody = responseText ? JSON.parse(responseText) : {};
  } catch {
    responseBody = { raw: responseText };
  }

  if (!response.ok) {
    const errorMessage =
      responseBody?.message ||
      responseBody?.raw ||
      `Brevo email request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseBody;
};

const sendOtpEmail = async ({ email, name, purpose, otp, minutesValid }) => {
  const subject =
    purpose === "password_reset"
      ? "Your JustifAi password reset code"
      : purpose === "registration"
        ? "Verify your JustifAi email"
        : "Your JustifAi login verification code";

  const heading =
    purpose === "password_reset"
      ? "Reset your password"
      : purpose === "registration"
        ? "Verify your email"
        : "Verify your login";

  const bodyText =
    purpose === "password_reset"
      ? "Use this code to reset your JustifAi password."
      : purpose === "registration"
        ? "Use this code to verify your email address and complete your registration."
        : "Use this code to sign in to your JustifAi account.";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">${heading}</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">${bodyText}</p>
      <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#eff6ff;color:#1d4ed8;padding:14px 18px;border-radius:12px;display:inline-block">${otp}</div>
      <p style="margin:16px 0 0">This code expires in ${minutesValid} minutes.</p>
      <p style="margin:8px 0 0;color:#64748b">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const text = `${heading}\n\n${bodyText}\n\nCode: ${otp}\nExpires in ${minutesValid} minutes.`;

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendWelcomeLawyerEmail = async ({ email, name, licenseNo }) => {
  const subject = "Welcome to JustifAi";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Welcome to JustifAi</h2>
      <p style="margin:0 0 16px">Hi ${name || "Lawyer"},</p>
      <p style="margin:0 0 16px">
        Your lawyer registration has been received successfully.
      </p>
      <p style="margin:0 0 16px">
        License Number: <strong>${licenseNo || "-"}</strong>
      </p>
      <p style="margin:0">You can now complete your profile and start managing appointments.</p>
    </div>
  `;

  const text = `Welcome to JustifAi\n\nYour lawyer registration has been received successfully.\nLicense Number: ${licenseNo || "-"}\n\nYou can now complete your profile and start managing appointments.`;

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const formatAppointmentDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatLawyerLocation = (location = {}) => {
  const parts = [location.address, location.city, location.state]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Office location not available";
};

const sendAppointmentRequestEmail = async ({
  email,
  name,
  lawyerName,
  appointmentMode,
  date,
  timeSlot,
  caseCategory,
}) => {
  const formattedDate = formatAppointmentDate(date);

  const subject = `Your appointment request was sent to ${lawyerName || "the lawyer"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Request Sent</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        Your appointment request has been sent successfully to ${lawyerName || "the lawyer"}.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Lawyer:</strong> ${lawyerName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${timeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Mode:</strong> ${appointmentMode || "-"}</p>
        <p style="margin:0 0 8px"><strong>Category:</strong> ${caseCategory || "-"}</p>
      </div>
      <p style="margin:16px 0 0">
        Please wait for the lawyer's confirmation. Once approved, you will receive the full appointment details.
      </p>
      <p style="margin:16px 0 0;color:#64748b">
        If you did not request this appointment, please contact support immediately.
      </p>
    </div>
  `;

  const text = [
    "Appointment Request Sent",
    "",
    `Hi ${name || "there"},`,
    `Your appointment request has been sent successfully to ${lawyerName || "the lawyer"}.`,
    "",
    `Lawyer: ${lawyerName || "-"}`,
    `Date: ${formattedDate}`,
    `Time: ${timeSlot || "-"}`,
    `Mode: ${appointmentMode || "-"}`,
    `Category: ${caseCategory || "-"}`,
    "Please wait for the lawyer's confirmation. Once approved, you will receive the full appointment details.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendAppointmentRequestNotificationEmail = async ({
  email,
  name,
  clientName,
  lawyerSpecialization,
  appointmentMode,
  date,
  timeSlot,
  caseCategory,
}) => {
  const formattedDate = formatAppointmentDate(date);
  const subject = `New appointment request from ${clientName || "a client"}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">New Appointment Request</h2>
      <p style="margin:0 0 16px">Hi ${name || "Lawyer"},</p>
      <p style="margin:0 0 16px">
        You have received a new appointment request from ${clientName || "a client"}.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Client:</strong> ${clientName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Specialization:</strong> ${lawyerSpecialization || "-"}</p>
        <p style="margin:0 0 8px"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${timeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Mode:</strong> ${appointmentMode || "-"}</p>
        <p style="margin:0"><strong>Category:</strong> ${caseCategory || "-"}</p>
      </div>
      <p style="margin:16px 0 0">Please review and confirm the request in the dashboard.</p>
    </div>
  `;

  const text = [
    "New Appointment Request",
    "",
    `Hi ${name || "Lawyer"},`,
    `You have received a new appointment request from ${clientName || "a client"}.`,
    "",
    `Client: ${clientName || "-"}`,
    `Specialization: ${lawyerSpecialization || "-"}`,
    `Date: ${formattedDate}`,
    `Time: ${timeSlot || "-"}`,
    `Mode: ${appointmentMode || "-"}`,
    `Category: ${caseCategory || "-"}`,
    "",
    "Please review and confirm the request in the dashboard.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendAppointmentApprovalEmail = async ({
  email,
  name,
  lawyerName,
  lawyerSpecialization,
  appointmentMode,
  date,
  timeSlot,
  caseCategory,
  feeCharged,
  lawyerLocation,
  meetingLink,
}) => {
  const formattedDate = formatAppointmentDate(date);

  const subject = `Your appointment with ${lawyerName || "your lawyer"} has been approved`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Approved</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        Your appointment request has been approved.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Lawyer:</strong> ${lawyerName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${timeSlot || "-"}</p>
      </div>
      <p style="margin:16px 0 0;color:#64748b">
        Please go to the Appointments page in your dashboard to complete the payment and finalize the booking.
      </p>
    </div>
  `;

  const text = [
    "Appointment Approved",
    "",
    `Hi ${name || "there"},`,
    "Your appointment request has been approved.",
    "",
    `Lawyer: ${lawyerName || "-"}`,
    `Date: ${formattedDate}`,
    `Time: ${timeSlot || "-"}`,
    "",
    "Please go to the Appointments page in your dashboard to complete the payment and finalize the booking.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendAppointmentPaymentSuccessEmail = async ({
  email,
  name,
  lawyerName,
  lawyerSpecialization,
  appointmentMode,
  date,
  timeSlot,
  caseCategory,
  feeCharged,
  lawyerLocation,
  meetingLink,
}) => {
  const formattedDate = formatAppointmentDate(date);
  const officeLocation = formatLawyerLocation(lawyerLocation);
  const isOffice = appointmentMode === "Office";

  const subject = `Payment received for your appointment with ${lawyerName || "your lawyer"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Booked Successfully</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        We have received your payment and your appointment is now confirmed.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Lawyer:</strong> ${lawyerName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Specialization:</strong> ${lawyerSpecialization || "-"}</p>
        <p style="margin:0 0 8px"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${timeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Mode:</strong> ${appointmentMode || "-"}</p>
        <p style="margin:0 0 8px"><strong>Category:</strong> ${caseCategory || "-"}</p>
        <p style="margin:0"><strong>Fee:</strong> Rs ${feeCharged ?? "-"}</p>
      </div>
      ${
        isOffice
          ? `<p style="margin:16px 0 0"><strong>Lawyer Office:</strong> ${officeLocation}</p>`
          : `<p style="margin:16px 0 0"><strong>Meeting Link:</strong> <a href="${meetingLink || "#"}">${meetingLink || "Not available yet"}</a></p>`
      }
      <p style="margin:16px 0 0;color:#64748b">
        You can view this appointment anytime from the Appointments page in your dashboard.
      </p>
    </div>
  `;

  const text = [
    "Appointment Booked Successfully",
    "",
    `Hi ${name || "there"},`,
    "We have received your payment and your appointment is now confirmed.",
    "",
    `Lawyer: ${lawyerName || "-"}`,
    `Specialization: ${lawyerSpecialization || "-"}`,
    `Date: ${formattedDate}`,
    `Time: ${timeSlot || "-"}`,
    `Mode: ${appointmentMode || "-"}`,
    `Category: ${caseCategory || "-"}`,
    `Fee: Rs ${feeCharged ?? "-"}`,
    isOffice
      ? `Lawyer Office: ${officeLocation}`
      : `Meeting Link: ${meetingLink || "Not available yet"}`,
    "",
    "You can view this appointment anytime from the Appointments page in your dashboard.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendAppointmentPaymentSuccessEmailToLawyer = async ({
  email,
  name,
  clientName,
  lawyerName,
  lawyerSpecialization,
  appointmentMode,
  date,
  timeSlot,
  caseCategory,
  feeCharged,
  lawyerLocation,
  meetingLink,
}) => {
  const formattedDate = formatAppointmentDate(date);
  const officeLocation = formatLawyerLocation(lawyerLocation);
  const isOffice = appointmentMode === "Office";

  const subject = `Payment received for appointment with ${clientName || "your client"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Booked Successfully</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        The client has completed the payment and the appointment is now confirmed.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Client:</strong> ${clientName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Lawyer:</strong> ${lawyerName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Specialization:</strong> ${lawyerSpecialization || "-"}</p>
        <p style="margin:0 0 8px"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${timeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Mode:</strong> ${appointmentMode || "-"}</p>
        <p style="margin:0 0 8px"><strong>Category:</strong> ${caseCategory || "-"}</p>
        <p style="margin:0"><strong>Fee:</strong> Rs ${feeCharged ?? "-"}</p>
      </div>
      ${
        isOffice
          ? `<p style="margin:16px 0 0"><strong>Lawyer Office:</strong> ${officeLocation}</p>`
          : `<p style="margin:16px 0 0"><strong>Meeting Link:</strong> <a href="${meetingLink || "#"}">${meetingLink || "Not available yet"}</a></p>`
      }
      <p style="margin:16px 0 0;color:#64748b">
        Please review the appointment details in your dashboard.
      </p>
    </div>
  `;

  const text = [
    "Appointment Booked Successfully",
    "",
    `Hi ${name || "there"},`,
    "The client has completed the payment and the appointment is now confirmed.",
    "",
    `Client: ${clientName || "-"}`,
    `Lawyer: ${lawyerName || "-"}`,
    `Specialization: ${lawyerSpecialization || "-"}`,
    `Date: ${formattedDate}`,
    `Time: ${timeSlot || "-"}`,
    `Mode: ${appointmentMode || "-"}`,
    `Category: ${caseCategory || "-"}`,
    `Fee: Rs ${feeCharged ?? "-"}`,
    isOffice
      ? `Lawyer Office: ${officeLocation}`
      : `Meeting Link: ${meetingLink || "Not available yet"}`,
    "",
    "Please review the appointment details in your dashboard.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendAppointmentRejectionEmail = async ({
  email,
  name,
  lawyerName,
  date,
  timeSlot,
  caseCategory,
  rejectionReason,
}) => {
  const formattedDate = formatAppointmentDate(date);
  const reasonText = String(rejectionReason || "").trim() || "No reason provided";
  const subject = `Appointment update from ${lawyerName || "your lawyer"}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Request Rejected</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        Your appointment request with ${lawyerName || "your lawyer"} was not approved at this time.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Date:</strong> ${formattedDate}</p>
        <p style="margin:0 0 8px"><strong>Time:</strong> ${timeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Category:</strong> ${caseCategory || "-"}</p>
        <p style="margin:0"><strong>Reason:</strong> ${reasonText}</p>
      </div>
      <p style="margin:16px 0 0">
        You can review the reason above and submit a new request if needed.
      </p>
    </div>
  `;

  const text = [
    "Appointment Request Rejected",
    "",
    `Hi ${name || "there"},`,
    `Your appointment request with ${lawyerName || "your lawyer"} was not approved at this time.`,
    "",
    `Date: ${formattedDate}`,
    `Time: ${timeSlot || "-"}`,
    `Category: ${caseCategory || "-"}`,
    `Reason: ${reasonText}`,
    "",
    "You can review the reason above and submit a new request if needed.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendRescheduleRequestEmail = async ({
  email,
  name,
  lawyerName,
  currentDate,
  currentTimeSlot,
  requestedDate,
  requestedTimeSlot,
  reason,
}) => {
  const formattedCurrentDate = formatAppointmentDate(currentDate);
  const formattedRequestedDate = formatAppointmentDate(requestedDate);

  const subject = `Your reschedule request was sent to ${lawyerName || "the lawyer"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Reschedule Request Sent</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        Your reschedule request has been sent successfully to ${lawyerName || "the lawyer"}.
        Please wait for confirmation.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Current Date:</strong> ${formattedCurrentDate}</p>
        <p style="margin:0 0 8px"><strong>Current Time:</strong> ${currentTimeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Requested Date:</strong> ${formattedRequestedDate}</p>
        <p style="margin:0 0 8px"><strong>Requested Time:</strong> ${requestedTimeSlot || "-"}</p>
        <p style="margin:0"><strong>Reason:</strong> ${String(reason || "").trim() || "No reason provided"}</p>
      </div>
      <p style="margin:16px 0 0">
        We will notify you once the lawyer approves or rejects the request.
      </p>
    </div>
  `;

  const text = [
    "Reschedule Request Sent",
    "",
    `Hi ${name || "there"},`,
    `Your reschedule request has been sent successfully to ${lawyerName || "the lawyer"}. Please wait for confirmation.`,
    "",
    `Current Date: ${formattedCurrentDate}`,
    `Current Time: ${currentTimeSlot || "-"}`,
    `Requested Date: ${formattedRequestedDate}`,
    `Requested Time: ${requestedTimeSlot || "-"}`,
    `Reason: ${String(reason || "").trim() || "No reason provided"}`,
    "",
    "We will notify you once the lawyer approves or rejects the request.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

const sendRescheduleRequestNotificationEmail = async ({
  email,
  name,
  clientName,
  lawyerName,
  currentDate,
  currentTimeSlot,
  requestedDate,
  requestedTimeSlot,
  reason,
}) => {
  const formattedCurrentDate = formatAppointmentDate(currentDate);
  const formattedRequestedDate = formatAppointmentDate(requestedDate);

  const subject = `Reschedule request from ${clientName || "a client"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Reschedule Request Received</h2>
      <p style="margin:0 0 16px">Hi ${name || "Lawyer"},</p>
      <p style="margin:0 0 16px">
        ${clientName || "A client"} has requested to reschedule their appointment.
      </p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>Client:</strong> ${clientName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Lawyer:</strong> ${lawyerName || "-"}</p>
        <p style="margin:0 0 8px"><strong>Current Date:</strong> ${formattedCurrentDate}</p>
        <p style="margin:0 0 8px"><strong>Current Time:</strong> ${currentTimeSlot || "-"}</p>
        <p style="margin:0 0 8px"><strong>Requested Date:</strong> ${formattedRequestedDate}</p>
        <p style="margin:0 0 8px"><strong>Requested Time:</strong> ${requestedTimeSlot || "-"}</p>
        <p style="margin:0"><strong>Reason:</strong> ${String(reason || "").trim() || "No reason provided"}</p>
      </div>
      <p style="margin:16px 0 0">Please review the request in the dashboard and approve or reject it.</p>
    </div>
  `;

  const text = [
    "Reschedule Request Received",
    "",
    `Hi ${name || "Lawyer"},`,
    `${clientName || "A client"} has requested to reschedule their appointment.`,
    "",
    `Client: ${clientName || "-"}`,
    `Lawyer: ${lawyerName || "-"}`,
    `Current Date: ${formattedCurrentDate}`,
    `Current Time: ${currentTimeSlot || "-"}`,
    `Requested Date: ${formattedRequestedDate}`,
    `Requested Time: ${requestedTimeSlot || "-"}`,
    `Reason: ${String(reason || "").trim() || "No reason provided"}`,
    "",
    "Please review the request in the dashboard and approve or reject it.",
  ].join("\n");

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

module.exports = {
  hasBrevoConfig,
  sendBrevoEmail,
  sendOtpEmail,
  sendWelcomeLawyerEmail,
  sendAppointmentRequestEmail,
  sendAppointmentRequestNotificationEmail,
  sendAppointmentApprovalEmail,
  sendAppointmentPaymentSuccessEmail,
  sendAppointmentPaymentSuccessEmailToLawyer,
  sendAppointmentRejectionEmail,
  sendRescheduleRequestEmail,
  sendRescheduleRequestNotificationEmail,
};
