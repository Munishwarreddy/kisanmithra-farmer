const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const Category = require("../models/CategoryModel");

// @desc    Advanced search across products and farmers
// @route   GET /api/search
// @access  Public
exports.advancedSearch = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();
    const limitNum = parseInt(limit);

    // Search products using text index and regex for more flexible matching
    const productTextSearch = Product.find(
      { 
        $text: { $search: searchQuery },
        isActive: true 
      },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limitNum)
      .populate("farmer", "name")
      .populate("category", "name");

    // Also search by category name
    const categories = await Category.find({
      name: { $regex: searchQuery, $options: "i" }
    }).select("_id");

    const categoryIds = categories.map(cat => cat._id);

    const productCategorySearch = Product.find({
      category: { $in: categoryIds },
      isActive: true
    })
      .limit(limitNum)
      .populate("farmer", "name")
      .populate("category", "name");

    // Search farmers by name using text index
    const farmerSearch = User.find({
      $text: { $search: searchQuery },
      role: "farmer",
      isActive: true
    },
    { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(limitNum)
      .select("name email photo address role");

    // Execute all searches in parallel
    const [productsFromText, productsFromCategory, farmers] = await Promise.all([
      productTextSearch,
      productCategorySearch,
      farmerSearch
    ]);

    // Combine and deduplicate products
    const productMap = new Map();
    [...productsFromText, ...productsFromCategory].forEach(product => {
      if (!productMap.has(product._id.toString())) {
        productMap.set(product._id.toString(), product);
      }
    });

    const products = Array.from(productMap.values()).slice(0, limitNum);

    // Highlight matching terms in results
    const highlightText = (text, query) => {
      if (!text) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    // Add highlighting to products
    const highlightedProducts = products.map(product => {
      const productObj = product.toObject();
      return {
        ...productObj,
        nameHighlighted: highlightText(productObj.name, searchQuery),
        descriptionHighlighted: highlightText(productObj.description, searchQuery),
        type: 'product'
      };
    });

    // Add highlighting to farmers
    const highlightedFarmers = farmers.map(farmer => {
      const farmerObj = farmer.toObject();
      return {
        ...farmerObj,
        nameHighlighted: highlightText(farmerObj.name, searchQuery),
        type: 'farmer'
      };
    });

    res.json({
      success: true,
      query: searchQuery,
      results: {
        products: highlightedProducts,
        farmers: highlightedFarmers,
        totalProducts: highlightedProducts.length,
        totalFarmers: highlightedFarmers.length,
        total: highlightedProducts.length + highlightedFarmers.length
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during search",
      error: error.message
    });
  }
};

// @desc    Get autocomplete suggestions
// @route   GET /api/search/autocomplete
// @access  Public
exports.autocomplete = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const searchQuery = q.trim();
    const limitNum = parseInt(limit);

    // Get product name suggestions
    const productSuggestions = await Product.find({
      name: { $regex: `^${searchQuery}`, $options: "i" },
      isActive: true
    })
      .select("name")
      .limit(limitNum)
      .lean();

    // Get category suggestions
    const categorySuggestions = await Category.find({
      name: { $regex: `^${searchQuery}`, $options: "i" }
    })
      .select("name")
      .limit(limitNum)
      .lean();

    // Get farmer name suggestions
    const farmerSuggestions = await User.find({
      name: { $regex: `^${searchQuery}`, $options: "i" },
      role: "farmer",
      isActive: true
    })
      .select("name")
      .limit(limitNum)
      .lean();

    // Combine suggestions with type labels
    const suggestions = [
      ...productSuggestions.map(p => ({ text: p.name, type: 'product' })),
      ...categorySuggestions.map(c => ({ text: c.name, type: 'category' })),
      ...farmerSuggestions.map(f => ({ text: f.name, type: 'farmer' }))
    ];

    // Remove duplicates and limit
    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(s => [s.text.toLowerCase(), s])).values()
    ).slice(0, limitNum);

    res.json({
      success: true,
      query: searchQuery,
      suggestions: uniqueSuggestions
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during autocomplete",
      error: error.message
    });
  }
};
