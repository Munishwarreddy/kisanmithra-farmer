const User = require("../models/UserModel");
const FarmerProfile = require("../models/FarmerProfileModel");

const Product = require("../models/ProductModel");

// @desc    Get all farmers
// @route   GET /api/users/farmers
// @access  Public
exports.getAllFarmers = async (req, res) => {
  try {
    let farmers = await User.find({ role: "farmer" }).select("-password").lean();

    // Fetch products and attach as specialtyProducts
    for (let farmer of farmers) {
      // Get the count of total products
      const count = await Product.countDocuments({ farmer: farmer._id });
      farmer.totalProducts = count;
      farmer.productsCount = count;

      // Get up to 3 products to display
      const products = await Product.find({ farmer: farmer._id }).limit(3).lean();
      farmer.specialtyProducts = products || [];
    }

    res.json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get farmer profile
// @route   GET /api/users/farmers/:id
// @access  Public
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmer = await User.findOne({
      _id: req.params.id,
      role: "farmer",
    }).select("-password");

    if (!farmer) {
      return res
        .status(404)
        .json({ success: false, message: "Farmer not found" });
    }

    const farmerProfile = await FarmerProfile.findOne({ user: req.params.id }).lean();
    
    // Fetch products belonging to this farmer
    const products = await Product.find({ farmer: req.params.id }).lean();

    res.json({
      success: true,
      data: {
        farmer,
        profile: farmerProfile || {},
        products: products || [],
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Create or update farmer profile
// @route   PUT /api/users/farmers/profile
// @access  Private (Farmer only)
exports.updateFarmerProfile = async (req, res) => {
  try {
    const {
      farmName,
      description,
      farmImages,
      farmingPractices,
      establishedYear,
      socialMedia,
      businessHours,
      acceptsPickup,
      acceptsDelivery,
      deliveryRadius,
    } = req.body;

    const profileFields = {
      user: req.user._id,
      farmName,
      description,
      farmImages,
      farmingPractices,
      establishedYear,
      socialMedia,
      businessHours,
      acceptsPickup,
      acceptsDelivery,
      deliveryRadius,
    };

    let farmerProfile = await FarmerProfile.findOne({ user: req.user._id });

    if (farmerProfile) {
      farmerProfile = await FarmerProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true }
      );
    } else {
      farmerProfile = await FarmerProfile.create(profileFields);
    }

    res.json({
      success: true,
      data: farmerProfile,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.address = address || user.address;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update user preferences (language, AI features)
// @route   PUT /api/users/preferences
// @access  Private
exports.updateUserPreferences = async (req, res) => {
  try {
    const { language, enableSmartReplies, enableSentimentAnalysis } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences
    if (language && ['en', 'te', 'hi'].includes(language)) {
      user.preferences.language = language;
    }
    
    if (typeof enableSmartReplies === 'boolean') {
      user.preferences.enableSmartReplies = enableSmartReplies;
    }
    
    if (typeof enableSentimentAnalysis === 'boolean') {
      user.preferences.enableSentimentAnalysis = enableSentimentAnalysis;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        preferences: updatedUser.preferences
      },
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.remove();

    res.json({
      success: true,
      message: "User removed",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
