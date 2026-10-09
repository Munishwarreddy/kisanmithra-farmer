import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getConsumerOrders } from "../../redux/slices/orderSlice";
import { 
  FaShoppingCart, 
  FaBox, 
  FaHeart, 
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaStar,
  FaBell,
  FaHistory,
  FaLeaf
} from "react-icons/fa";
import Loader from "../../components/Loader";

const ConsumerDashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading } = useSelector((state) => state.orders);
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(getConsumerOrders());
  }, [dispatch]);

  const stats = [
    {
      title: "Total Orders",
      value: orders?.length || 0,
      icon: FaBox,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Cart Items",
      value: cartItems?.length || 0,
      icon: FaShoppingCart,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Orders",
      value: orders?.filter(o => o.status === "pending")?.length || 0,
      icon: FaClock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Completed",
      value: orders?.filter(o => o.status === "delivered")?.length || 0,
      icon: FaCheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your orders today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="text-white text-2xl" />
                </div>
                <div className={`${stat.bgColor} px-3 py-1 rounded-full`}>
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/products"
            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <FaShoppingCart className="text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Browse Products</h3>
            <p className="text-green-100">Fresh produce from local farmers</p>
          </Link>

          <Link
            to="/consumer/wishlist"
            className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <FaHeart className="text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">My Wishlist</h3>
            <p className="text-pink-100">Saved products & favorites</p>
          </Link>

          <Link
            to="/consumer/recommendations"
            className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <FaStar className="text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">For You</h3>
            <p className="text-orange-100">Personalized recommendations</p>
          </Link>

          <Link
            to="/consumer/saved-farmers"
            className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <FaLeaf className="text-4xl mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Saved Farmers</h3>
            <p className="text-teal-100">Your favorite farmers</p>
          </Link>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/consumer/order-history"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex items-center gap-4"
          >
            <div className="bg-blue-100 p-4 rounded-xl">
              <FaHistory className="text-3xl text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Order History</h3>
              <p className="text-sm text-gray-600">View all past orders</p>
            </div>
          </Link>

          <Link
            to="/consumer/notifications"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex items-center gap-4"
          >
            <div className="bg-purple-100 p-4 rounded-xl">
              <FaBell className="text-3xl text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Notifications</h3>
              <p className="text-sm text-gray-600">Manage preferences</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex items-center gap-4"
          >
            <div className="bg-indigo-100 p-4 rounded-xl">
              <FaUser className="text-3xl text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">My Profile</h3>
              <p className="text-sm text-gray-600">Account settings</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Orders</h2>
            <Link
              to="/consumer/order-history"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                <FaShoppingCart />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 font-mono text-sm text-gray-600">
                        #{order._id?.slice(-8)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {order.items?.length} items
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        ₹{order.totalAmount?.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "delivered" 
                            ? "bg-green-100 text-green-700"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-green-600 hover:text-green-700 font-semibold"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboardPage;
