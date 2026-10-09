import { FaCalendarAlt, FaBox, FaPause, FaPlay, FaTimes } from "react-icons/fa";
import { placeholder } from "../assets";

const SubscriptionCard = ({ subscription, onManage }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    };
    return labels[frequency] || frequency;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = placeholder;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <img
            src={subscription.product?.image || subscription.product?.images?.[0] || placeholder}
            alt={subscription.product?.name}
            onError={handleImageError}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {subscription.product?.name}
              </h3>
              <p className="text-sm text-gray-600">
                From: {subscription.farmer?.name}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                subscription.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {subscription.status === "active" ? "Active" : "Paused"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <FaBox className="text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-semibold">{subscription.quantity} {subscription.product?.unit}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <FaCalendarAlt className="text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Frequency</p>
                <p className="font-semibold">{getFrequencyLabel(subscription.frequency)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600">Next Delivery</p>
            <p className="text-lg font-bold text-green-600">
              {formatDate(subscription.nextDeliveryDate)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onManage(subscription._id)}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Manage
            </button>
            {subscription.status === "active" ? (
              <button
                onClick={() => onManage(subscription._id, "pause")}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                title="Pause"
              >
                <FaPause />
              </button>
            ) : (
              <button
                onClick={() => onManage(subscription._id, "resume")}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                title="Resume"
              >
                <FaPlay />
              </button>
            )}
            <button
              onClick={() => onManage(subscription._id, "cancel")}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              title="Cancel"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
