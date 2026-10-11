import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "react-toastify"
import { getApiBaseUrl } from "../../utils/apiUrl"

const API_URL = getApiBaseUrl()

const getApiUrl = () => {
  if (!API_URL) {
    throw new Error("The API is not configured. Set VITE_API_URL and redeploy the client.")
  }
  return API_URL
}

// Send message
export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async (messageData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }

      const { data } = await axios.post(`${getApiUrl()}/messages`, messageData, config)
      return data
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      console.error('Send Message Error:', error.response?.data);
      return rejectWithValue(message);
    }
  },
)

// Get conversations
export const getConversations = createAsyncThunk(
  "messages/getConversations",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const { data } = await axios.get(`${getApiUrl()}/messages/conversations`, config)
      return data
    } catch (error) {
      const message = error.response && error.response.data.message ? error.response.data.message : error.message
      return rejectWithValue(message)
    }
  },
)

// Get conversation messages
export const getConversationMessages = createAsyncThunk(
  "messages/getConversationMessages",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const currentUserId = getState().auth.user?._id || getState().auth.user?.id
      if (!currentUserId) {
        return rejectWithValue("Please sign in again to view this conversation")
      }
      const conversationId = [currentUserId, userId].map(String).sort().join("_")
      const { data } = await axios.get(`${getApiUrl()}/messages/${conversationId}`, config)
      return { data: data.data || [], userId: String(userId) }
    } catch (error) {
      const message = error.response && error.response.data.message ? error.response.data.message : error.message
      return rejectWithValue(message)
    }
  },
)

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  "messages/markMessagesAsRead",
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const { data } = await axios.put(`${getApiUrl()}/messages/conversation/${userId}/read`, {}, config)
      return { data, userId }
    } catch (error) {
      const message = error.response && error.response.data.message ? error.response.data.message : error.message
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  conversations: [],
  messages: {},
  currentConversation: null,
  loading: false,
  error: null,
}

const idOf = (value) => String(value?._id || value || "");

const upsertRealtimeMessage = (state, { message, currentUserId, conversationId }) => {
  if (!message || !currentUserId) return;

  const senderId = idOf(message.sender);
  const recipientId = idOf(message.recipient);
  const otherUserId = senderId === currentUserId ? recipientId : senderId;
  if (!otherUserId) return;

  const currentMessages = state.messages[otherUserId] || [];
  const isNewMessage = !currentMessages.some((item) => idOf(item) === idOf(message));
  if (!isNewMessage) return;

  state.messages[otherUserId] = [...currentMessages, message].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const lastMessage = {
    _id: message._id,
    content: message.displayContent || message.content,
    createdAt: message.createdAt,
    isRead: message.isRead,
    senderId,
  };
  const conversation = state.conversations.find(
    (item) => idOf(item.otherUser || item.user) === otherUserId
  );
  const isIncoming = recipientId === currentUserId;

  if (conversation) {
    conversation.lastMessage = lastMessage;
    if (isIncoming && !message.isRead) {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }
  } else {
    const otherUser = senderId === currentUserId ? message.recipient : message.sender;
    state.conversations.push({
      conversationId: conversationId || message.conversationId,
      otherUser,
      lastMessage,
      unreadCount: isIncoming && !message.isRead ? 1 : 0,
    });
  }

  state.conversations.sort(
    (a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
  );
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload
    },
    receiveRealtimeMessage: (state, action) => {
      upsertRealtimeMessage(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false

        const { recipient } = action.payload.data
        const recipientId = recipient._id || recipient

        // Add message to conversation
        if (state.messages[recipientId]) {
          if (!state.messages[recipientId].some((message) => idOf(message) === idOf(action.payload.data))) {
            state.messages[recipientId].push(action.payload.data)
          }
        } else {
          state.messages[recipientId] = [action.payload.data]
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Get conversations
      .addCase(getConversations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false
        const conversations = [...(action.payload.data || [])];
        state.conversations.forEach((current) => {
          const id = idOf(current.otherUser || current.user);
          const index = conversations.findIndex(
            (loaded) => idOf(loaded.otherUser || loaded.user) === id
          );
          if (index === -1) {
            conversations.push(current);
          } else if (
            new Date(current.lastMessage?.createdAt || 0) >
            new Date(conversations[index].lastMessage?.createdAt || 0)
          ) {
            conversations[index] = current;
          }
        });
        state.conversations = conversations.sort(
          (a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0)
        );
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get conversation messages
      .addCase(getConversationMessages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getConversationMessages.fulfilled, (state, action) => {
        state.loading = false
        const existing = state.messages[action.payload.userId] || [];
        const merged = [...action.payload.data];
        existing.forEach((message) => {
          if (!merged.some((item) => idOf(item) === idOf(message))) merged.push(message);
        });
        state.messages[action.payload.userId] = merged.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      })
      .addCase(getConversationMessages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        // Update unread count in conversations
        state.conversations = state.conversations.map((conversation) => {
          if ((conversation.otherUser?._id || conversation.user?._id) === action.payload.userId) {
            return { ...conversation, unreadCount: 0 }
          }
          return conversation
        })

        // Update isRead status in messages
        if (state.messages[action.payload.userId]) {
          state.messages[action.payload.userId] = state.messages[action.payload.userId].map((message) => {
            if (message.sender._id === action.payload.userId && !message.isRead) {
              return { ...message, isRead: true }
            }
            return message
          })
        }
      })
  },
})

export const { clearMessageError, setCurrentConversation, receiveRealtimeMessage } = messageSlice.actions

export default messageSlice.reducer
