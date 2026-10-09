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
  FaSeedling
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
      role: "Farmer",
      content: "KisanMithra has transformed my farming business. I can now sell directly to consumers and get better prices for my organic vegetables.",
      rating: 5,
      avatar: "👨‍🌾"
    },
    {
      name: "Priya Sharma",
      role: "Consumer",
      content: "Fresh produce delivered to my doorstep! I love knowing exactly where my food comes from and supporting local farmers.",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "Amit Patel",
      role: "Farmer",
      content: "The platform is easy to use and has helped me reach more customers. My income has increased by 40% since joining!",
      rating: 5,
      avatar: "👨‍🌾"
    }
  ];

  const stats = [
    { number: "500+", label: "Farmers", icon: FaUsers },
    { number: "10,000+", label: "Products Sold", icon: FaShoppingBasket },
    { number: "50+", label: "Villages", icon: FaMapMarkerAlt },
    { number: "4.8★", label: "Average Rating", icon: FaStar }
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
    <div>
      {/* Hero Section with Enhanced Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        
        <div className="relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center px-4">
            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full px-6 py-3 mb-8 shadow-lg border border-green-200 backdrop-blur-sm">
              <FaSeedling className="mr-2" />
              <span className="uppercase tracking-wider">
                🌾 KisanMithra - Empowering Farmers, Connecting Communities
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight">
              Revolutionizing
              <br className="hidden md:block" />
              Farm-to-Table
              <br className="hidden md:block" />
              <span className="text-4xl md:text-6xl">Connections</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the future of agriculture with our revolutionary platform that 
              <span className="font-semibold text-green-600"> connects farmers directly</span> with consumers,
              ensuring <span className="font-semibold text-emerald-600">fresh produce</span>, 
              <span className="font-semibold text-teal-600">fair prices</span>, and 
              <span className="font-semibold text-green-700">sustainable farming practices</span>.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <FaShoppingBasket className="mr-3" />
                  Shop Fresh Produce
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/farmers"
                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-green-600 bg-white border-2 border-green-200 rounded-2xl shadow-xl hover:shadow-2xl hover:border-green-300 hover:bg-green-50 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaUsers className="mr-3" />
                Meet Our Farmers
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm font-medium">100% Organic</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTractor className="text-green-500" />
                <span className="text-sm font-medium">Direct from Farm</span>
              </div>
              <div className="flex items-center gap-2">
                <FaAward className="text-green-500" />
                <span className="text-sm font-medium">Quality Assured</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="text-4xl" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Why Choose KisanMithra?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the benefits of our revolutionary farm-to-table platform that's transforming agriculture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaLeaf className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">100% Fresh & Local</h3>
                <p className="text-gray-600 leading-relaxed">
                  Farm-fresh produce harvested at peak ripeness and delivered directly to your doorstep within hours
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Empower Farmers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Support local farming families and sustainable agriculture practices in your community
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaShoppingBasket className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Seasonal Variety</h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore diverse seasonal produce, organic vegetables, fruits, and artisanal farm products
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FaHandshake className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Direct Connection</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build relationships with farmers, learn growing practices, and trace your food's journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our farmers and customers who are transforming the agricultural landscape
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="text-6xl mr-4">{testimonials[currentTestimonial].avatar}</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xl" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 leading-relaxed italic">
                  "{testimonials[currentTestimonial].content}"
                </p>
              </div>
            </div>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-green-500 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">
              Featured Products
            </h2>
            <Link
              to="/products"
              className="text-green-600 hover:text-green-800 font-medium text-lg transition-all duration-300"
            >
              View All Products →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {productLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader />
              </div>
            ) : products.length > 0 ? (
              products
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  No Featured Products Available
                </h3>
                <p className="text-gray-500 mb-6">
                  Check back soon for new products!
                </p>
                <Link
                  to="/products"
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Browse All Products →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
            Browse By Category
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoryLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader />
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  Categories Coming Soon
                </h3>
                <p className="text-gray-500">
                  We're working on organizing our products into categories.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="glass p-6 rounded-2xl text-center transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-2xl font-bold">
                      {category.icon}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-gray-700">
                    {category.name}
                  </h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">Our Farmers</h2>
            <Link
              to="/farmers"
              className="text-green-600 hover:text-green-800 font-medium text-lg transition-all duration-300"
            >
              View All Farmers →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {farmerLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader />
              </div>
            ) : farmers.length > 0 ? (
              farmers
                .slice(0, 3)
                .map((farmer) => (
                  <FarmerCard key={farmer._id} farmer={farmer} />
                ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                  No Farmers Available Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  We're working on connecting with local farmers.
                </p>
                <Link
                  to="/farmers"
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Check Back Later →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white opacity-5 rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Transform Your
              <br className="hidden md:block" />
              <span className="text-yellow-300"> Agricultural Journey?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of farmers and consumers who are already benefiting from our revolutionary platform. 
              Experience the future of sustainable agriculture and fresh, local produce.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
                <FaSeedling className="text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">For Farmers</h3>
                <p className="text-green-100">Increase your income and reach more customers directly</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
                <FaShoppingBasket className="text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">For Consumers</h3>
                <p className="text-green-100">Get fresh, organic produce at fair prices</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6">
                <FaHeart className="text-4xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">For Communities</h3>
                <p className="text-green-100">Support sustainable local agriculture</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-green-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <FaSeedling className="mr-3" />
                  Join KisanMithra Today
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link
                to="/about"
                className="group inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white border-2 border-white rounded-2xl hover:bg-white hover:text-green-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                Learn More About Us
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FaSeedling className="text-3xl mr-3 text-green-400" />
                <span className="text-2xl font-bold">KisanMithra</span>
              </div>
              <p className="text-gray-400">
                Empowering farmers, connecting communities, and revolutionizing agriculture.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-green-400 transition-colors">About Us</Link></li>
                <li><Link to="/products" className="hover:text-green-400 transition-colors">Products</Link></li>
                <li><Link to="/farmers" className="hover:text-green-400 transition-colors">Farmers</Link></li>
                <li><Link to="/contact" className="hover:text-green-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-green-400 transition-colors">Help Center</Link></li>
                <li><Link to="/faq" className="hover:text-green-400 transition-colors">FAQ</Link></li>
                <li><Link to="/privacy" className="hover:text-green-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-green-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <p className="text-gray-400 mb-4">Join our community and stay updated</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <i className="fab fa-facebook text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KisanMithra. All rights reserved. Made with <FaHeart className="text-red-500 inline mx-1" /> for farmers and communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
