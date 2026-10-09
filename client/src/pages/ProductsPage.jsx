"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getProducts } from "../redux/slices/productSlice";
import { getCategories } from "../redux/slices/categorySlice";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { FaFilter, FaSearch, FaLeaf, FaSeedling, FaShoppingBasket, FaTimes } from "react-icons/fa";
import AnimatedBackground from "../components/AnimatedBackground";
import "../styles/animations.css";

const ProductsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { products, loading } = useSelector((state) => state.products);
  const { categories, loading: categoryLoading } = useSelector(
    (state) => state.categories
  );

  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sort: "newest",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get categories and sync URL param
  useEffect(() => {
    dispatch(getCategories());

    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");

    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    }
  }, [dispatch, location.search]);

  // Debounced product fetching
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = {};

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      dispatch(getProducts(params));
    }, 1000); // delay of 1 second

    return () => clearTimeout(delayDebounce);
  }, [dispatch, filters.category, filters.search]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (filters.sort === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filters.sort === "price-low") {
      return a.price - b.price;
    } else if (filters.sort === "price-high") {
      return b.price - a.price;
    }
    return 0;
  });

  if (loading || categoryLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-amber-50 relative">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-green-100/60 via-emerald-50 to-amber-50/40">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000"></div>
        </div>

        {/* Grid Pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full px-6 py-3 mb-6 shadow-lg border border-green-200 backdrop-blur-sm animate-fade-in-scale">
              <FaShoppingBasket className="mr-2" />
              <span className="uppercase tracking-wider">Fresh from Farms</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight animate-slide-up">
              Browse Fresh Products
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slide-up animation-delay-1000">
              Discover organic, locally-grown produce directly from farmers in your area
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d p-6 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearchSubmit} className="flex-grow">
                  <div className="relative group">
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Search for fresh vegetables, fruits, grains..."
                      className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-green-300 text-lg"
                    />
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400 text-xl group-focus-within:text-green-500 transition-colors" />
                    </div>
                  </div>
                </form>

                <div className="flex gap-4">
                  <select
                    name="sort"
                    value={filters.sort}
                    onChange={handleFilterChange}
                    className="px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm hover:border-green-300 transition-all duration-300 font-semibold text-gray-700"
                  >
                    <option value="newest">🆕 Newest First</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                  </select>

                  <button
                    onClick={toggleFilters}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${showFilters
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-glow-green"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-glow-green"
                      }`}
                  >
                    {showFilters ? <FaTimes className="text-xl" /> : <FaFilter className="text-xl" />}
                    <span>{showFilters ? "Close" : "Filters"}</span>
                  </button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mt-6 p-6 border-2 border-green-100 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <FaLeaf className="text-green-500" />
                        Category
                      </label>
                      <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white hover:border-green-300 transition-all duration-300 font-semibold"
                      >
                        <option value="">🌾 All Categories</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.icon} {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-2 flex items-center justify-around bg-white rounded-xl p-4 shadow-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{sortedProducts.length}</div>
                        <div className="text-sm text-gray-600">Products Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600">{categories.length}</div>
                        <div className="text-sm text-gray-600">Categories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">100%</div>
                        <div className="text-sm text-gray-600">Fresh & Organic</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="container mx-auto px-4 py-16">
        {sortedProducts.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {filters.category ? "Filtered Products" : "All Fresh Products"}
              </h2>
              <p className="text-gray-600">
                Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fade-in-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d p-12 border border-white/20">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-xl opacity-20 animate-pulse-3d"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-glow-green">
                  <FaSeedling className="text-white text-5xl" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching your criteria. Try adjusting your search or filters.
              </p>
              <button
                onClick={() => setFilters({ category: "", search: "", sort: "newest" })}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white opacity-5 rounded-full animate-float animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Connect directly with farmers and request custom products or bulk orders
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/farmers"
              className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Browse Farmers
            </a>
            <a
              href="/register"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-green-600 transform hover:-translate-y-1 transition-all duration-300"
            >
              Join as Farmer
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
