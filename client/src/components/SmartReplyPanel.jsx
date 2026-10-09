import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSmartReplies } from "../redux/slices/aiSlice";
import socketService from "../services/socketService";

const categoryIcons = {
  pricing: "💰",
  quantity: "📦",
  delivery: "🚚",
  general: "💬",
};

const SmartReplyPanel = ({ messageId, productId, conversationId, onSelectReply }) => {
  const dispatch = useDispatch();
  const { smartReplies, loading } = useSelector((state) => state.ai);
  const { user } = useSelector((state) => state.auth);
  
  const replies = smartReplies[messageId] || [];
  const isLoading = loading.smartReplies[messageId];

  useEffect(() => {
    // Fetch smart replies when component mounts
    if (messageId && !replies.length && !isLoading) {
      dispatch(fetchSmartReplies({ messageId, productId }));
    }
  }, [messageId, productId, dispatch, replies.length, isLoading]);

  const handleSelectReply = (reply) => {
    if (onSelectReply) {
      onSelectReply(reply.text);
    }
    
    // Emit socket event for smart reply selection
    socketService.selectSmartReply({
      conversationId,
      messageId,
      replyText: reply.text,
      recipient: user._id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="text-sm text-blue-700">Generating smart replies...</span>
      </div>
    );
  }

  if (!replies || replies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
        <span>✨</span>
        <span>Smart Reply Suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => handleSelectReply(reply)}
            className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-sm text-left group"
            title={`Category: ${reply.category} (${Math.round(reply.confidence * 100)}% confidence)`}
          >
            <span className="text-lg">{categoryIcons[reply.category] || categoryIcons.general}</span>
            <span className="text-gray-700 group-hover:text-green-700">{reply.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartReplyPanel;
