"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { fetchNotifications } from "../redux/slices/notificationSlice";
import {
  FaLeaf,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import "../styles/animations.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const { unreadCount } = useSelector((state) => state.notifications);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-3d sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <FaLeaf className="relative text-green-500 text-3xl group-hover:text-green-600 transition-all duration-300 animate-pulse-3d" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              KisanMithra
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="relative text-gray-700 hover:text-green-500 transition-all duration-300 font-semibold group"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/products"
              className="relative text-gray-700 hover:text-green-500 transition-all duration-300 font-semibold group"
            >
              <span>Products</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/farmers"
              className="relative text-gray-700 hover:text-green-500 transition-all duration-300 font-semibold group"
            >
              <span>Farmers</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/contracts"
                className="relative text-gray-700 hover:text-green-500 transition-all duration-300 font-semibold group"
              >
                <span>Contracts</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            <Link
              to="/about"
              className="relative text-gray-700 hover:text-green-500 transition-all duration-300 font-semibold group"
            >
              <span>About</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
            </Link>

            {isAuthenticated && user?.role === "consumer" && (
              <>
                <Link to="/consumer/notifications" className="relative group">
                  <div className="relative">
                    <FaBell className="text-gray-700 group-hover:text-green-500 text-2xl transition-all duration-300 transform group-hover:scale-110" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse-3d">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
                
                <Link to="/checkout" className="relative group">
                  <div className="relative">
                    <FaShoppingCart className="text-gray-700 group-hover:text-green-500 text-2xl transition-all duration-300 transform group-hover:scale-110" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-glow-green animate-pulse-3d">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300 focus:outline-none"
                >
                  <FaUser className="text-lg" />
                  <span>
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-3d py-2 z-10 border border-gray-100 animate-fade-in-scale">
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        🎯 Admin Dashboard
                      </Link>
                    )}

                    {user?.role === "farmer" && (
                      <Link
                        to="/farmer/dashboard"
                        className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        🚜 Farmer Dashboard
                      </Link>
                    )}

                    {user?.role === "consumer" && (
                      <>
                        <Link
                          to="/consumer/dashboard"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          📊 My Dashboard
                        </Link>
                        <Link
                          to="/consumer/wishlist"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          ❤️ Wishlist
                        </Link>
                        <Link
                          to="/consumer/recommendations"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          ⭐ For You
                        </Link>
                        <Link
                          to="/consumer/saved-farmers"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          🌾 Saved Farmers
                        </Link>
                        <Link
                          to="/consumer/order-history"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          📦 Order History
                        </Link>
                        <Link
                          to="/consumer/subscriptions"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          🔄 Subscriptions
                        </Link>
                        <Link
                          to="/consumer/notifications"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          🔔 Notifications
                        </Link>
                      </>
                    )}

                    {user?.role !== "admin" && (
                      <>
                        <Link
                          to="/profile"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          👤 Profile
                        </Link>

                        <Link
                          to="/orders"
                          className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          📦 Orders
                        </Link>
                      </>
                    )}

                    <Link
                      to="/messages"
                      className="block px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-300 font-medium"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      💬 Messages
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-300 font-medium rounded-b-2xl"
                    >
                      <div className="flex items-center space-x-2">
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-500 transition-all duration-300 font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-green-500 focus:outline-none"
            >
              {isMenuOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-3d p-4 animate-slide-up">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-green-500 transition-colors"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-green-500 transition-colors"
                onClick={toggleMenu}
              >
                Products
              </Link>
              <Link
                to="/farmers"
                className="text-gray-700 hover:text-green-500 transition-colors"
                onClick={toggleMenu}
              >
                Farmers
              </Link>
              {isAuthenticated && (
                <Link
                  to="/contracts"
                  className="text-gray-700 hover:text-green-500 transition-colors"
                  onClick={toggleMenu}
                >
                  Contracts
                </Link>
              )}
              <Link
                to="/about"
                className="text-gray-700 hover:text-green-500 transition-colors"
                onClick={toggleMenu}
              >
                About
              </Link>

              {isAuthenticated && user?.role === "consumer" && (
                <>
                  <Link
                    to="/consumer/notifications"
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    <FaBell />
                    <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                  </Link>
                  
                  <Link
                    to="/checkout"
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    <FaShoppingCart />
                    <span>Cart ({cartItems.length})</span>
                  </Link>
                </>
              )}
              {isAuthenticated ? (
                <>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 hover:text-green-500 transition-colors"
                      onClick={toggleMenu}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {user?.role === "farmer" && (
                    <Link
                      to="/farmer/dashboard"
                      className="text-gray-700 hover:text-green-500 transition-colors"
                      onClick={toggleMenu}
                    >
                      Farmer Dashboard
                    </Link>
                  )}

                  {user?.role === "consumer" && (
                    <>
                      <Link
                        to="/consumer/dashboard"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        📊 My Dashboard
                      </Link>
                      <Link
                        to="/consumer/wishlist"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        ❤️ Wishlist
                      </Link>
                      <Link
                        to="/consumer/recommendations"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        ⭐ For You
                      </Link>
                      <Link
                        to="/consumer/saved-farmers"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        🌾 Saved Farmers
                      </Link>
                      <Link
                        to="/consumer/order-history"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        📦 Order History
                      </Link>
                      <Link
                        to="/consumer/subscriptions"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        🔄 Subscriptions
                      </Link>
                      <Link
                        to="/consumer/notifications"
                        className="text-gray-700 hover:text-green-500 transition-colors"
                        onClick={toggleMenu}
                      >
                        🔔 Notifications
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-green-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>

                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-green-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    Orders
                  </Link>

                  <Link
                    to="/messages"
                    className="text-gray-700 hover:text-green-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    Messages
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-green-500 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-green-500 transition-colors"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center"
                    onClick={toggleMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
