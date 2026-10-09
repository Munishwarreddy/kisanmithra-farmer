const express = require("express");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { verifyToken, isConsumer } = require("../utils/authMiddleware");

const router = express.Router();

// All wishlist routes require authentication and consumer role
router.use(verifyToken);
router.use(isConsumer);

// Get user's wishlist
router.get("/", getWishlist);

// Add product to wishlist
router.post("/:productId", addToWishlist);

// Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

module.exports = router;
