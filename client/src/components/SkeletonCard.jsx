const SkeletonCard = ({ type = "product" }) => {
  if (type === "farmer") {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d border border-white/20 overflow-hidden p-6">
        {/* Avatar + Name */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="skeleton w-20 h-20 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4 rounded"></div>
            <div className="skeleton h-3 w-1/2 rounded"></div>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="skeleton h-16 rounded-xl"></div>
          <div className="skeleton h-16 rounded-xl"></div>
        </div>
        {/* Button */}
        <div className="skeleton h-12 rounded-xl mt-4"></div>
      </div>
    );
  }

  // Default: Product card skeleton
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-3d border border-white/20 overflow-hidden">
      {/* Image placeholder */}
      <div className="skeleton h-56 w-full"></div>
      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-20 rounded-full"></div>
        <div className="skeleton h-5 w-3/4 rounded"></div>
        <div className="skeleton h-3 w-full rounded"></div>
        <div className="skeleton h-3 w-2/3 rounded"></div>
        {/* Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton w-4 h-4 rounded"></div>
          ))}
        </div>
        {/* Price + Button */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <div className="skeleton h-6 w-16 rounded"></div>
            <div className="skeleton h-3 w-12 rounded"></div>
          </div>
          <div className="skeleton h-10 w-24 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
