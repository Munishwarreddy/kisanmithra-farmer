import { useState, useEffect } from "react";
import { FaBell, FaEnvelope, FaMobileAlt, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";

const NotificationsPage = () => {
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    newProducts: true,
    priceDrops: true,
    promotions: false,
    newsletter: true,
    smsNotifications: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("notificationPreferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    toast.success("Notification preferences saved!");
  };

  const NotificationToggle = ({ title, description, value, onChange, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-start gap-4">
        <div className="bg-green-100 p-3 rounded-lg">
          <Icon className="text-green-600 text-xl" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Notification Settings 🔔</h1>
          <p className="text-gray-600">Manage how you receive updates and alerts</p>
        </div>

        {/* Notification Channels */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notification Channels</h2>
          <div className="space-y-4">
            <NotificationToggle
              title="Email Notifications"
              description="Receive updates via email"
              value={preferences.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
              icon={FaEnvelope}
            />
            <NotificationToggle
              title="Push Notifications"
              description="Get instant alerts in your browser"
              value={preferences.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
              icon={FaBell}
            />
            <NotificationToggle
              title="SMS Notifications"
              description="Receive text messages for important updates"
              value={preferences.smsNotifications}
              onChange={() => handleToggle("smsNotifications")}
              icon={FaMobileAlt}
            />
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">What to Notify</h2>
          <div className="space-y-4">
            <NotificationToggle
              title="Order Updates"
              description="Get notified about order status changes"
              value={preferences.orderUpdates}
              onChange={() => handleToggle("orderUpdates")}
              icon={FaBell}
            />
            <NotificationToggle
              title="New Products"
              description="Alert me when farmers add new products"
              value={preferences.newProducts}
              onChange={() => handleToggle("newProducts")}
              icon={FaBell}
            />
            <NotificationToggle
              title="Price Drops"
              description="Notify when products in my wishlist go on sale"
              value={preferences.priceDrops}
              onChange={() => handleToggle("priceDrops")}
              icon={FaBell}
            />
            <NotificationToggle
              title="Promotions & Offers"
              description="Receive special deals and promotional offers"
              value={preferences.promotions}
              onChange={() => handleToggle("promotions")}
              icon={FaBell}
            />
            <NotificationToggle
              title="Newsletter"
              description="Weekly newsletter with farming tips and recipes"
              value={preferences.newsletter}
              onChange={() => handleToggle("newsletter")}
              icon={FaEnvelope}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center gap-3 shadow-lg"
          >
            <FaSave />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
