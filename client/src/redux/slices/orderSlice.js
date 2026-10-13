import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"
import { toast } from "react-toastify"
import { clearCart } from "./cartSlice"
import { getApiBaseUrl } from "../../utils/apiUrl"

const API_URL = getApiBaseUrl()
const isMongoId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""))
const demoOrdersKey = (userId) => `demoOrders:${userId}`
const allDemoOrdersKey = "demoOrders:all"

const readAllDemoOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(allDemoOrdersKey) || "[]")
  } catch {
    return []
  }
}

const saveAllDemoOrders = (orders) => {
  localStorage.setItem(allDemoOrdersKey, JSON.stringify(orders))
}

const normalizeOrder = (order) =>
  order?.status === "placed" ? { ...order, status: "pending" } : order

const readDemoOrders = (userId) => {
  if (!userId) return []
  try {
    return JSON.parse(localStorage.getItem(demoOrdersKey(userId)) || "[]")
  } catch {
    return []
  }
}

const saveDemoOrder = (order, userId) => {
  const orders = readDemoOrders(userId)
  localStorage.setItem(demoOrdersKey(userId), JSON.stringify([order, ...orders]))
  const allOrders = readAllDemoOrders().filter((item) => item._id !== order._id)
  saveAllDemoOrders([order, ...allOrders])
}

const createDemoOrder = (orderData, user) => {
  const now = new Date().toISOString()
  const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const subtotal = orderData.items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  )

  return {
    _id: id,
    orderNumber: id.toUpperCase(),
    consumer: {
      _id: user._id || user.id,
      name: user.name || "Consumer",
      email: user.email || "",
      phone: user.phone || "",
    },
    farmer: {
      _id: orderData.farmer,
      name: orderData.farmerName || "Demo Farmer",
      email: orderData.farmerEmail || "",
    },
    items: orderData.items.map((item, index) => ({
      _id: `${id}-item-${index}`,
      product: {
        _id: item.product,
        name: item.name || "Sample product",
        images: item.image ? [item.image] : [],
      },
      name: item.name || "Sample product",
      unit: item.unit || "kg",
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
    subtotal,
    deliveryFee: 0,
    tax: 0,
    totalAmount: subtotal,
    paymentMethod: orderData.paymentMethod || "cash",
    paymentStatus: "pending",
    status: "pending",
    pickupDetails: orderData.pickupDetails,
    deliveryDetails: orderData.deliveryDetails,
    notes: orderData.notes || "",
    isDemo: true,
    createdAt: now,
    updatedAt: now,
  }
}

// Create order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue, getState, dispatch }) => {
    try {
      const { user, token } = getState().auth
      const userId = user?._id || user?.id
      const hasSampleIds = !isMongoId(orderData.farmer) ||
        orderData.items.some((item) => !isMongoId(item.product))

      if (hasSampleIds) {
        if (!userId) return rejectWithValue("Please sign in again before placing your order.")
        const demoOrder = createDemoOrder(orderData, user)
        saveDemoOrder(demoOrder, userId)
        dispatch(clearCart())
        return { success: true, data: demoOrder, demo: true }
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }

      const { data } = await axios.post(`${API_URL}/orders`, orderData, config)

      // Clear cart after successful order
      dispatch(clearCart())

      return data
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return rejectWithValue(message)
    }
  },
)

// Get consumer orders
export const getConsumerOrders = createAsyncThunk(
  "orders/getConsumerOrders",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const { data } = await axios.get(`${API_URL}/orders/consumer`, config)
      const userId = getState().auth.user?._id || getState().auth.user?.id
      const demoOrders = readDemoOrders(userId)
      return {
        ...data,
        data: [...demoOrders, ...(data.data || [])].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
      }
    } catch (error) {
      const message = error.response && error.response.data.message ? error.response.data.message : error.message
      return rejectWithValue(message)
    }
  },
)

// Get farmer orders
export const getFarmerOrders = createAsyncThunk("orders/getFarmerOrders", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    const { data } = await axios.get(`${API_URL}/orders/farmer`, config)
    const farmerId = getState().auth.user?._id || getState().auth.user?.id
    const demoOrders = readAllDemoOrders()
      .filter((order) => String(order.farmer?._id) === String(farmerId))
      .map(normalizeOrder)
    return {
      ...data,
      data: [...demoOrders, ...(data.data || []).map(normalizeOrder)].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    }
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message
    return rejectWithValue(message)
  }
})

