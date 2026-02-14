const dotenv = require('dotenv');
dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  FRONTEND_URL: process.env.FRONTEND_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN
};

module.exports = env;