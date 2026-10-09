import { useState } from "react";
import { FaBox, FaCalendarAlt, FaTruck, FaSave, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const SubscriptionPage = () => {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      productName: "Fresh Tomatoes",
      farmerId: "123",
      farmerName: "Ramesh Kumar",
      quantity: 2,
      unit: "kg",
      frequency: "weekly",
      nextDelivery: "2026-02-15",
      price: 40,
      status: "active",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleCancelSubscription = (id) => {
    setSubscriptions(subscriptions.map((sub) => 
      sub.id === id ? { ...sub, status: "cancelled" } : sub
    ));
    toast.success("Subscription cancelled");
  };

  const handlePauseSubscription = (id) => {
    setSubscriptions(subscriptions.map((sub) => 
      sub.id === id ? { ...sub, status: sub.status === "paused" ? "active" : "paused" } : sub
    ));
    toast.success("Subscription updated");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getFrequencyText = (frequency) => {
    switch (frequency) {
      case "daily":
        return "Every Day";
      case "weekly":
        return "Every Week";
      case "biweekly":
        return "Every 2 Weeks";
      case "monthly":
        return "Every Month";
      default:
        return frequency;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Subscriptions 📦</h1>
            <p className="text-gray-600">Manage your recurring product deliveries</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <FaPlus />
            New Subscription
          </button>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Why Subscribe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaTruck className="text-2xl" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Regular Delivery</h3>
                <p className="text-sm text-green-100">Never run out of essentials</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaBox className="text-2xl" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Save 10%</h3>
                <p className="text-sm text-green-100">Exclusive subscriber discount</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Flexible Schedule</h3>
                <p className="text-sm text-green-100">Pause or modify anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Subscription Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Subscription</h2>
            <p className="text-gray-600 mb-4">
              Browse products and look for the "Subscribe" option on product pages
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Active Subscriptions */}
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No subscriptions yet</h2>
            <p className="text-gray-600 mb-6">Start subscribing to get regular deliveries</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{sub.productName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sub.status)}`}>
                        {sub.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      From: <Link to={`/farmers/${sub.farmerId}`} className="text-green-600 hover:underline">{sub.farmerName}</Link>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{sub.price * sub.quantity}</p>
                    <p className="text-sm text-gray-500">per delivery</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quantity</p>
                    <p className="font-semibold text-gray-800">{sub.quantity} {sub.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Frequency</p>
                    <p className="font-semibold text-gray-800">{getFrequencyText(sub.frequency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Next Delivery</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(sub.nextDelivery).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {sub.status !== "cancelled" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handlePauseSubscription(sub.id)}
                      className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                    >
                      {sub.status === "paused" ? "Resume" : "Pause"}
                    </button>
                    <button className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                      Modify
                    </button>
                    <button
                      onClick={() => handleCancelSubscription(sub.id)}
                      className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaTrash />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Subscription Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Subscriptions</h3>
            <p className="text-4xl font-bold text-green-600">
              {subscriptions.filter((s) => s.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Savings</h3>
            <p className="text-4xl font-bold text-blue-600">
              ₹{subscriptions
                .filter((s) => s.status === "active")
                .reduce((acc, sub) => acc + (sub.price * sub.quantity * 0.1), 0)
                .toFixed(0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Next Delivery</h3>
            <p className="text-2xl font-bold text-purple-600">
              {subscriptions.filter((s) => s.status === "active").length > 0
                ? new Date(
                    Math.min(
                      ...subscriptions
                        .filter((s) => s.status === "active")
                        .map((s) => new Date(s.nextDelivery))
                    )
                  ).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
