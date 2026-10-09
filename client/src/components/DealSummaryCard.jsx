import { useState } from "react";
import { useDispatch } from "react-redux";
import { confirmDealSummary } from "../redux/slices/aiSlice";
import socketService from "../services/socketService";
import { toast } from "react-toastify";

const DealSummaryCard = ({ summary, conversationId, onEdit }) => {
  const dispatch = useDispatch();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!summary) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await dispatch(confirmDealSummary(summary._id)).unwrap();
      socketService.confirmDeal({
        dealSummaryId: summary._id,
        conversationId,
      });
      toast.success("Deal confirmed successfully!");
    } catch (error) {
      toast.error(error || "Failed to confirm deal");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(summary);
    }
    socketService.editDeal({
      dealSummaryId: summary._id,
      conversationId,
      updates: summary,
    });
  };

  const isConfirmed = summary.status === "confirmed";
  const isConverted = summary.status === "converted_to_order";

  return (
    <div className="my-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          <h3 className="text-lg font-bold text-gray-800">Deal Summary</h3>
        </div>
        {isConfirmed && (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full border border-green-300">
            ✓ CONFIRMED
          </span>
        )}
        {isConverted && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-300">
            📦 ORDER PLACED
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {summary.product?.name && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Product</div>
            <div className="font-semibold text-gray-800">{summary.product.name}</div>
          </div>
        )}

        {summary.quantity && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Quantity</div>
            <div className="font-semibold text-gray-800">{summary.quantity}</div>
          </div>
        )}

        {summary.agreedPrice && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Agreed Price</div>
            <div className="font-semibold text-gray-800">{summary.agreedPrice}</div>
          </div>
        )}

        {summary.deliveryDate && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Delivery Date</div>
            <div className="font-semibold text-gray-800">{summary.deliveryDate}</div>
          </div>
        )}
      </div>

      {summary.confidence && (
        <div className="mb-3 text-xs text-gray-600">
          Confidence: {Math.round(summary.confidence * 100)}%
        </div>
      )}

      {!isConfirmed && !isConverted && (
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? "Confirming..." : "✓ Confirm Deal"}
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors font-medium"
          >
            ✏️ Edit
          </button>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 italic">
        Generated {new Date(summary.extractedAt || summary.createdAt).toLocaleString()}
      </div>
    </div>
  );
};

export default DealSummaryCard;
