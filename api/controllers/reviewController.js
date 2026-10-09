const Review = require("../models/ReviewModel");
const Product = require("../models/ProductModel");
const Order = require("../models/OrderModel");
const User = require("../models/UserModel");
const FarmerProfile = require("../models/FarmerProfileModel");

// @desc    Submit a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private (Consumer only)
exports.submitProductReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const productId = req.params.id;
    const consumerId = req.user._id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating is required and must be between 1 and 5",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify that the consumer has purchased this product (delivered order)
    const order = await Order.findOne({
      consumer: consumerId,
      "items.product": productId,
      status: "delivered",
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you have purchased and received",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      consumer: consumerId,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review
    const review = await Review.create({
      consumer: consumerId,
      product: productId,
      farmer: product.farmer,
      order: order._id,
      rating,
      comment,
      images: images || [],
      isVerified: true,
    });

    // Populate consumer details
    await review.populate("consumer", "name photo");

    // Update product rating and review count
    await updateProductRating(productId);

    // Update farmer rating and review count
    await updateFarmerRating(product.farmer);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get all reviews for the product
    const reviews = await Review.find({ product: productId })
      .populate("consumer", "name photo")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get product reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all reviews for a farmer
// @route   GET /api/farmers/:id/reviews
// @access  Public
exports.getFarmerReviews = async (req, res) => {
  try {
    const farmerId = req.params.id;

    // Check if farmer exists
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== "farmer") {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    // Get all reviews for the farmer
    const reviews = await Review.find({ farmer: farmerId })
      .populate("consumer", "name photo")
      .populate("product", "name images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get farmer reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete a review (Admin only)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin only)
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Store product and farmer IDs before deletion
    const productId = review.product;
    const farmerId = review.farmer;

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update product rating and review count
    await updateProductRating(productId);

    // Update farmer rating and review count
    await updateFarmerRating(farmerId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        totalReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Update product rating error:", error);
  }
}

// Helper function to update farmer rating
async function updateFarmerRating(farmerId) {
  try {
    const reviews = await Review.find({ farmer: farmerId });

    if (reviews.length === 0) {
      await FarmerProfile.findOneAndUpdate(
        { user: farmerId },
        {
          rating: 0,
          totalReviews: 0,
        }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await FarmerProfile.findOneAndUpdate(
      { user: farmerId },
      {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
      }
    );
  } catch (error) {
    console.error("Update farmer rating error:", error);
  }
}

// Export all functions
module.exports = {
  submitProductReview: exports.submitProductReview,
  getProductReviews: exports.getProductReviews,
  getFarmerReviews: exports.getFarmerReviews,
  deleteReview: exports.deleteReview,
};
