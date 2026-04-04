const dotenv = require('dotenv');
dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  FRONTEND_URL: process.env.FRONTEND_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME,
  DISPOSABLE_EMAIL_DOMAINS: process.env.DISPOSABLE_EMAIL_DOMAINS,
  EMAIL_OTP_TTL_MINUTES: process.env.EMAIL_OTP_TTL_MINUTES || 10,
  EMAIL_OTP_LENGTH: process.env.EMAIL_OTP_LENGTH || 6,
  EMAIL_OTP_COOLDOWN_SECONDS: process.env.EMAIL_OTP_COOLDOWN_SECONDS || 60,
};

module.exports = env;
