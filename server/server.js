const express = require("express");
const connectDB = require("./src/config/db");
const env = require("./src/config/env");

//routes
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const lawyerRoutes = require("./src/routes/lawyer.routes");
const appointmentRoutes = require("./src/routes/appointment.routes");
const availabilityRoutes = require("./src/routes/availability.routes");
const reviewRoutes = require("./src/routes/review.routes");

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


// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/reviews", reviewRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
