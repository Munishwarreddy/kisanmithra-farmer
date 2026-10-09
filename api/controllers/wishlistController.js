const Wishlist = require("../models/WishlistModel");
const Product = require("../models/ProductModel");

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private (Consumer only)
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Find or create wishlist for the consumer
    let wishlist = await Wishlist.findOne({ consumer: req.user._id });

    if (!wishlist) {
      // Create new wishlist if it doesn't exist
      wishlist = await Wishlist.create({
        consumer: req.user._id,
        products: [{ product: productId }],
      });
    } else {
      // Check if product is already in wishlist
      const productExists = wishlist.products.some(
        (item) => item.product.toString() === productId
      );

      if (productExists) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      // Add product to wishlist
      wishlist.products.push({ product: productId });
      await wishlist.save();
    }

    // Populate the wishlist with product details
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products.product",
      select: "name price image inStock category farmer",
      populate: {
        path: "farmer",
        select: "name rating",
      },
    });

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: populatedWishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private (Consumer only)
 */
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ consumer: req.user._id }).populate({
      path: "products.product",
      select: "name price image inStock category farmer rating",
      populate: {
        path: "farmer",
        select: "name rating",
      },
    });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        data: {
          consumer: req.user._id,
          products: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      count: wishlist.products.length,
      data: wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Remove product from wishlist
 * @route   DELETE /api/wishlist/:productId
 * @access  Private (Consumer only)
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ consumer: req.user._id });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    // Check if product exists in wishlist
    const productIndex = wishlist.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    // Populate the updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products.product",
      select: "name price image inStock category farmer",
      populate: {
        path: "farmer",
        select: "name rating",
      },
    });

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      data: populatedWishlist,
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
