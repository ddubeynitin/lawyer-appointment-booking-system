const express = require("express");
const router = express.Router();
const {
  createReview,
  getReviewsByLawyer,
  getReviewsByUser,
  getReviewById,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Create a review
router.post("/", authMiddleware, createReview);
// Get reviews for a specific lawyer
router.get("/lawyer/:lawyerId", getReviewsByLawyer);
// Get reviews created by a specific user
router.get("/user/:userId", getReviewsByUser);
// Get a review by ID
router.get("/:id", getReviewById);
// Update a review
router.put("/:id", updateReview);
// Delete a review
router.delete("/:id", deleteReview);

module.exports = router;
