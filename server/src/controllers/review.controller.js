const mongoose = require("mongoose");
const Review = require("../models/review.model");
const Lawyer = require("../models/lawyer.model");
const Appointment = require("../models/appointment.model");

const syncLawyerReviewStats = async (lawyerId) => {
  if (!lawyerId) return;

  const [stats] = await Review.aggregate([
    {
      $match: {
        lawyerId: mongoose.Types.ObjectId.isValid(lawyerId)
          ? new mongoose.Types.ObjectId(lawyerId)
          : lawyerId,
      },
    },
    {
      $group: {
        _id: "$lawyerId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Lawyer.findByIdAndUpdate(lawyerId, {
    rating: stats ? Number(stats.averageRating.toFixed(1)) : 0,
    totalReviews: stats ? stats.totalReviews : 0,
  });
};

// Create a review
const createReview = async (req, res) => {
  try {
    const { lawyerId, appointmentId, rating, comment } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId || !lawyerId || !appointmentId || !rating) {
      return res.status(400).json({
        error: "User, lawyer, appointment, and rating are required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "You can only review your own completed appointments",
      });
    }

    if (appointment.lawyerId.toString() !== lawyerId.toString()) {
      return res.status(400).json({
        error: "This appointment does not belong to the selected lawyer",
      });
    }

    if (appointment.status !== "Completed") {
      return res.status(400).json({
        error: "You can submit a review only after the appointment is completed",
      });
    }

    const review = new Review({
      userId,
      lawyerId,
      appointmentId,
      rating,
      comment,
    });

    await review.save();
    await syncLawyerReviewStats(review.lawyerId);
    res.status(201).json(review);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        error: "You have already submitted a review for this appointment",
      });
    }

    res.status(500).json({ error: error.message });
  }
};

// Get reviews for a specific lawyer
const getReviewsByLawyer = async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const reviews = await Review.find({ lawyerId })
    .populate("userId", "name") // fetch only name
    .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get reviews created by a specific user
const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId })
      .select("appointmentId lawyerId rating comment createdAt")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a review by ID
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const existingReview = await Review.findById(id);

    if (!existingReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    const previousLawyerId = existingReview.lawyerId?.toString();
    const review = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await syncLawyerReviewStats(review.lawyerId);

    if (previousLawyerId && previousLawyerId !== review.lawyerId?.toString()) {
      await syncLawyerReviewStats(previousLawyerId);
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    await syncLawyerReviewStats(review.lawyerId);
    res.json(review);
  } catch (error) {
     res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createReview,
  getReviewsByLawyer,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
};
