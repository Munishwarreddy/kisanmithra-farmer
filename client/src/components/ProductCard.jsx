import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { FaShoppingCart, FaLeaf, FaStar, FaArrowRight, FaCheckCircle, FaHeart, FaRegHeart } from "react-icons/fa";
import { placeholder } from "../assets";
import "../styles/animations.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const isInWishlist = wishlistItems.some(item => item.product._id === product._id);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholder;
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "consumer") {
      alert("Only consumers can add items to wishlist");
      return;
    }
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 overflow-hidden transform hover:-translate-y-2">
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <img
            src={placeholder}
            alt="placeholder"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.isOrganic && (
            <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-pulse-3d">
              <FaLeaf className="text-xs" />
              Organic
            </span>
          )}
          {product.inStock && (
            <span className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              <FaCheckCircle className="text-xs" />
              In Stock
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-10"
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <FaHeart className="text-red-500 text-lg" />
          ) : (
            <FaRegHeart className="text-gray-600 text-lg hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Quick View Button */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Link
            to={`/products/${product._id}`}
            className="bg-white text-green-600 px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:bg-green-50 transition-colors flex items-center gap-2"
          >
            Quick View
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 p-5">
        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            {product.category?.name || "General"}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-green-600 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-sm ${
                  i < (product.rating || 4)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            ({product.reviewsCount || 0} reviews)
          </span>
        </div>

        {/* Price and Action */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-green-600">
              ₹{product.price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">per {product.unit}</div>
          </div>
          
          <Link
            to={`/products/${product._id}`}
            className="group/btn relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300 overflow-hidden flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              <FaShoppingCart className="text-sm" />
              View
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </div>

      {/* Corner Decoration */}
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-tr-full opacity-5"></div>
    </div>
  );
};

export default ProductCard;
