import { FaLeaf, FaBox, FaCommentSlash, FaHeart, FaStar, FaSearch, FaShoppingCart } from "react-icons/fa";

const illustrations = {
  "no-products": { icon: FaBox, color: "from-green-400 to-emerald-500", message: "No products found", sub: "Try adjusting your search or filters" },
  "no-orders": { icon: FaShoppingCart, color: "from-blue-400 to-indigo-500", message: "No orders yet", sub: "Start shopping to see your orders here" },
  "no-messages": { icon: FaCommentSlash, color: "from-purple-400 to-violet-500", message: "No conversations", sub: "Start a conversation with a farmer or consumer" },
  "no-reviews": { icon: FaStar, color: "from-yellow-400 to-orange-500", message: "No reviews yet", sub: "Reviews will appear here once customers share feedback" },
  "no-wishlist": { icon: FaHeart, color: "from-pink-400 to-rose-500", message: "Your wishlist is empty", sub: "Save products you love for easy access later" },
  "no-results": { icon: FaSearch, color: "from-gray-400 to-gray-500", message: "No results found", sub: "Try different keywords or remove filters" },
  "default": { icon: FaLeaf, color: "from-green-400 to-emerald-500", message: "Nothing here yet", sub: "Check back later for updates" },
};

const EmptyState = ({ type = "default", title, subtitle, actionLabel, onAction, actionTo }) => {
  const config = illustrations[type] || illustrations.default;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      {/* Icon Circle with Glow */}
      <div className="relative mb-6">
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} rounded-full blur-xl opacity-30 animate-pulse`}></div>
        <div className={`relative w-24 h-24 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-lg`}>
          <Icon className="text-white text-4xl" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
        {title || config.message}
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        {subtitle || config.sub}
      </p>

      {/* Action Button */}
      {(actionLabel && (onAction || actionTo)) && (
        actionTo ? (
          <a
            href={actionTo}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
          >
            {actionLabel}
          </a>
        ) : (
          <button
            onClick={onAction}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;
