const mongoose = require('mongoose');
const env = require('./env');
const Conversation = require('../models/conversation.model');

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected successfully');

    await Conversation.syncIndexes();
    console.log('Conversation indexes synced successfully');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
