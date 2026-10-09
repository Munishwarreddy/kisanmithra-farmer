"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getFarmerProfile,
  clearFarmerProfile,
} from "../redux/slices/farmerSlice";
import { getProducts } from "../redux/slices/productSlice";
import { sendMessage } from "../redux/slices/messageSlice";
import { saveFarmer, unsaveFarmer } from "../redux/slices/savedFarmersSlice";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import {
  FaLeaf,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaArrowLeft,
  FaComment,
  FaHeart,
  FaRegHeart,
  FaTractor,
  FaSeedling,
  FaCertificate,
} from "react-icons/fa";

const FarmerDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");

  const { farmerProfile, loading } = useSelector((state) => state.farmers);
  const { products, loading: productsLoading } = useSelector(
    (state) => state.products
  );
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { farmers: savedFarmers } = useSelector((state) => state.savedFarmers);
  
  const isSaved = savedFarmers.some(sf => sf.farmer._id === id);

  useEffect(() => {
    dispatch(getFarmerProfile(id));
    dispatch(getProducts({ farmer: id }));

    return () => {
      dispatch(clearFarmerProfile());
    };
  }, [dispatch, id]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!message.trim()) {
      return;
    }

    dispatch(
      sendMessage({
        receiver: id,
        content: message,
      })
    );

    setMessage("");
    setShowMessageForm(false);
  };

  const handleSaveFarmer = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "farmer") {
      alert("Only consumers can save farmers");
      return;
    }
    
    if (isSaved) {
      dispatch(unsaveFarmer(id));
    } else {
      dispatch(saveFarmer(id));
    }
  };

  if (loading || productsLoading) {
    return <Loader />;
  }

  if (!farmerProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">Farmer not found</span>
        </div>
        <Link
          to="/farmers"
          className="mt-4 inline-block text-green-500 hover:text-green-700"
        >
          Back to Farmers
        </Link>
      </div>
    );
  }

  const { farmer, profile } = farmerProfile;
  const displayFarmer = { ...farmerProfile };
  if (farmer) {
    displayFarmer.name = farmer.name;
    displayFarmer.email = farmer.email;
    displayFarmer.phone = farmer.phone;
    displayFarmer.image = profile?.image || farmer.image || (profile?.farmImages && profile.farmImages[0]);
    displayFarmer.specialization = (profile?.specialties && profile.specialties[0]) || farmer.specialization || "Mixed Crops";
    displayFarmer.rating = profile?.rating || farmer.rating || "4.8";
    displayFarmer.bio = profile?.description || farmer.bio;
    displayFarmer.farmLocation = (profile?.location && profile.location.address) ? profile.location.address + ', ' + (profile.location.state || '') : farmer.farmLocation || 'India';
    displayFarmer.farmSize = profile?.farmSize || farmer.farmSize || 10;
    displayFarmer.experience = profile?.yearsOfExperience || farmer.experience || 5;
  }

  // Get farmer's products for this farmer
  const farmerProducts = products.filter(p => p.farmer === id || p.farmer?._id === id || p.farmer === farmer?._id || p.farmer?._id === farmer?._id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="container mx-auto px-4">
        <Link
          to="/farmers"
          className="flex items-center text-green-600 hover:text-green-700 mb-6 font-semibold"
        >
          <FaArrowLeft className="mr-2" />
          Back to Farmers
        </Link>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
                {displayFarmer.image ? (
                  <img 
                    src={displayFarmer.image} 
                    alt={displayFarmer.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <FaTractor className="text-green-600 text-5xl" />
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold mb-2">{displayFarmer.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <FaSeedling className="text-xl" />
                  <span className="text-xl font-semibold">{displayFarmer.specialization} Specialist</span>
                </div>
                {displayFarmer.rating && (
                  <div className="flex items-center justify-center md:justify-start gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full inline-flex">
                    <span className="text-yellow-300 text-xl">★</span>
                    <span className="font-bold">{displayFarmer.rating}</span>
                    <span className="text-sm">Rating</span>
                  </div>
                )}
              </div>

              {isAuthenticated && user?.role !== "farmer" && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveFarmer}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                      isSaved
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-white hover:bg-gray-50 text-green-600"
                    }`}
                  >
                    {isSaved ? <FaHeart /> : <FaRegHeart />}
                    <span>{isSaved ? "Saved" : "Save"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information - Prominent Display */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaPhone className="text-blue-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayFarmer.phone && (
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaPhone className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 font-medium">Phone Number</div>
                      <a 
                        href={`tel:${displayFarmer.phone}`}
                        className="text-lg font-bold text-green-600 hover:text-green-700"
                      >
                        {displayFarmer.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaEnvelope className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Email Address</div>
                    <a 
                      href={`mailto:${displayFarmer.email}`}
                      className="text-lg font-bold text-blue-600 hover:text-blue-700 break-all"
                    >
                      {displayFarmer.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {isAuthenticated && user?.role !== "farmer" && (
              <div className="mt-4">
                {showMessageForm ? (
                  <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-xl shadow-md">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                      placeholder="Write your message here..."
                      rows="3"
                      required
                    ></textarea>
                    <div className="flex gap-2 mt-3">
                      <button 
                        type="submit" 
                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                      >
                        Send Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMessageForm(false)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowMessageForm(true)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 rounded-xl font-semibold transition-all shadow-md"
                  >
                    <FaComment />
                    <span>Send Message to Farmer</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Farming Details Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaTractor className="text-green-600" />
              Farming Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FaMapMarkerAlt className="text-white" />
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Location</div>
                </div>
                <div className="text-lg font-bold text-gray-800">{displayFarmer.farmLocation}</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaTractor className="text-white" />
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Farm Size</div>
                </div>
                <div className="text-lg font-bold text-gray-800">{displayFarmer.farmSize} Acres</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-white" />
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Experience</div>
                </div>
                <div className="text-lg font-bold text-gray-800">{displayFarmer.experience} Years</div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-xl border-2 border-yellow-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <FaSeedling className="text-white" />
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Specialization</div>
                </div>
                <div className="text-lg font-bold text-gray-800">{displayFarmer.specialization}</div>
              </div>
            </div>

            {displayFarmer.bio && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                  <FaLeaf className="text-green-600" />
                  About the Farmer
                </h3>
                <p className="text-gray-700 leading-relaxed">{displayFarmer.bio}</p>
              </div>
            )}

            {profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.farmingPractices && profile.farmingPractices.length > 0 && (
                  <div className="bg-white border-2 border-gray-100 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaCertificate className="text-green-600" />
                      Farming Practices
                    </h3>
                    <ul className="space-y-3">
                      {profile.farmingPractices.map((practice, index) => (
                        <li key={index} className="flex items-start">
                          <FaLeaf className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                          <span className="text-gray-700 capitalize">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {profile.businessHours && Object.keys(profile.businessHours).length > 0 && (
                  <div className="bg-white border-2 border-gray-100 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-600" />
                      Business Hours
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(profile.businessHours).map(
                        ([day, hours]) =>
                          hours.open &&
                          hours.close && (
                            <div key={day} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="capitalize font-medium text-gray-700">{day}:</span>
                              <span className="text-gray-600">
                                {hours.open} - {hours.close}
                              </span>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <FaLeaf className="text-green-600" />
              Available Products
            </h2>
            <div className="bg-green-100 px-5 py-2 rounded-full">
              <span className="text-green-700 font-bold text-lg">{farmerProducts.length} Products</span>
            </div>
          </div>

          {farmerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {farmerProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <FaLeaf className="text-gray-400 text-6xl mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-700">
                No Products Available
              </h3>
              <p className="text-gray-500">
                This farmer doesn't have any products listed at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDetailPage;