// Get order details
export const getOrderDetails = createAsyncThunk("orders/getOrderDetails", async (id, { rejectWithValue, getState }) => {
  try {
    if (String(id).startsWith("demo-")) {
      const user = getState().auth.user
      const userId = user?._id || user?.id
      const order = [...readDemoOrders(userId), ...readAllDemoOrders()].find(
        (item) => item._id === id &&
          (String(item.consumer?._id) === String(userId) || String(item.farmer?._id) === String(userId))
      )
      if (!order) return rejectWithValue("Demo order not found in this browser.")
      return { success: true, data: order }
    }

    const token = getState().auth.token

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    const { data } = await axios.get(`${API_URL}/orders/${id}`, config)
    return { ...data, data: normalizeOrder(data.data) }
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message
    return rejectWithValue(message)
  }
})

// Update order status (farmer only)
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }

      if (String(id).startsWith("demo-")) {
        const orders = readAllDemoOrders()
        const order = orders.find((item) => item._id === id)
        const userId = getState().auth.user?._id || getState().auth.user?.id
        if (!order || String(order.farmer?._id) !== String(userId)) {
          return rejectWithValue("This demo order is not assigned to your farmer account.")
        }
        const updated = { ...order, status, updatedAt: new Date().toISOString() }
        saveAllDemoOrders(orders.map((item) => item._id === id ? updated : item))
        const consumerOrders = readDemoOrders(order.consumer?._id)
        localStorage.setItem(demoOrdersKey(order.consumer?._id), JSON.stringify(
          consumerOrders.map((item) => item._id === id ? updated : item)
        ))
        return { success: true, data: updated }
      }

      const { data } = await axios.put(`${API_URL}/orders/${id}/status`, { status }, config)
      return data
    } catch (error) {
      const message = error.response && error.response.data.message ? error.response.data.message : error.message
      return rejectWithValue(message)
    }
  },
)

// Get all orders (admin only)
export const getAllOrders = createAsyncThunk("orders/getAllOrders", async (_, { rejectWithValue, getState }) => {
  try {
    const token = getState().auth.token

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    const { data } = await axios.get(`${API_URL}/orders`, config)
    return data
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message
    return rejectWithValue(message)
  }
})

const initialState = {
  orders: [],
  farmerOrders: [],
  adminOrders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
}

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null
    },
    resetOrderSuccess: (state) => {
      state.success = false
    },
    clearOrderDetails: (state) => {
      state.order = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.order = action.payload.data
        state.orders = [action.payload.data, ...state.orders.filter((order) => order._id !== action.payload.data._id)]
        toast.success(action.payload.demo
          ? "Demo order saved in this browser. No farmer was notified."
          : "Order placed successfully!")
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Get consumer orders
      .addCase(getConsumerOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getConsumerOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload.data.map(normalizeOrder)
      })
      .addCase(getConsumerOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get farmer orders
      .addCase(getFarmerOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getFarmerOrders.fulfilled, (state, action) => {
        state.loading = false
        state.farmerOrders = action.payload.data
      })
      .addCase(getFarmerOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload.data
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false
        state.order = action.payload.data

        // Update order in farmerOrders array
        if (state.farmerOrders.length > 0) {
          state.farmerOrders = state.farmerOrders.map((order) =>
            order._id === action.payload.data._id ? action.payload.data : order,
          )
        }

        // Update order in adminOrders array
        if (state.adminOrders.length > 0) {
          state.adminOrders = state.adminOrders.map((order) =>
            order._id === action.payload.data._id ? action.payload.data : order,
          )
        }

        state.orders = state.orders.map((order) =>
          order._id === action.payload.data._id ? action.payload.data : order,
        )

        toast.success(`Order status updated to ${action.payload.data.status}`)
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      // Get all orders (admin)
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false
        state.adminOrders = action.payload.data
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearOrderError, resetOrderSuccess, clearOrderDetails } = orderSlice.actions

export default orderSlice.reducer
