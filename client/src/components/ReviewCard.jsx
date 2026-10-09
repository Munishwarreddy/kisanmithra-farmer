import { FaStar, FaUser } from "react-icons/fa";

const ReviewCard = ({ review, showProductInfo = false }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {review.consumer?.photo ? (
            <img
              src={review.consumer.photo}
              alt={review.consumer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FaUser className="text-green-600 text-xl" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-800">
                {review.consumer?.name || "Anonymous"}
              </h4>
              <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-sm ${
                    i < review.rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {showProductInfo && review.product && (
            <div className="mb-2 text-sm text-gray-600">
              Product: <span className="font-medium">{review.product.name}</span>
            </div>
          )}

          {review.comment && (
            <p className="text-gray-700 mb-3">{review.comment}</p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mb-3">
              {review.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {review.isVerified && (
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
              Verified Purchase
            </span>
          )}

          {review.farmerResponse && (
            <div className="mt-4 pl-4 border-l-2 border-green-500 bg-green-50 p-3 rounded">
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Farmer Response:
              </p>
              <p className="text-sm text-gray-700">{review.farmerResponse.comment}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(review.farmerResponse.respondedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
