const express = require("express");
const { 
  register, 
  login, 
  getMe, 
  googleLogin, 
  refreshToken, 
  verifyTokenEndpoint 
} = require("../controllers/authController");
const { verifyToken } = require("../utils/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", verifyToken, getMe);
router.post("/refresh-token", verifyToken, refreshToken);
router.post("/verify-token", verifyTokenEndpoint);

module.exports = router;
