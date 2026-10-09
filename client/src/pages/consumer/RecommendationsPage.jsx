import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getProducts } from "../../redux/slices/productSlice";
import { FaStar, FaFire, FaLeaf, FaShoppingCart } from "react-icons/fa";
import { addToCart } from "../../redux/slices/cartSlice";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const RecommendationsPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);
  const { orders } = useSelector((state) => state.orders);
  const [recommendations, setRecommendations] = useState({
    trending: [],
    seasonal: [],
    basedOnHistory: [],
    organic: [],
  });

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products && products.length > 0) {
      // Trending products (highest rated or most popular)
      const trending = [...products]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);

      // Seasonal products (you can customize based on current season)
      const seasonal = products.filter((p) => p.category?.name?.toLowerCase().includes("seasonal")).slice(0, 6);

      // Based on order history
      const purchasedCategories = new Set();
      orders?.forEach((order) => {
        order.items?.forEach((item) => {
          if (item.product?.category) {
            purchasedCategories.add(item.product.category);
          }
        });
      });

      const basedOnHistory = products
        .filter((p) => purchasedCategories.has(p.category?._id))
        .slice(0, 6);

      // Organic products
      const organic = products.filter((p) => p.isOrganic).slice(0, 6);

      setRecommendations({
        trending,
        seasonal: seasonal.length > 0 ? seasonal : trending.slice(0, 6),
        basedOnHistory: basedOnHistory.length > 0 ? basedOnHistory : trending.slice(0, 6),
        organic: organic.length > 0 ? organic : trending.slice(0, 6),
      });
    }
  }, [products, orders]);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success("Added to cart!");
  };

  if (loading) return <Loader />;

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.isOrganic && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FaLeaf />
            Organic
          </div>
        )}
        {product.rating && (
          <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            {product.rating}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xl font-bold text-green-600">₹{product.price}</span>
          <span className="text-sm text-gray-500">per {product.unit}</span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center text-sm"
          >
            View
          </Link>
          <button
            onClick={() => handleAddToCart(product)}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <FaShoppingCart />
            Add
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Recommendations for You ✨</h1>
          <p className="text-gray-600">Personalized product suggestions based on your preferences</p>
        </div>

        {/* Trending Products */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FaFire className="text-3xl text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.trending.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Based on Your History */}
        {orders && orders.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FaStar className="text-3xl text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">Based on Your Orders</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.basedOnHistory.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Organic Products */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <FaLeaf className="text-3xl text-green-500" />
            <h2 className="text-2xl font-bold text-gray-800">Fresh Organic Picks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.organic.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>

        {/* Seasonal Products */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">🌱</div>
            <h2 className="text-2xl font-bold text-gray-800">Seasonal Favorites</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.seasonal.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RecommendationsPage;
