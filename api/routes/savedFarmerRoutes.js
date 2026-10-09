const express = require("express");
const {
  saveFarmer,
  getSavedFarmers,
  unsaveFarmer,
} = require("../controllers/savedFarmerController");
const { verifyToken, isConsumer } = require("../utils/authMiddleware");

const router = express.Router();

// All saved farmer routes require authentication and consumer role
router.use(verifyToken);
router.use(isConsumer);

// Get saved farmers
router.get("/saved", getSavedFarmers);

// Save a farmer
router.post("/:id/save", saveFarmer);

// Unsave a farmer
router.delete("/:id/save", unsaveFarmer);

module.exports = router;
