const express = require("express");
const http = require("http");
const connectDB = require("./src/config/db");
const env = require("./src/config/env");
const { startAppointmentStatusScheduler } = require("./src/services/appointment.service");

//routes
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");
const userRoutes = require("./src/routes/user.routes");
const lawyerRoutes = require("./src/routes/lawyer.routes");
const appointmentRoutes = require("./src/routes/appointment.routes");
const availabilityRoutes = require("./src/routes/availability.routes");
const reviewRoutes = require("./src/routes/review.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const testRoutes = require("./src/routes/test.routes");
const statRoutes = require("./src/routes/stats.routes");
const aiRoutes = require("./src/routes/ai.routes");
const messageRoutes = require("./src/routes/message.routes");
const { createMessageRealtimeServer } = require("./src/services/message.realtime");

const app = express();
app.use(express.json());

//middleware


//cors configuration
const cors = require("cors");
const corsOptions = {
  origin: env.FRONTEND_URL,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


const PORT = env.PORT || 3000;
const server = http.createServer(app);

  
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/test", testRoutes);
app.use("/api/stats", statRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/messages", messageRoutes);

const startServer = async () => {
  await connectDB();
  startAppointmentStatusScheduler();
  createMessageRealtimeServer(server);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
