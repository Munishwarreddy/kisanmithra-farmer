const express = require("express");
const {
  advancedSearch,
  autocomplete
} = require("../controllers/searchController");

const router = express.Router();

// Public routes
router.get("/", advancedSearch);
router.get("/autocomplete", autocomplete);

module.exports = router;
