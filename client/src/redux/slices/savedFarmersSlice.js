import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchSavedFarmers = createAsyncThunk(
  "savedFarmers/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/farmers/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch saved farmers");
    }
  }
);

export const saveFarmer = createAsyncThunk(
  "savedFarmers/save",
  async (farmerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/farmers/${farmerId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to save farmer");
    }
  }
);

export const unsaveFarmer = createAsyncThunk(
  "savedFarmers/unsave",
  async (farmerId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/farmers/${farmerId}/save`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return farmerId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to unsave farmer");
    }
  }
);

const savedFarmersSlice = createSlice({
  name: "savedFarmers",
  initialState: {
    farmers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedFarmers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedFarmers.fulfilled, (state, action) => {
        state.loading = false;
        state.farmers = action.payload?.data?.farmers || [];
      })
      .addCase(fetchSavedFarmers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveFarmer.fulfilled, (state, action) => {
        state.farmers = action.payload?.data?.farmers || [];
      })
      .addCase(unsaveFarmer.fulfilled, (state, action) => {
        state.farmers = state.farmers.filter(farmer => farmer.farmer?._id !== action.payload);
      });
  },
});

export const { clearError } = savedFarmersSlice.actions;
export default savedFarmersSlice.reducer;
