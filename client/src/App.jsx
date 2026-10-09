import { useEffect, lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "./redux/slices/authSlice";
import { fetchWishlist } from "./redux/slices/wishlistSlice";
import { fetchSavedFarmers } from "./redux/slices/savedFarmersSlice";
import socketService from "./services/socketService";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import FarmerRoute from "./components/FarmerRoute";
import ConsumerRoute from "./components/ConsumerRoute";
import ScrollToTop from "./components/ScrollToTop";
import Loader from "./components/Loader";
import FloatingChatbot from "./components/FloatingChatbot";

// Public Pages (loaded immediately)
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Lazy-loaded pages for better performance
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FarmersPage = lazy(() => import("./pages/FarmersPage"));
const FarmerDetailPage = lazy(() => import("./pages/FarmerDetailPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Protected Pages
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ConversationPage = lazy(() => import("./pages/ConversationPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/OrderDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ContractsPage = lazy(() => import("./pages/ContractsPage"));
const CreateContractPage = lazy(() => import("./pages/CreateContractPage"));

// Consumer Pages
const ConsumerDashboardPage = lazy(() => import("./pages/consumer/DashboardPage"));
const WishlistPage = lazy(() => import("./pages/consumer/WishlistPage"));
const RecommendationsPage = lazy(() => import("./pages/consumer/RecommendationsPage"));
const SavedFarmersPage = lazy(() => import("./pages/consumer/SavedFarmersPage"));
const OrderHistoryPage = lazy(() => import("./pages/consumer/OrderHistoryPage"));
const NotificationsPage = lazy(() => import("./pages/consumer/NotificationsPage"));
const SubscriptionPage = lazy(() => import("./pages/consumer/SubscriptionPage"));

// Farmer Pages
const FarmerDashboardPage = lazy(() => import("./pages/farmer/DashboardPage"));
const FarmerProductsPage = lazy(() => import("./pages/farmer/ProductsPage"));
const FarmerAddProductPage = lazy(() => import("./pages/farmer/AddProductPage"));
const FarmerEditProductPage = lazy(() => import("./pages/farmer/EditProductPage"));
const FarmerOrdersPage = lazy(() => import("./pages/farmer/OrdersPage"));
const FarmerProfilePage = lazy(() => import("./pages/farmer/ProfilePage"));

// Admin Pages
const AdminDashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/CategoriesPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/OrdersPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/ProductsPage"));
const AdminReviewsPage = lazy(() => import("./pages/admin/ReviewsPage"));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Fetch wishlist and saved farmers when user is authenticated as consumer
  useEffect(() => {
    if (isAuthenticated && user?.role === "consumer") {
      dispatch(fetchWishlist());
      dispatch(fetchSavedFarmers());
    }
  }, [isAuthenticated, user, dispatch]);

  // Initialize Socket.IO connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect(token);
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="farmers" element={<FarmersPage />} />
            <Route path="farmers/:id" element={<FarmerDetailPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:userId" element={<ConversationPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/create" element={<CreateContractPage />} />
          </Route>

          {/* Consumer Routes */}
          <Route element={<ConsumerRoute />}>
            <Route path="consumer/dashboard" element={<ConsumerDashboardPage />} />
            <Route path="consumer/wishlist" element={<WishlistPage />} />
            <Route path="consumer/recommendations" element={<RecommendationsPage />} />
            <Route path="consumer/saved-farmers" element={<SavedFarmersPage />} />
            <Route path="consumer/order-history" element={<OrderHistoryPage />} />
            <Route path="consumer/notifications" element={<NotificationsPage />} />
            <Route path="consumer/subscriptions" element={<SubscriptionPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
          </Route>

          {/* Farmer Routes */}
          <Route element={<FarmerRoute />}>
            <Route path="farmer/dashboard" element={<FarmerDashboardPage />} />
            <Route path="farmer/products" element={<FarmerProductsPage />} />
            <Route
              path="farmer/products/add"
              element={<FarmerAddProductPage />}
            />
            <Route
              path="farmer/products/edit/:id"
              element={<FarmerEditProductPage />}
            />
            <Route path="farmer/orders" element={<FarmerOrdersPage />} />
            <Route path="farmer/profile" element={<FarmerProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/products" element={<AdminProductsPage />} />
            <Route path="admin/reviews" element={<AdminReviewsPage />} />
            <Route path="admin/categories" element={<AdminCategoriesPage />} />
            <Route path="admin/orders" element={<AdminOrdersPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      </Suspense>
      <FloatingChatbot />
    </>
  );
}

export default App;
