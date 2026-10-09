const express = require("express");
const {
  submitProductReview,
  getProductReviews,
  getFarmerReviews,
  deleteReview,
} = require("../controllers/reviewController");
const { verifyToken, isConsumer, isAdmin } = require("../utils/authMiddleware");

const router = express.Router();

// Product review routes
router.post("/products/:id/reviews", verifyToken, isConsumer, submitProductReview);
router.get("/products/:id/reviews", getProductReviews);

// Farmer review routes
router.get("/farmers/:id/reviews", getFarmerReviews);

// Admin routes
router.delete("/admin/reviews/:id", verifyToken, isAdmin, deleteReview);

module.exports = router;
