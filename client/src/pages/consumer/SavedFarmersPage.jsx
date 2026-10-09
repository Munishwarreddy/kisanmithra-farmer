import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaLeaf, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

const SavedFarmersPage = () => {
  const [savedFarmers, setSavedFarmers] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedFarmers") || "[]");
    setSavedFarmers(saved);
  }, []);

  const removeFarmer = (farmerId) => {
    const updated = savedFarmers.filter((farmer) => farmer._id !== farmerId);
    setSavedFarmers(updated);
    localStorage.setItem("savedFarmers", JSON.stringify(updated));
    toast.success("Farmer removed from saved list");
  };

  const clearAll = () => {
    setSavedFarmers([]);
    localStorage.setItem("savedFarmers", JSON.stringify([]));
    toast.success("All farmers removed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Saved Farmers 🌾</h1>
            <p className="text-gray-600">
              {savedFarmers.length} {savedFarmers.length === 1 ? "farmer" : "farmers"} saved
            </p>
          </div>
          {savedFarmers.length > 0 && (
            <button
              onClick={clearAll}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {savedFarmers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No saved farmers yet</h2>
            <p className="text-gray-600 mb-6">Start following your favorite farmers!</p>
            <Link
              to="/farmers"
              className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Browse Farmers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedFarmers.map((farmer) => (
              <div
                key={farmer._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={farmer.profileImage || "/placeholder.png"}
                    alt={farmer.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFarmer(farmer._id)}
                    className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <FaHeart className="text-red-500 text-xl" />
                  </button>
                  {farmer.isOrganic && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <FaLeaf />
                      Organic
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{farmer.name}</h3>
                  
                  {farmer.location && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <FaMapMarkerAlt className="text-green-500" />
                      <span className="text-sm">{farmer.location}</span>
                    </div>
                  )}

                  {farmer.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500" />
                        <span className="font-semibold">{farmer.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({farmer.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {farmer.bio || "Dedicated to providing fresh, quality produce"}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      to={`/farmers/${farmer._id}`}
                      className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors text-center"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={`/products?farmer=${farmer._id}`}
                      className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center"
                    >
                      Products
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedFarmersPage;
