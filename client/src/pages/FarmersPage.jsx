"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllFarmers } from "../redux/slices/farmerSlice";
import FarmerCard from "../components/FarmerCard";
import Loader from "../components/Loader";
import { FaSearch, FaLeaf, FaTractor, FaUsers, FaMapMarkerAlt, FaSeedling } from "react-icons/fa";
import AnimatedBackground from "../components/AnimatedBackground";
import "../styles/animations.css";

const FarmersPage = () => {
  const dispatch = useDispatch();
  const { farmers, loading } = useSelector((state) => state.farmers);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFarmers, setFilteredFarmers] = useState([]);

  useEffect(() => {
    dispatch(getAllFarmers());
  }, [dispatch]);

  useEffect(() => {
    if (farmers) {
      setFilteredFarmers(
        farmers.filter((farmer) =>
          farmer.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [farmers, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-teal-50 relative">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-emerald-100/60 via-green-50 to-teal-100/40">
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

        {/* Floating Icons */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce animation-delay-1000 opacity-20">🌾</div>
        <div className="absolute top-20 right-20 text-5xl animate-bounce animation-delay-2000 opacity-20">🚜</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce animation-delay-3000 opacity-20">🌱</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-bounce animation-delay-4000 opacity-20">🥕</div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full px-6 py-3 mb-6 shadow-lg border border-green-200 backdrop-blur-sm animate-fade-in-scale">
              <FaTractor className="mr-2" />
              <span className="uppercase tracking-wider">Meet Our Community</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight animate-slide-up">
              Our Farmers
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 animate-slide-up animation-delay-1000">
              Connect with dedicated farmers who grow fresh, organic produce with passion and care
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12 animate-slide-up animation-delay-2000">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-3d border border-white/20">
                <div className="text-4xl font-bold text-green-600 mb-2">{farmers.length}+</div>
                <div className="text-sm text-gray-600 font-semibold">Active Farmers</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-3d border border-white/20">
                <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
                <div className="text-sm text-gray-600 font-semibold">Villages</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-3d border border-white/20">
                <div className="text-4xl font-bold text-teal-600 mb-2">100%</div>
                <div className="text-sm text-gray-600 font-semibold">Organic</div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d p-6 border border-white/20">
              <div className="relative group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search farmers by name, location, or specialty..."
                  className="w-full px-6 py-4 pl-14 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-green-300 text-lg"
                />
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-xl group-focus-within:text-green-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Farmers Grid Section */}
      <section className="container mx-auto px-4 py-16">
        {filteredFarmers.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {searchTerm ? "Search Results" : "All Farmers"}
              </h2>
              <p className="text-gray-600">
                Showing {filteredFarmers.length} farmer{filteredFarmers.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFarmers.map((farmer, index) => (
                <div
                  key={farmer._id}
                  className="animate-fade-in-scale"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FarmerCard farmer={farmer} />
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
              <h3 className="text-2xl font-bold mb-4 text-gray-800">No Farmers Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any farmers matching your search. Try adjusting your criteria.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Why Connect Section */}
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Why Connect with Our Farmers?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build direct relationships and support sustainable agriculture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-green">
                <FaLeaf className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">100% Fresh & Organic</h3>
              <p className="text-gray-600">
                Get produce harvested at peak ripeness, delivered directly from the farm to your table
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-emerald">
                <FaUsers className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Direct Connection</h3>
              <p className="text-gray-600">
                Build relationships with farmers, learn about their practices, and support local agriculture
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-teal">
                <FaMapMarkerAlt className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Local & Sustainable</h3>
              <p className="text-gray-600">
                Support your local economy and reduce environmental impact with shorter supply chains
              </p>
            </div>
          </div>
        </div>
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
            Are You a Farmer?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join our community and connect directly with consumers who value fresh, local produce
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/register"
              className="bg-white text-green-600 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Join as Farmer
            </a>
            <a
              href="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white hover:text-green-600 transform hover:-translate-y-1 transition-all duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FarmersPage;
