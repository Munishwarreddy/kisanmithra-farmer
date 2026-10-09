"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { FaSearch, FaTrash, FaStar } from "react-icons/fa";
import axios from "axios";

const ReviewsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      // Fetch all products and their reviews
      const productsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`
      );
      const products = productsResponse.data;

      // Collect all reviews from all products
      const allReviews = [];
      for (const product of products) {
        if (product.reviews && product.reviews.length > 0) {
          const reviewsWithProduct = product.reviews.map((review) => ({
            ...review,
            productId: product._id,
            productName: product.name,
            farmerName: product.farmer?.name || "Unknown",
          }));
          allReviews.push(...reviewsWithProduct);
        }
      }

      // Sort by date (newest first)
      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(allReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/admin/reviews/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            data: { productId },
          }
        );
        // Refresh reviews
        fetchAllReviews();
      } catch (error) {
        console.error("Failed to delete review:", error);
        alert("Failed to delete review. Please try again.");
      }
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.consumer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.farmerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating =
      filterRating === "all" || review.rating === parseInt(filterRating);

    return matchesSearch && matchesRating;
  });

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Review Moderation</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No reviews found
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {review.rating}/5
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {review.productName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Farmer: {review.farmerName}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    By: {review.consumer?.name || "Anonymous"} •{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review.productId, review._id)}
                  className="text-red-600 hover:text-red-900 p-2"
                  title="Delete Review"
                >
                  <FaTrash className="text-lg" />
                </button>
              </div>

              {review.comment && (
                <div className="mb-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}

              {review.farmerResponse && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                  <p className="text-sm font-semibold text-green-800 mb-1">
                    Farmer Response:
                  </p>
                  <p className="text-sm text-gray-700">
                    {review.farmerResponse}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
