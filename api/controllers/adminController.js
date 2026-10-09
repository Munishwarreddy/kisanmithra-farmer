const User = require("../models/UserModel");
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const FarmerProfile = require("../models/FarmerProfileModel");

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users count by role
    const totalUsers = await User.countDocuments();
    const totalConsumers = await User.countDocuments({ role: "consumer" });
    const totalFarmers = await User.countDocuments({ role: "farmer" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Get total orders and revenue
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: "completed" });
    
    // Calculate total revenue from completed orders
    const revenueResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get active farmers (farmers with at least one product)
    const activeFarmers = await Product.distinct("farmer");

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate("consumer", "name email")
      .populate("farmer", "name email")
      .sort("-createdAt")
      .limit(10)
      .select("orderNumber status totalAmount createdAt");

    // Get order status breakdown
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $count: {} } } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          consumers: totalConsumers,
          farmers: totalFarmers,
          admins: totalAdmins,
          activeFarmers: activeFarmers.length
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          byStatus: ordersByStatus
        },
        revenue: {
          total: totalRevenue,
          average: completedOrders > 0 ? totalRevenue / completedOrders : 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const query = {};

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort("-createdAt");

    res.json({
      success: true,
      count: users.length,
      data: users,
      filters: {
        role: req.query.role,
        isActive: req.query.isActive,
        search: req.query.search
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update user status (activate/suspend)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "isActive field is required"
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own status"
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
      data: user
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    // Delete associated data based on user role
    if (user.role === "farmer") {
      // Delete farmer profile
      await FarmerProfile.deleteOne({ user: user._id });
      
      // Note: Products and orders are kept for historical records
      // but could be marked as inactive or archived
      await Product.updateMany(
        { farmer: user._id },
        { isActive: false }
      );
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private (Admin only)
exports.getAllProducts = async (req, res) => {
  try {
    const query = {};

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by farmer
    if (req.query.farmer) {
      query.farmer = req.query.farmer;
    }

    // Search by name
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.name = searchRegex;
    }

    const products = await Product.find(query)
      .populate("farmer", "name email")
      .populate("category", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      count: products.length,
      data: products,
      filters: {
        isActive: req.query.isActive,
        category: req.query.category,
        farmer: req.query.farmer,
        search: req.query.search
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    // Filter by consumer
    if (req.query.consumer) {
      query.consumer = req.query.consumer;
    }

    // Filter by farmer
    if (req.query.farmer) {
      query.farmer = req.query.farmer;
    }

    const orders = await Order.find(query)
      .populate("consumer", "name email")
      .populate("farmer", "name email")
      .populate("items.product", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      count: orders.length,
      data: orders,
      filters: {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        consumer: req.query.consumer,
        farmer: req.query.farmer
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
