import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { products as mockProducts } from "../../data/mockData";

const getFarmerId = (farmer) => farmer?._id || farmer || null;
const normalizeCartItem = (item) => {
  const mockProduct = mockProducts.find((product) => product._id === item.productId);
  const farmer = mockProduct?.farmer;

  return {
    ...item,
    name: item.name || mockProduct?.name,
    image: item.image || mockProduct?.images?.[0] || mockProduct?.image || null,
    unit: item.unit || mockProduct?.unit || "kg",
    farmerId: item.farmerId || getFarmerId(farmer),
    farmerName: item.farmerName || mockProduct?.farmerName || farmer?.name || "Farmer",
    farmerEmail: item.farmerEmail || mockProduct?.farmerEmail || farmer?.email || "",
  };
};

// Get cart from localStorage
const cartItemsFromStorage = localStorage.getItem("cartItems")
  ? JSON.parse(localStorage.getItem("cartItems")).map(normalizeCartItem)
  : [];

const initialState = {
  cartItems: cartItemsFromStorage,
  farmerId:
    cartItemsFromStorage.length > 0 ? cartItemsFromStorage[0].farmerId : null,
  farmerName:
    cartItemsFromStorage.length > 0 ? cartItemsFromStorage[0].farmerName : null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload.product || action.payload;
      const quantity = action.payload.quantity || 1;
      const productFarmer = product.farmer;
      const productFarmerId = getFarmerId(productFarmer) || product.farmerId;
      const productFarmerName = productFarmer?.name || product.farmerName || "Farmer";

      if (
        state.cartItems.length === 0 ||
        String(productFarmerId) === String(state.farmerId)
      ) {
        const existItem = state.cartItems.find(
          (item) => item.productId === product._id
        );

        if (existItem) {
          state.cartItems = state.cartItems.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          toast.info(`Updated ${product.name} quantity in your cart`);
        } else {
          state.cartItems.push({
            productId: product._id,
            name: product.name,
            image:
              product.images && product.images.length > 0
                ? product.images[0]
                : product.image || null,
            unit: product.unit || "kg",
            price: product.price,
            quantity,
            farmerId: productFarmerId,
            farmerName: productFarmerName,
            farmerEmail: product.farmerEmail || productFarmer?.email || "",
          });

          if (state.farmerId === null) {
            state.farmerId = productFarmerId;
            state.farmerName = productFarmerName;
          }

          toast.success(`Added ${product.name} to your cart`);
        }
      } else {
        toast.error(
          "You can only order from one farm at a time. Please clear your cart first."
        );
        return;
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== productId
      );

      if (state.cartItems.length === 0) {
        state.farmerId = null;
        state.farmerName = null;
      }

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      toast.info("Item removed from cart");
    },
    updateCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;

      state.cartItems = state.cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    clearCart: (state) => {
      state.cartItems = [];
      state.farmerId = null;
      state.farmerName = null;

      localStorage.removeItem("cartItems");
      toast.info("Cart cleared");
    },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
