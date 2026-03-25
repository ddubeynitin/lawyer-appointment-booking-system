const User = require("../models/user.model.js");
const Lawyer = require("../models/lawyer.model.js");
const Appointment = require("../models/appointment.model.js");
const Review = require("../models/review.model.js");

const getStats = async (req, res) => {
  try {

    const totalClients = await User.countDocuments();

    const activeLawyers = await Lawyer.countDocuments();

    const totalAppointments = await Appointment.countDocuments();

    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const satisfactionRate = avgRating[0]?.averageRating || 0;

    res.json({
      totalClients,
      activeLawyers,
      totalAppointments,
      satisfactionRate
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching platform stats" });
  }
};

module.exports = { getStats }