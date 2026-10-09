const SavedFarmer = require("../models/SavedFarmerModel");
const User = require("../models/UserModel");

/**
 * @desc    Save a farmer
 * @route   POST /api/farmers/:id/save
 * @access  Private (Consumer only)
 */
const saveFarmer = async (req, res) => {
  try {
    const { id: farmerId } = req.params;

    // Verify farmer exists and has farmer role
    const farmer = await User.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    if (farmer.role !== "farmer") {
      return res.status(400).json({
        success: false,
        message: "User is not a farmer",
      });
    }

    // Find or create saved farmers list for the consumer
    let savedFarmers = await SavedFarmer.findOne({ consumer: req.user._id });

    if (!savedFarmers) {
      // Create new saved farmers list if it doesn't exist
      savedFarmers = await SavedFarmer.create({
        consumer: req.user._id,
        farmers: [{ farmer: farmerId }],
      });
    } else {
      // Check if farmer is already saved
      const farmerExists = savedFarmers.farmers.some(
        (item) => item.farmer.toString() === farmerId
      );

      if (farmerExists) {
        return res.status(400).json({
          success: false,
          message: "Farmer already saved",
        });
      }

      // Add farmer to saved list
      savedFarmers.farmers.push({ farmer: farmerId });
      await savedFarmers.save();
    }

    // Populate the saved farmers list with farmer details
    const populatedSavedFarmers = await SavedFarmer.findById(
      savedFarmers._id
    ).populate({
      path: "farmers.farmer",
      select: "name email phone photo address role",
    });

    res.status(200).json({
      success: true,
      message: "Farmer saved successfully",
      data: populatedSavedFarmers,
    });
  } catch (error) {
    console.error("Error saving farmer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save farmer",
      error: error.message,
    });
  }
};

/**
 * @desc    Get saved farmers
 * @route   GET /api/farmers/saved
 * @access  Private (Consumer only)
 */
const getSavedFarmers = async (req, res) => {
  try {
    const savedFarmers = await SavedFarmer.findOne({
      consumer: req.user._id,
    }).populate({
      path: "farmers.farmer",
      select: "name email phone photo address role",
    });

    if (!savedFarmers) {
      return res.status(200).json({
        success: true,
        data: {
          consumer: req.user._id,
          farmers: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      count: savedFarmers.farmers.length,
      data: savedFarmers,
    });
  } catch (error) {
    console.error("Error fetching saved farmers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved farmers",
      error: error.message,
    });
  }
};

/**
 * @desc    Unsave a farmer
 * @route   DELETE /api/farmers/:id/save
 * @access  Private (Consumer only)
 */
const unsaveFarmer = async (req, res) => {
  try {
    const { id: farmerId } = req.params;

    const savedFarmers = await SavedFarmer.findOne({ consumer: req.user._id });

    if (!savedFarmers) {
      return res.status(404).json({
        success: false,
        message: "Saved farmers list not found",
      });
    }

    // Check if farmer exists in saved list
    const farmerIndex = savedFarmers.farmers.findIndex(
      (item) => item.farmer.toString() === farmerId
    );

    if (farmerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found in saved list",
      });
    }

    // Remove farmer from saved list
    savedFarmers.farmers.splice(farmerIndex, 1);
    await savedFarmers.save();

    // Populate the updated saved farmers list
    const populatedSavedFarmers = await SavedFarmer.findById(
      savedFarmers._id
    ).populate({
      path: "farmers.farmer",
      select: "name email phone photo address role",
    });

    res.status(200).json({
      success: true,
      message: "Farmer removed from saved list successfully",
      data: populatedSavedFarmers,
    });
  } catch (error) {
    console.error("Error removing saved farmer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove farmer from saved list",
      error: error.message,
    });
  }
};

module.exports = {
  saveFarmer,
  getSavedFarmers,
  unsaveFarmer,
};
