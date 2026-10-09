import { FaCalendarAlt, FaBox, FaRupeeSign, FaCheck, FaTimes, FaEdit } from "react-icons/fa";

const ContractCard = ({ contract, onView, onAction }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      rejected: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">
            {contract.product?.name}
          </h3>
          <p className="text-sm text-gray-600">
            Contract #{contract.contractNumber}
          </p>
          <p className="text-sm text-gray-600">
            {contract.otherParty?.role === "farmer" ? "Farmer" : "Consumer"}: {contract.otherParty?.name}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.status)}`}>
          {getStatusLabel(contract.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <FaBox className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="font-semibold">{contract.quantity} {contract.unit}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FaRupeeSign className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Total Value</p>
            <p className="font-semibold">₹{contract.totalValue?.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <FaCalendarAlt className="text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-semibold">{contract.duration} months</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-semibold text-gray-800">{formatDate(contract.startDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500">End Date</p>
            <p className="font-semibold text-gray-800">{formatDate(contract.endDate)}</p>
          </div>
        </div>
      </div>

      {contract.deliveries && contract.deliveries.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Deliveries: {contract.deliveries.filter(d => d.status === "completed").length} / {contract.deliveries.length} completed
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{
                width: `${(contract.deliveries.filter(d => d.status === "completed").length / contract.deliveries.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onView(contract._id)}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          View Details
        </button>

        {contract.status === "pending" && onAction && (
          <>
            <button
              onClick={() => onAction(contract._id, "accept")}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              title="Accept"
            >
              <FaCheck />
            </button>
            <button
              onClick={() => onAction(contract._id, "reject")}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              title="Reject"
            >
              <FaTimes />
            </button>
            <button
              onClick={() => onAction(contract._id, "modify")}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              title="Propose Modification"
            >
              <FaEdit />
            </button>
          </>
        )}

        {contract.status === "active" && onAction && (
          <button
            onClick={() => onAction(contract._id, "cancel")}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractCard;
