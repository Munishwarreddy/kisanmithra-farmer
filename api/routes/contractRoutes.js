const express = require("express");
const {
  createContract,
  getUserContracts,
  getContract,
  acceptContract,
  rejectContract,
  modifyContract,
  cancelContract,
} = require("../controllers/contractController");
const { verifyToken } = require("../utils/authMiddleware");

const router = express.Router();

// All contract routes require authentication
router.use(verifyToken);

// Get all contracts for the logged-in user
router.get("/", getUserContracts);

// Get a single contract by ID
router.get("/:id", getContract);

// Create a new contract (consumer or farmer)
router.post("/", createContract);

// Accept a contract (recipient only)
router.put("/:id/accept", acceptContract);

// Reject a contract (recipient only)
router.put("/:id/reject", rejectContract);

// Propose modifications to a contract (recipient only)
router.put("/:id/modify", modifyContract);

// Cancel a contract (initiator or recipient)
router.delete("/:id", cancelContract);

module.exports = router;
