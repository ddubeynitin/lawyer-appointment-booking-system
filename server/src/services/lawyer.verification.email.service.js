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

/**
 * Sends an email to lawyer when their verification is approved by admin
 * @param {Object} params
 * @param {string} params.email - Lawyer's email address
 * @param {string} params.name - Lawyer's name
 * @param {string} params.licenseNo - Lawyer's license number
 */
const sendLawyerVerificationApprovalEmail = async ({ email, name, licenseNo }) => {
  const subject = "Your JustifAi Account Has Been Verified";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px;color:#16a34a">Verification Approved</h2>
      <p style="margin:0 0 16px">Hi ${name || "Lawyer"},</p>
      <p style="margin:0 0 16px">
        Great news! Your lawyer account has been successfully verified by our admin team.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>License Number:</strong> ${licenseNo || "-"}</p>
        <p style="margin:0"><strong>Status:</strong> <span style="color:#16a34a">Verified</span></p>
      </div>
      <p style="margin:16px 0 0">
        You can now complete your profile, set your availability, and start accepting client appointments.
      </p>
      <p style="margin:16px 0 0;color:#64748b">
        If you have any questions, please contact our support team.
      </p>
    </div>
  `;

  const text = `Verification Approved\n\nHi ${name || "Lawyer"},\n\nGreat news! Your lawyer account has been successfully verified by our admin team.\n\nLicense Number: ${licenseNo || "-"}\nStatus: Verified\n\nYou can now complete your profile, set your availability, and start accepting client appointments.\n\nIf you have any questions, please contact our support team.`;

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

/**
 * Sends an email to lawyer when their verification is rejected by admin
 * @param {Object} params
 * @param {string} params.email - Lawyer's email address
 * @param {string} params.name - Lawyer's name
 * @param {string} params.licenseNo - Lawyer's license number
 * @param {string} params.rejectionReason - Reason for rejection (optional)
 */
const sendLawyerVerificationRejectionEmail = async ({ email, name, licenseNo, rejectionReason }) => {
  const subject = "JustifAi Account Verification Update";
  const reasonText = String(rejectionReason || "").trim() || "Please contact support for more details";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
      <h2 style="margin:0 0 12px;color:#dc2626">Verification Not Approved</h2>
      <p style="margin:0 0 16px">Hi ${name || "Lawyer"},</p>
      <p style="margin:0 0 16px">
        We regret to inform you that your lawyer account verification could not be approved at this time.
      </p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:16px;padding:16px">
        <p style="margin:0 0 8px"><strong>License Number:</strong> ${licenseNo || "-"}</p>
        <p style="margin:0 0 8px"><strong>Status:</strong> <span style="color:#dc2626">Rejected</span></p>
        <p style="margin:0"><strong>Reason:</strong> ${reasonText}</p>
      </div>
      <p style="margin:16px 0 0">
        You can address the issue mentioned above and request verification again, or contact our support team for assistance.
      </p>
      <p style="margin:16px 0 0;color:#64748b">
        If you believe this is a mistake, please reach out to our support team with your license details.
      </p>
    </div>
  `;

  const text = `Verification Not Approved\n\nHi ${name || "Lawyer"},\n\nWe regret to inform you that your lawyer account verification could not be approved at this time.\n\nLicense Number: ${licenseNo || "-"}\nStatus: Rejected\nReason: ${reasonText}\n\nYou can address the issue mentioned above and request verification again, or contact our support team for assistance.\n\nIf you believe this is a mistake, please reach out to our support team with your license details.`;

  return sendBrevoEmail({
    to: { email, name: name || email },
    subject,
    html,
    text,
  });
};

module.exports = {
  sendLawyerVerificationApprovalEmail,
  sendLawyerVerificationRejectionEmail,
};