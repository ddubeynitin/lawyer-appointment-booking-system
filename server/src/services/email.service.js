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

const sendAppointmentProofEmail = async ({
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
}) => {
  const formattedDate = formatAppointmentDate(date);
  const officeLocation = formatLawyerLocation(lawyerLocation);
  const isOffice = appointmentMode === "Office";

  const subject = `Appointment confirmation with ${lawyerName || "your lawyer"}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px">Appointment Booking Confirmation</h2>
      <p style="margin:0 0 16px">Hi ${name || "there"},</p>
      <p style="margin:0 0 16px">
        Your appointment has been booked successfully. Please keep this email as proof of booking.
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
          : `<p style="margin:16px 0 0">The online meeting link will be provided to your registered email a few minutes before the appointment time.</p>`
      }
      <p style="margin:16px 0 0;color:#64748b">
        If you did not request this appointment, please contact support immediately.
      </p>
    </div>
  `;

  const text = [
    "Appointment Booking Confirmation",
    "",
    `Hi ${name || "there"},`,
    "Your appointment has been booked successfully. Please keep this email as proof of booking.",
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
      : "The online meeting link will be provided to your registered email a few minutes before the appointment time.",
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
  sendAppointmentProofEmail,
};
