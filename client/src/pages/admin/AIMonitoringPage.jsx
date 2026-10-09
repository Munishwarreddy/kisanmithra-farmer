import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../../components/Loader";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSync,
  FaChartLine,
  FaDatabase,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AIMonitoringPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/ai/metrics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMetrics(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch AI metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getServiceStatusIcon = (service) => {
    if (service.isHealthy) {
      return <FaCheckCircle className="text-green-500 text-2xl" />;
    } else if (service.state === "HALF_OPEN") {
      return <FaExclamationTriangle className="text-yellow-500 text-2xl" />;
    } else {
      return <FaTimesCircle className="text-red-500 text-2xl" />;
    }
  };

  const getServiceStatusBadge = (service) => {
    if (service.isHealthy) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          HEALTHY
        </span>
      );
    } else if (service.state === "HALF_OPEN") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
          RECOVERING
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          DOWN
        </span>
      );
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass p-6 rounded-xl border-l-4 border-red-500">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">AI Services Monitoring</h1>
        <button
          onClick={fetchMetrics}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Services</h3>
            <FaChartLine className="text-green-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.summary?.totalServices || 0}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {metrics?.summary?.healthyServices || 0} healthy
          </p>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Average Success Rate</h3>
            <FaCheckCircle className="text-green-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.summary?.averageSuccessRate || 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Across all services</p>
        </div>

        <div className="glass p-6 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Cache Status</h3>
            <FaDatabase className="text-green-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.cache?.connected ? (
              <span className="text-green-600">Connected</span>
            ) : (
              <span className="text-red-600">Disconnected</span>
            )}
          </p>
          {metrics?.cache?.hitRate && (
            <p className="text-sm text-gray-500 mt-1">
              Hit rate: {metrics.cache.hitRate}%
            </p>
          )}
        </div>
      </div>

      {/* Service Details */}
      <div className="glass p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Service Health</h2>
        <div className="space-y-4">
          {metrics?.services?.map((service) => (
            <div
              key={service.service}
              className="bg-white p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getServiceStatusIcon(service)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.service}</h3>
                    <p className="text-sm text-gray-500">
                      Circuit Breaker: {service.state}
                    </p>
                  </div>
                </div>
                {getServiceStatusBadge(service)}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-600">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {service.successRate}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Requests</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {service.totalRequests}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Successful</p>
                  <p className="text-lg font-semibold text-green-600">
                    {service.successfulRequests}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Failed</p>
                  <p className="text-lg font-semibold text-red-600">
                    {service.failedRequests}
                  </p>
                </div>
              </div>

              {service.rejectedRequests > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <FaExclamationTriangle className="inline mr-2" />
                    {service.rejectedRequests} requests rejected due to circuit breaker
                  </p>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                Last state change:{" "}
                {new Date(service.lastStateChange).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cache Statistics */}
      {metrics?.cache?.connected && (
        <div className="glass p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Cache Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cache Hits</p>
              <p className="text-2xl font-bold text-green-600">
                {metrics.cache.keyspaceHits?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Cache Misses</p>
              <p className="text-2xl font-bold text-red-600">
                {metrics.cache.keyspaceMisses?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.cache.hitRate}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500 text-center">
        Last updated: {new Date(metrics?.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default AIMonitoringPage;
