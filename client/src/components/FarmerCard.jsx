import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { saveFarmer, unsaveFarmer } from "../redux/slices/savedFarmersSlice";
import { FaMapMarkerAlt, FaLeaf, FaStar, FaTractor, FaArrowRight, FaHeart, FaRegHeart, FaSeedling } from "react-icons/fa";
import "../styles/animations.css";

const FarmerCard = ({ farmer }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { farmers: savedFarmers } = useSelector((state) => state.savedFarmers);

  const isSaved = savedFarmers.some(sf => sf.farmer._id === farmer._id);

  const handleSaveFarmer = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user.role !== "consumer") {
      alert("Only consumers can save farmers");
      return;
    }

    if (isSaved) {
      dispatch(unsaveFarmer(farmer._id));
    } else {
      dispatch(saveFarmer(farmer._id));
    }
  };
  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 overflow-hidden transform hover:-translate-y-2">
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Animated Background Blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

      {/* Save Farmer Button */}
      <button
        onClick={handleSaveFarmer}
        className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-20"
        title={isSaved ? "Unsave farmer" : "Save farmer"}
      >
        {isSaved ? (
          <FaHeart className="text-red-500 text-lg" />
        ) : (
          <FaRegHeart className="text-gray-600 text-lg hover:text-red-500 transition-colors" />
        )}
      </button>

      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity animate-pulse-3d"></div>
            {/* Icon Container */}
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-glow-green group-hover:scale-110 transition-transform duration-300">
              <FaTractor className="text-white text-3xl" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
              {farmer.name}
            </h3>
            {farmer.farmLocation && (
              <div className="flex items-center text-gray-600 text-sm">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                <span>
                  {farmer.farmLocation}
                </span>
              </div>
            )}
            {!farmer.farmLocation && farmer.address && (
              <div className="flex items-center text-gray-600 text-sm">
                <FaMapMarkerAlt className="mr-2 text-green-500" />
                <span>
                  {farmer.address.city}, {farmer.address.state}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <FaLeaf className="text-green-500 mr-1" />
              <span className="text-xs text-gray-600">Products</span>
            </div>
            <div className="text-lg font-bold text-green-600">
              {farmer.totalProducts || 0}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <FaStar className="text-yellow-500 mr-1" />
              <span className="text-xs text-gray-600">Rating</span>
            </div>
            <div className="text-lg font-bold text-yellow-600">
              {farmer.rating || "4.8"}★
            </div>
          </div>
        </div>

        {/* Specialty Products Section */}
        {farmer.specialtyProducts && farmer.specialtyProducts.length > 0 && (
          <div className="mb-4">

            <div className="grid grid-cols-2 gap-2">
              {farmer.specialtyProducts.slice(0, 2).map((product, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100 hover:border-emerald-300 transition-colors duration-200"
                >
                  <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs font-bold text-emerald-600">₹{product.price}/{product.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {farmer.bio && (
          <p className="text-gray-600 text-sm mb-6 line-clamp-2">
            {farmer.bio}
          </p>
        )}

        {/* Action Button */}
        <Link
          to={`/farmers/${farmer._id}`}
          className="group/btn relative block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-3 rounded-xl font-semibold shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            View Farm Profile
            <FaArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
        </Link>
      </div>

      {/* Corner Decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-bl-full opacity-10"></div>
    </div>
  );
};

export default FarmerCard;

