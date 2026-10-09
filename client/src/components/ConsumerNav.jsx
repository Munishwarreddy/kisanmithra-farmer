import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaHeart,
  FaStar,
  FaLeaf,
  FaHistory,
  FaBell,
  FaBox,
  FaShoppingCart,
  FaUser,
} from "react-icons/fa";

const ConsumerNav = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/consumer/dashboard",
      icon: FaHome,
      label: "Dashboard",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      path: "/consumer/wishlist",
      icon: FaHeart,
      label: "Wishlist",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      path: "/consumer/recommendations",
      icon: FaStar,
      label: "For You",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      path: "/consumer/saved-farmers",
      icon: FaLeaf,
      label: "Saved Farmers",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      path: "/consumer/order-history",
      icon: FaHistory,
      label: "Order History",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      path: "/consumer/subscriptions",
      icon: FaBox,
      label: "Subscriptions",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      path: "/consumer/notifications",
      icon: FaBell,
      label: "Notifications",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  const quickLinks = [
    { path: "/products", icon: FaShoppingCart, label: "Browse Products" },
    { path: "/farmers", icon: FaLeaf, label: "Find Farmers" },
    { path: "/profile", icon: FaUser, label: "My Profile" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Consumer Hub</h2>

      {/* Main Navigation */}
      <nav className="space-y-2 mb-8">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? `${item.bgColor} ${item.color} font-semibold shadow-md`
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="text-xl" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Links */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
          Quick Links
        </h3>
        <div className="space-y-2">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300"
            >
              <link.icon className="text-lg" />
              <span className="text-sm">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
        <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          Contact our support team for assistance
        </p>
        <Link
          to="/messages"
          className="block text-center bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default ConsumerNav;
