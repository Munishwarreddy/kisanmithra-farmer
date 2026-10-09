const express = require("express");
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAllProducts,
  deleteProduct,
  getAllOrders,
} = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../utils/authMiddleware");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, isAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);

// Product management
router.get("/products", getAllProducts);
router.delete("/products/:id", deleteProduct);

// Order management
router.get("/orders", getAllOrders);

module.exports = router;
