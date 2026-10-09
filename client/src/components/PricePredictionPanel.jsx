import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPricePrediction } from "../redux/slices/aiSlice";
import { FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle } from "react-icons/fa";

const PricePredictionPanel = ({ productName, category, region }) => {
  const dispatch = useDispatch();
  const { pricePredictions, loading, errors } = useSelector((state) => state.ai);
  
  const [prediction, setPrediction] = useState(null);
  const predictionKey = `${productName}-${category}-${region}`;

  useEffect(() => {
    if (productName && category && region) {
      dispatch(fetchPricePrediction({ productName, category, region }));
    }
  }, [dispatch, productName, category, region]);

  useEffect(() => {
    if (pricePredictions[predictionKey]) {
      setPrediction(pricePredictions[predictionKey].data);
    }
  }, [pricePredictions, predictionKey]);

  if (!productName || !category || !region) {
    return null;
  }

  if (loading.pricePrediction) {
    return (
      <div className="glass p-6 rounded-xl animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (errors.pricePrediction) {
    return (
      <div className="glass p-6 rounded-xl border-l-4 border-yellow-500">
        <div className="flex items-start">
          <FaInfoCircle className="text-yellow-500 mt-1 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Limited Data Available</h3>
            <p className="text-sm text-gray-600">
              {errors.pricePrediction || "Not enough market data to generate price prediction. You can proceed with manual pricing."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const getTrendIcon = () => {
    switch (prediction.predictedTrend?.direction) {
      case "up":
        return <FaArrowUp className="text-green-500" />;
      case "down":
        return <FaArrowDown className="text-red-500" />;
      default:
        return <FaMinus className="text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.predictedTrend?.direction) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getDemandBadgeColor = () => {
    switch (prediction.demandLevel) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="glass p-6 rounded-xl border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">AI Price Intelligence</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDemandBadgeColor()}`}>
          {prediction.demandLevel?.toUpperCase()} DEMAND
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Market Average</p>
          <p className="text-2xl font-bold text-gray-900">
            ₨{prediction.marketAverage?.toFixed(2)}
            <span className="text-sm font-normal text-gray-500 ml-1">per unit</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on {prediction.dataPoints} listings
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Price Trend</p>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-2xl font-bold ${getTrendColor()}`}>
              {prediction.predictedTrend?.direction === "stable" ? "Stable" : 
               `${Math.abs(prediction.predictedTrend?.percentage || 0).toFixed(1)}%`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Next week: ₨{prediction.predictedTrend?.nextWeekPrice?.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <p className="text-sm font-medium text-gray-900 mb-2">Recommended Price Range</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Minimum</p>
            <p className="text-lg font-bold text-green-600">
              ₨{prediction.recommendedPrice?.min?.toFixed(2)}
            </p>
          </div>
          <div className="text-gray-400">—</div>
          <div>
            <p className="text-xs text-gray-600">Maximum</p>
            <p className="text-lg font-bold text-green-600">
              ₨{prediction.recommendedPrice?.max?.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
        <span>
          Updated: {new Date(prediction.createdAt || Date.now()).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default PricePredictionPanel;
