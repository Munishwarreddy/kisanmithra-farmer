const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const SavedFarmer = require("../models/SavedFarmerModel");
const Notification = require("../models/NotificationModel");
const pricePredictor = require("../services/ai/pricePredictor");

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Farmer only)
exports.createProduct = async (req, res) => {
  try {
    req.body.farmer = req.user._id;

    // Get price prediction before creating product (Requirement 5.1)
    let pricePrediction = null;
    try {
      const farmer = await User.findById(req.user._id).select('address');
      const region = farmer?.address?.state || farmer?.address?.city || 'All Regions';
      
      pricePrediction = await pricePredictor.predictPrice(
        req.body.name,
        req.body.category,
        region
      );
    } catch (predictionError) {
      console.error('Price prediction error:', predictionError);
      // Continue without prediction if it fails
    }

    const product = await Product.create(req.body);

    // Send response with price prediction included (Requirement 5.1)
    res.status(201).json({
      success: true,
      data: product,
      pricePrediction: pricePrediction || null
    });

    // Handle notifications asynchronously (non-blocking)
    // This runs after the response is sent
    setImmediate(async () => {
      try {
        // Find all consumers who have saved this farmer
        const savedFarmerDocs = await SavedFarmer.find({
          'farmers.farmer': req.user._id
        }).select('consumer');

        if (savedFarmerDocs.length > 0) {
          // Get farmer name for notification
          const farmer = await User.findById(req.user._id).select('name');
          const farmerName = farmer ? farmer.name : 'A farmer';

          // Create notifications for each consumer who saved this farmer
          const notifications = savedFarmerDocs.map(doc => ({
            user: doc.consumer,
            type: 'product',
            title: `New Product from ${farmerName}`,
            message: `${farmerName} has added a new product: ${product.name}`,
            link: `/products/${product._id}`,
            metadata: {
              farmerId: req.user._id,
              productId: product._id,
              productName: product.name,
            }
          }));

          // Bulk insert notifications
          await Notification.insertMany(notifications);
        }
      } catch (notificationError) {
        // Log error but don't affect the product creation response
        console.error('Error creating notifications for new product:', notificationError);
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get all products with filtering and sorting
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const query = { isActive: true };

    // Search filter by name
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      query.$or = [{ name: searchRegex }];
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by farmer
    if (req.query.farmer) {
      query.farmer = req.query.farmer;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by farming practice
    if (req.query.farmingPractice) {
      query.farmingPractice = req.query.farmingPractice;
    }

    // Filter by location (city or state from farmer's address)
    // This requires a more complex query with population
    let locationFilter = null;
    if (req.query.location) {
      locationFilter = req.query.location;
    }

    // Build the base query
    let productQuery = Product.find(query)
      .populate("farmer", "name address")
      .populate("category", "name");

    // Apply sorting
    let sortOption = {};
    switch (req.query.sortBy) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'popularity':
        sortOption = { totalSales: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // Default to newest
    }

    productQuery = productQuery.sort(sortOption);

    // Execute query
    let products = await productQuery;

    // Apply location filter after population (if needed)
    if (locationFilter) {
      const locationRegex = new RegExp(locationFilter, "i");
      products = products.filter(product => {
        if (!product.farmer || !product.farmer.address) return false;
        const address = product.farmer.address;
        return (
          (address.city && locationRegex.test(address.city)) ||
          (address.state && locationRegex.test(address.state))
        );
      });
    }

    res.json({
      success: true,
      count: products.length,
      data: products,
      filters: {
        category: req.query.category,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        location: req.query.location,
        farmingPractice: req.query.farmingPractice,
        sortBy: req.query.sortBy || 'newest'
      }
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("farmer", "name")
      .populate("category", "name");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Farmer only)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (
      product.farmer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this product",
      });
    }

    // Get price prediction if product name or category is being updated (Requirement 5.1)
    let pricePrediction = null;
    if (req.body.name || req.body.category) {
      try {
        const farmer = await User.findById(req.user._id).select('address');
        const region = farmer?.address?.state || farmer?.address?.city || 'All Regions';
        const productName = req.body.name || product.name;
        const category = req.body.category || product.category;
        
        pricePrediction = await pricePredictor.predictPrice(
          productName,
          category,
          region
        );
      } catch (predictionError) {
        console.error('Price prediction error:', predictionError);
        // Continue without prediction if it fails
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: product,
      pricePrediction: pricePrediction || null
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Farmer only)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Make sure user is the product owner
    if (
      product.farmer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this product",
      });
    }

    await product.remove();

    res.json({
      success: true,
      message: "Product removed",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// @desc    Get farmer products
// @route   GET /api/products/farmer
// @access  Private (Farmer only)
exports.getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).populate(
      "category",
      "name"
    );

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
