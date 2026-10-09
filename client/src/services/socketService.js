import { io } from "socket.io-client";
import { store } from "../redux/store";
import {
  addSentiment,
  addSmartReplies,
  addDealSummary,
  updateDealSummary,
  setSmartRepliesLoading,
  setTranslationLoading,
} from "../redux/slices/aiSlice";
import { addNotification } from "../redux/slices/notificationSlice";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.connected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.connected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Message events
    this.socket.on("message:new", (data) => {
      console.log("New message received:", data);
      // Handle new message - this would be handled by message slice
      // The message already includes translations if available
    });

    // AI Feature events
    this.socket.on("message:sentiment", (data) => {
      console.log("Sentiment received:", data);
      const { messageId, sentiment } = data;
      store.dispatch(addSentiment({ messageId, sentiment }));
    });

    this.socket.on("message:smart-replies", (data) => {
      console.log("Smart replies received:", data);
      const { messageId, replies } = data;
      store.dispatch(addSmartReplies({ messageId, replies }));
    });

    this.socket.on("deal:summary", (data) => {
      console.log("Deal summary received:", data);
      const { conversationId, summary } = data;
      store.dispatch(addDealSummary({ conversationId, summary }));
      
      // Show notification
      store.dispatch(
        addNotification({
          _id: `deal-${Date.now()}`,
          type: "deal_summary",
          message: "New deal summary generated",
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      );
    });

    this.socket.on("deal:updated", (data) => {
      console.log("Deal summary updated:", data);
      const { conversationId, summary } = data;
      store.dispatch(updateDealSummary({ conversationId, summary }));
    });

    this.socket.on("translation:loading", (data) => {
      console.log("Translation loading:", data);
      const { messageId } = data;
      store.dispatch(setTranslationLoading({ messageId, loading: true }));
    });

    this.socket.on("translation:complete", (data) => {
      console.log("Translation complete:", data);
      const { messageId } = data;
      store.dispatch(setTranslationLoading({ messageId, loading: false }));
    });

    this.socket.on("translation:error", (data) => {
      console.log("Translation error:", data);
      const { messageId } = data;
      store.dispatch(setTranslationLoading({ messageId, loading: false }));
    });

    this.socket.on("smart-replies:loading", (data) => {
      console.log("Smart replies loading:", data);
      const { messageId } = data;
      store.dispatch(setSmartRepliesLoading({ messageId, loading: true }));
    });

    // Notification events
    this.socket.on("notification", (data) => {
      console.log("Notification received:", data);
      store.dispatch(addNotification(data));
    });
  }

  // Emit events
  sendMessage(messageData) {
    if (this.socket?.connected) {
      this.socket.emit("message:send", messageData);
    }
  }

  selectSmartReply(data) {
    if (this.socket?.connected) {
      this.socket.emit("smart-reply:select", data);
    }
  }

  confirmDeal(data) {
    if (this.socket?.connected) {
      this.socket.emit("deal:confirm", data);
    }
  }

  editDeal(data) {
    if (this.socket?.connected) {
      this.socket.emit("deal:edit", data);
    }
  }

  joinConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit("conversation:join", { conversationId });
    }
  }

  leaveConversation(conversationId) {
    if (this.socket?.connected) {
      this.socket.emit("conversation:leave", { conversationId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
