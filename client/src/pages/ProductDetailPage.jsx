"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getProductDetails,
  clearProductDetails,
} from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { sendMessage } from "../redux/slices/messageSlice";
import { addToWishlist, removeFromWishlist } from "../redux/slices/wishlistSlice";
import { createSubscription } from "../redux/slices/subscriptionSlice";
import Loader from "../components/Loader";
import {
  FaLeaf,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaUser,
  FaComment,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import { placeholder } from "../assets";

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState({
    frequency: "weekly",
    quantity: 1,
    startDate: new Date().toISOString().split('T')[0],
  });

  const { product, loading, error } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cartItems, farmerId } = useSelector((state) => state.cart);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  
  const isInWishlist = wishlistItems.some(item => item.product._id === product?._id);

  useEffect(() => {
    dispatch(getProductDetails(id));

    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  const handleQuantityChange = (e) => {
    const value = Number.parseInt(e.target.value);
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user.role === "farmer") {
      alert("Farmers cannot place orders. Please use a consumer account.");
      return;
    }

    if (farmerId && farmerId !== product.farmer._id && cartItems.length > 0) {
      if (
        !confirm(
          "Your cart contains items from a different farm. Would you like to clear your cart and add this item?"
        )
      ) {
        return;
      }
    }

    dispatch(addToCart({ product, quantity }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!message.trim()) {
      return;
    }

    dispatch(
      sendMessage({
        recipient: product.farmer._id || product.farmer,
        content: message,
      })
    );

    setMessage("");
    setShowMessageForm(false);
  };

  const handleWishlistToggle = () => {
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

  const handleSubscriptionSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "consumer") {
      alert("Only consumers can create subscriptions");
      return;
    }
    
    dispatch(createSubscription({
      product: product._id,
      ...subscriptionData,
    })).then((result) => {
      if (result.type === "subscriptions/create/fulfilled") {
        alert("Subscription created successfully!");
        setShowSubscriptionModal(false);
        setSubscriptionData({
          frequency: "weekly",
          quantity: 1,
          startDate: new Date().toISOString().split('T')[0],
        });
      }
    });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholder;
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
        <Link
          to="/products"
          className="mt-4 inline-block text-green-500 hover:text-green-700"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/products"
        className="flex items-center text-green-500 hover:text-green-700 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 h-80">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
            ) : (
              <div>
                <img
                  src={placeholder}
                  alt="placeholder"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`cursor-pointer rounded-lg overflow-hidden h-20 ${
                    activeImage === index ? "ring-2 ring-green-500" : ""
                  }`}
                  onClick={() => setActiveImage(index)}
                >
                  <img
                    src={image || placeholder}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <span className="text-gray-600 mr-4">
              Category: {product.category?.name || "General"}
            </span>
            {product.isOrganic && (
              <span className="badge badge-green">Organic</span>
            )}
          </div>

          <div className="text-2xl font-bold text-green-600 mb-4">
            ₨{product.price.toFixed(2)} / {product.unit}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <FaLeaf className="text-green-500 mr-2" />
              <span className="font-medium">Available Quantity:</span>
              <span className="ml-2">
                {product.quantityAvailable} {product.unit}
              </span>
            </div>

            {product.harvestDate && (
              <div className="flex items-center mb-2">
                <FaLeaf className="text-green-500 mr-2" />
                <span className="font-medium">Harvest Date:</span>
                <span className="ml-2">
                  {new Date(product.harvestDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Farmer Information</h3>
            <div className="flex items-center mb-2">
              <FaUser className="text-green-500 mr-2" />
              <span>{product.farmer?.name}</span>
            </div>
            {product.farmer?.address && (
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className="text-green-500 mr-2" />
                <span>
                  {product.farmer.address.city}, {product.farmer.address.state}
                </span>
              </div>
            )}
            <Link
              to={`/farmers/${product.farmer?._id}`}
              className="text-green-500 hover:text-green-700 font-medium"
            >
              View Farm Profile
            </Link>
          </div>

          {user?.role !== "farmer" && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-full sm:w-1/4">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.quantityAvailable}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="form-input pl-3"
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <button
                    onClick={handleAddToCart}
                    className="w-full btn btn-primary flex items-center justify-center space-x-2"
                    disabled={product.quantityAvailable === 0}
                  >
                    <FaShoppingCart />
                    <span>
                      {product.quantityAvailable === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </span>
                  </button>
                </div>
                <div className="w-full sm:w-1/4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    &nbsp;
                  </label>
                  <button
                    onClick={handleWishlistToggle}
                    className={`w-full btn flex items-center justify-center space-x-2 ${
                      isInWishlist 
                        ? "bg-red-500 hover:bg-red-600 text-white" 
                        : "btn-outline"
                    }`}
                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isInWishlist ? <FaHeart /> : <FaRegHeart />}
                    <span>{isInWishlist ? "Saved" : "Save"}</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="w-full btn bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center space-x-2"
                >
                  <FaSync />
                  <span>Subscribe for Regular Delivery</span>
                </button>
              </div>
            </>
          )}

          {isAuthenticated && user?.role !== "farmer" && (
            <div>
              {showMessageForm ? (
                <form onSubmit={handleSendMessage} className="mb-4">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message to Farmer
                  </label>
                  <textarea
                    id="message"
                    rows="3"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="form-input mb-2 pl-3"
                    placeholder="Ask a question about this product..."
                    required
                  ></textarea>
                  <div className="flex space-x-2">
                    <button type="submit" className="btn btn-primary">
                      Send Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMessageForm(false)}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowMessageForm(true)}
                  className="flex items-center space-x-2 text-green-500 hover:text-green-700"
                >
                  <FaComment />
                  <span c>Message Farmer</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Create Subscription</h3>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubscriptionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Frequency
                </label>
                <select
                  value={subscriptionData.frequency}
                  onChange={(e) => setSubscriptionData({...subscriptionData, frequency: e.target.value})}
                  className="form-input pl-3"
                  required
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity per Delivery
                </label>
                <input
                  type="number"
                  min="1"
                  value={subscriptionData.quantity}
                  onChange={(e) => setSubscriptionData({...subscriptionData, quantity: Number(e.target.value)})}
                  className="form-input pl-3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={subscriptionData.startDate}
                  onChange={(e) => setSubscriptionData({...subscriptionData, startDate: e.target.value})}
                  className="form-input pl-3"
                  required
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Product:</strong> {product.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Price per delivery:</strong> ₹{(product.price * subscriptionData.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Next delivery:</strong> {new Date(subscriptionData.startDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Create Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
