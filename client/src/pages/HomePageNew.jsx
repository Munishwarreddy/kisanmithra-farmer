"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../redux/slices/productSlice";
import { getAllFarmers } from "../redux/slices/farmerSlice";
import { getCategories } from "../redux/slices/categorySlice";
import ProductCard from "../components/ProductCard";
import FarmerCard from "../components/FarmerCard";
import Loader from "../components/Loader";
import "../styles/animations.css";
import { 
  FaLeaf, 
  FaUsers, 
  FaShoppingBasket, 
  FaHandshake,
  FaTractor,
  FaHeart,
  FaAward,
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaSeedling,
  FaShieldAlt,
  FaTruck
} from "react-icons/fa";

const HomePage = () => {
  const dispatch = useDispatch();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const { products, loading: productLoading } = useSelector(
    (state) => state.products
  );
  const { farmers, loading: farmerLoading } = useSelector(
    (state) => state.farmers
  );
  const { categories, loading: categoryLoading } = useSelector(
    (state) => state.categories
  );

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Organic Farmer",
      content: "KisanMithra transformed my business. Direct connection with consumers means better prices and no middlemen. My income increased by 60% in just 6 months.",
      rating: 5,
      location: "Punjab"
    },
    {
      name: "Priya Sharma",
      role: "Regular Customer",
      content: "The freshness is unmatched! Knowing exactly where my food comes from gives me peace of mind. Supporting local farmers has never been easier.",
      rating: 5,
      location: "Mumbai"
    },
    {
      name: "Amit Patel",
      role: "Vegetable Farmer",
      content: "Easy to use platform with great support. I can manage my products, track orders, and communicate with customers all in one place.",
      rating: 5,
      location: "Gujarat"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Active Farmers", icon: FaUsers },
    { number: "50,000+", label: "Happy Customers", icon: FaShoppingBasket },
    { number: "150+", label: "Cities Covered", icon: FaMapMarkerAlt },
    { number: "4.9★", label: "Customer Rating", icon: FaStar }
  ];

  useEffect(() => {
    dispatch(getProducts({ limit: 8 }));
    dispatch(getAllFarmers());
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Bridging the Gap Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-green-100/40 to-transparent rounded-bl-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-tr-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-white/90 backdrop-blur-sm text-green-700 text-sm font-semibold rounded-full px-5 py-2 shadow-md">
                <FaStar className="mr-2 text-green-600" />
                <span>Trusted by 50,000+ Farmers & Buyers</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Bridging the Gap</span>
                <br />
                <span className="text-gray-900">Between </span>
                <span className="text-green-600">Farmers</span>
                <br />
                <span className="text-gray-900">and </span>
                <span className="text-green-600">Buyers</span>
              </h1>
              
              {/* Description */}
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                KisanMithra empowers farmers to sell directly to buyers, eliminating middlemen and ensuring fair prices. Join thousands who are transforming agriculture commerce.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Start Selling Now
                </Link>
                
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-green-700 bg-white border-2 border-green-200 hover:border-green-300 hover:bg-green-50 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Explore Marketplace
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-green-600">50K+</div>
                  <div className="text-sm text-gray-600 font-medium">Active Farmers</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-green-600">15K+</div>
                  <div className="text-sm text-gray-600 font-medium">Verified Buyers</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-green-600">₹500Cr+</div>
                  <div className="text-sm text-gray-600 font-medium">Transactions</div>
                </div>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=800&h=900&fit=crop" 
                  alt="Happy Farmer with Fresh Produce"
                  className="w-full h-[600px] object-cover"
                />
                {/* Overlay Badge */}
                <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <FaHandshake className="text-green-600 text-2xl" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">2.5L+</div>
                      <div className="text-sm text-gray-600 font-medium">Successful Deals</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-200 rounded-full blur-2xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Farmers Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-50 text-green-700 text-sm font-semibold rounded-full px-6 py-2.5 mb-4">
              <FaTractor className="mr-2" />
              <span>Meet Our Trusted Farmers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Featured Farmers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with experienced farmers from Andhra Pradesh and Telangana
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {farmerLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader />
              </div>
            ) : farmers.length > 0 ? (
              farmers.slice(0, 4).map((farmer) => (
                <FarmerCard key={farmer._id} farmer={farmer} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FaTractor className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  Farmers Coming Soon
                </h3>
                <p className="text-gray-500">
                  We're onboarding local farmers to serve you better
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link
              to="/farmers"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaUsers className="mr-2" />
              View All Farmers
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-105 transition-transform duration-300">
                <div className="flex justify-center mb-3">
                  <stat.icon className="text-4xl opacity-90" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Why Choose KisanMithra?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the benefits of direct farm-to-table connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FaLeaf,
                title: "Fresh & Organic",
                description: "Harvested at peak ripeness and delivered within 24 hours",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: FaUsers,
                title: "Support Farmers",
                description: "Fair prices that directly benefit local farming families",
                color: "from-emerald-500 to-teal-600"
              },
              {
                icon: FaShoppingBasket,
                title: "Wide Selection",
                description: "Diverse range of seasonal produce and farm products",
                color: "from-teal-500 to-cyan-600"
              },
              {
                icon: FaHandshake,
                title: "Direct Connection",
                description: "Build relationships and learn about your food's journey",
                color: "from-cyan-500 to-blue-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Featured Products</h2>
              <p className="text-gray-600">Fresh picks from our local farmers</p>
            </div>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-700 font-semibold text-lg flex items-center gap-2"
            >
              View All
              <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader />
              </div>
            ) : products.length > 0 ? (
              products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FaShoppingBasket className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  Products Coming Soon
                </h3>
                <p className="text-gray-500">
                  Our farmers are preparing fresh produce for you
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real stories from farmers and customers
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-8 md:p-12">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {testimonials[currentTestimonial].name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-800">
                    {testimonials[currentTestimonial].name}
                  </h4>
                  <p className="text-green-600 font-medium">
                    {testimonials[currentTestimonial].role}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <FaMapMarkerAlt className="text-xs" />
                    {testimonials[currentTestimonial].location}
                  </p>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-lg" />
                  ))}
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed italic">
                "{testimonials[currentTestimonial].content}"
              </p>
            </div>
            
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-green-600 w-8' : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-black"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience Fresh?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-green-50">
            Join thousands of satisfied customers enjoying farm-fresh produce delivered to their doorstep
          </p>
          
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-green-600 bg-white rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <FaSeedling className="mr-2" />
            Get Started Today
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
