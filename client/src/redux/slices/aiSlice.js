import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Fetch smart replies for a message
export const fetchSmartReplies = createAsyncThunk(
  "ai/fetchSmartReplies",
  async ({ messageId, productId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/ai/smart-replies`,
        { messageId, productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { messageId, replies: response.data.replies };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch smart replies"
      );
    }
  }
);

// Fetch price prediction
export const fetchPricePrediction = createAsyncThunk(
  "ai/fetchPricePrediction",
  async ({ productName, category, region }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/ai/price-prediction`,
        { productName, category, region },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch price prediction"
      );
    }
  }
);

// Fetch deal summary
export const fetchDealSummary = createAsyncThunk(
  "ai/fetchDealSummary",
  async (conversationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/ai/deal-summary/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch deal summary"
      );
    }
  }
);

// Generate deal summary manually
export const generateDealSummary = createAsyncThunk(
  "ai/generateDealSummary",
  async (conversationId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/ai/deal-summary`,
        { conversationId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate deal summary"
      );
    }
  }
);

// Confirm deal summary
export const confirmDealSummary = createAsyncThunk(
  "ai/confirmDealSummary",
  async (dealSummaryId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/ai/deal-summary/${dealSummaryId}`,
        { status: "confirmed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to confirm deal summary"
      );
    }
  }
);

// Update user language preference
export const updateLanguagePreference = createAsyncThunk(
  "ai/updateLanguagePreference",
  async (language, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/users/preferences`,
        { language },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update language preference"
      );
    }
  }
);

const initialState = {
  // Smart replies by message ID
  smartReplies: {},
  // Sentiment by message ID
  sentiments: {},
  // Deal summaries by conversation ID
  dealSummaries: {},
  // Price predictions by product key
  pricePredictions: {},
  // Loading states
  loading: {
    smartReplies: {},
    sentiment: {},
    dealSummary: false,
    pricePrediction: false,
    languagePreference: false,
  },
  // Errors
  errors: {
    smartReplies: null,
    sentiment: null,
    dealSummary: null,
    pricePrediction: null,
    languagePreference: null,
  },
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    clearError: (state, action) => {
      const { errorType } = action.payload;
      if (errorType && state.errors[errorType] !== undefined) {
        state.errors[errorType] = null;
      }
    },
    // Socket.IO event handlers
    addSentiment: (state, action) => {
      const { messageId, sentiment } = action.payload;
      state.sentiments[messageId] = sentiment;
    },
    addSmartReplies: (state, action) => {
      const { messageId, replies } = action.payload;
      state.smartReplies[messageId] = replies;
      state.loading.smartReplies[messageId] = false;
    },
    addDealSummary: (state, action) => {
      const { conversationId, summary } = action.payload;
      state.dealSummaries[conversationId] = summary;
    },
    updateDealSummary: (state, action) => {
      const { conversationId, summary } = action.payload;
      state.dealSummaries[conversationId] = summary;
    },
    setSmartRepliesLoading: (state, action) => {
      const { messageId, loading } = action.payload;
      state.loading.smartReplies[messageId] = loading;
    },
    setTranslationLoading: (state, action) => {
      const { messageId, loading } = action.payload;
      if (!state.loading.translation) {
        state.loading.translation = {};
      }
      state.loading.translation[messageId] = loading;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch smart replies
      .addCase(fetchSmartReplies.pending, (state, action) => {
        const { messageId } = action.meta.arg;
        state.loading.smartReplies[messageId] = true;
        state.errors.smartReplies = null;
      })
      .addCase(fetchSmartReplies.fulfilled, (state, action) => {
        const { messageId, replies } = action.payload;
        state.smartReplies[messageId] = replies;
        state.loading.smartReplies[messageId] = false;
      })
      .addCase(fetchSmartReplies.rejected, (state, action) => {
        const { messageId } = action.meta.arg;
        state.loading.smartReplies[messageId] = false;
        state.errors.smartReplies = action.payload;
      })
      // Fetch price prediction
      .addCase(fetchPricePrediction.pending, (state) => {
        state.loading.pricePrediction = true;
        state.errors.pricePrediction = null;
      })
      .addCase(fetchPricePrediction.fulfilled, (state, action) => {
        const { productName, category, region } = action.meta.arg;
        const key = `${productName}-${category}-${region}`;
        state.pricePredictions[key] = action.payload;
        state.loading.pricePrediction = false;
      })
      .addCase(fetchPricePrediction.rejected, (state, action) => {
        state.loading.pricePrediction = false;
        state.errors.pricePrediction = action.payload;
      })
      // Fetch deal summary
      .addCase(fetchDealSummary.pending, (state) => {
        state.loading.dealSummary = true;
        state.errors.dealSummary = null;
      })
      .addCase(fetchDealSummary.fulfilled, (state, action) => {
        const conversationId = action.meta.arg;
        state.dealSummaries[conversationId] = action.payload;
        state.loading.dealSummary = false;
      })
      .addCase(fetchDealSummary.rejected, (state, action) => {
        state.loading.dealSummary = false;
        state.errors.dealSummary = action.payload;
      })
      // Generate deal summary
      .addCase(generateDealSummary.pending, (state) => {
        state.loading.dealSummary = true;
        state.errors.dealSummary = null;
      })
      .addCase(generateDealSummary.fulfilled, (state, action) => {
        const conversationId = action.meta.arg;
        state.dealSummaries[conversationId] = action.payload;
        state.loading.dealSummary = false;
      })
      .addCase(generateDealSummary.rejected, (state, action) => {
        state.loading.dealSummary = false;
        state.errors.dealSummary = action.payload;
      })
      // Confirm deal summary
      .addCase(confirmDealSummary.fulfilled, (state, action) => {
        const summary = action.payload;
        if (summary.conversationId) {
          state.dealSummaries[summary.conversationId] = summary;
        }
      })
      // Update language preference
      .addCase(updateLanguagePreference.pending, (state) => {
        state.loading.languagePreference = true;
        state.errors.languagePreference = null;
      })
      .addCase(updateLanguagePreference.fulfilled, (state) => {
        state.loading.languagePreference = false;
      })
      .addCase(updateLanguagePreference.rejected, (state, action) => {
        state.loading.languagePreference = false;
        state.errors.languagePreference = action.payload;
      });
  },
});

export const {
  clearError,
  addSentiment,
  addSmartReplies,
  addDealSummary,
  updateDealSummary,
  setSmartRepliesLoading,
  setTranslationLoading,
} = aiSlice.actions;

export default aiSlice.reducer;
