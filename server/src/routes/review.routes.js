const express = require("express");
const router = express.Router();
const { createReview, getReviewsByLawyer, getReviewById, updateReview, deleteReview } = require("../controllers/review.controller");

// Create a review
router.post("/", createReview);
// Get reviews for a specific lawyer
router.get("/lawyer/:lawyerId", getReviewsByLawyer);
// Get a review by ID
router.get("/:id", getReviewById);
// Update a review
router.put("/:id", updateReview);
// Delete a review
router.delete("/:id", deleteReview);

module.exports = router;