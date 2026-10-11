import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getApiBaseUrl } from "../../utils/apiUrl";

const API_URL = getApiBaseUrl();
const SAVED_FARMERS_KEY = "savedFarmers";
const isMongoId = (id) => /^[a-f\d]{24}$/i.test(String(id || ""));

const readLocalSavedFarmers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED_FARMERS_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const writeLocalSavedFarmers = (farmers) => {
  localStorage.setItem(SAVED_FARMERS_KEY, JSON.stringify(farmers));
};

const withLocalFarmers = (remoteFarmers = []) => {
  const merged = new Map();
  [...remoteFarmers, ...readLocalSavedFarmers()].forEach((entry) => {
    const farmer = entry?.farmer || entry;
    if (farmer?._id) merged.set(String(farmer._id), { farmer });
  });
  return [...merged.values()];
};

export const fetchSavedFarmers = createAsyncThunk(
  "savedFarmers/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/farmers/saved`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const farmers = response.data?.data?.farmers || [];
      return { farmers: withLocalFarmers(farmers) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch saved farmers");
    }
  }
);

export const saveFarmer = createAsyncThunk(
  "savedFarmers/save",
  async (farmer, { rejectWithValue }) => {
    try {
      const farmerData = farmer?.farmerData || farmer?.farmer || (typeof farmer === "object" ? farmer : null);
      const farmerId = farmer?.farmerId || farmerData?._id || farmer;
      if (!farmerId) return rejectWithValue("Farmer ID is required");

      const localFarmers = readLocalSavedFarmers();
      const localIndex = localFarmers.findIndex((item) => String(item._id) === String(farmerId));
      if (!isMongoId(farmerId)) {
        if (!farmerData) return rejectWithValue("Farmer details are required to save this profile");
        if (localIndex === -1) localFarmers.push(farmerData);
        writeLocalSavedFarmers(localFarmers);
        return { localOnly: true, data: { farmers: withLocalFarmers() } };
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/farmers/${farmerId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (farmerData && localIndex === -1) {
        localFarmers.push(farmerData);
        writeLocalSavedFarmers(localFarmers);
      }
      return {
        ...response.data,
        data: {
          ...response.data?.data,
          farmers: withLocalFarmers(response.data?.data?.farmers || []),
        },
      };
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
      if (isMongoId(farmerId)) {
        await axios.delete(`${API_URL}/farmers/${farmerId}/save`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      writeLocalSavedFarmers(readLocalSavedFarmers().filter((farmer) => String(farmer._id) !== String(farmerId)));
      return farmerId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to unsave farmer");
    }
  }
);

const savedFarmersSlice = createSlice({
  name: "savedFarmers",
  initialState: {
    farmers: withLocalFarmers(),
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
        state.farmers = action.payload?.farmers || [];
      })
      .addCase(fetchSavedFarmers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveFarmer.fulfilled, (state, action) => {
        state.farmers = action.payload?.data?.farmers || [];
      })
      .addCase(unsaveFarmer.fulfilled, (state, action) => {
        state.farmers = state.farmers.filter(
          (farmer) => String(farmer.farmer?._id) !== String(action.payload)
        );
      })
      .addCase(saveFarmer.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(unsaveFarmer.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = savedFarmersSlice.actions;
export default savedFarmersSlice.reducer;
