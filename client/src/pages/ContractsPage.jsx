"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFileContract,
  FaHandshake,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaDollarSign,
  FaLeaf,
} from "react-icons/fa";

const ContractsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  const contracts = [
    {
      id: 1,
      title: "Organic Tomato Supply Contract",
      farmer: "Rajesh Kumar",
      buyer: "Fresh Mart Pvt Ltd",
      product: "Organic Tomatoes",
      quantity: "500 kg/month",
      price: "₹40/kg",
      duration: "6 months",
      startDate: "2024-03-01",
      endDate: "2024-08-31",
      status: "active",
      paymentTerms: "Monthly",
      deliverySchedule: "Weekly",
    },
    {
      id: 2,
      title: "Wheat Procurement Agreement",
      farmer: "Amit Patel",
      buyer: "Grain Industries Ltd",
      product: "Wheat",
      quantity: "2000 kg/harvest",
      price: "₹25/kg",
      duration: "1 year",
      startDate: "2024-01-15",
      endDate: "2025-01-14",
      status: "pending",
      paymentTerms: "Upon Delivery",
      deliverySchedule: "Seasonal",
    },
    {
      id: 3,
      title: "Fresh Vegetable Supply",
      farmer: "Priya Sharma",
      buyer: "Hotel Grand Plaza",
      product: "Mixed Vegetables",
      quantity: "200 kg/week",
      price: "₹35/kg",
      duration: "3 months",
      startDate: "2024-02-01",
      endDate: "2024-04-30",
      status: "completed",
      paymentTerms: "Weekly",
      deliverySchedule: "Daily",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FaCheckCircle className="inline mr-1" />;
      case "pending":
        return <FaClock className="inline mr-1" />;
      case "completed":
        return <FaCheckCircle className="inline mr-1" />;
      case "cancelled":
        return <FaTimesCircle className="inline mr-1" />;
      default:
        return null;
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesTab = activeTab === "all" || contract.status === activeTab;
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = [
    { label: "Total Contracts", value: contracts.length, icon: FaFileContract, color: "blue" },
    { label: "Active", value: contracts.filter((c) => c.status === "active").length, icon: FaCheckCircle, color: "green" },
    { label: "Pending", value: contracts.filter((c) => c.status === "pending").length, icon: FaClock, color: "yellow" },
    { label: "Completed", value: contracts.filter((c) => c.status === "completed").length, icon: FaHandshake, color: "purple" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Contract Management
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your assured contract farming agreements
              </p>
            </div>
            <Link
              to="/contracts/create"
              className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
            >
              <FaPlus className="mr-2" />
              Create New Contract
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-3d hover:shadow-3d-hover transition-all duration-300 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl bg-${stat.color}-100`}>
                  <stat.icon className={`text-2xl text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-3d mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts, farmers, or buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <button className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300">
              <FaFilter className="mr-2" />
              Filters
            </button>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["all", "active", "pending", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-6">
          {filteredContracts.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 shadow-3d text-center border border-white/20">
              <FaFileContract className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Contracts Found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Start by creating your first contract"}
              </p>
              <Link
                to="/contracts/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-glow-green transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaPlus className="mr-2" />
                Create Contract
              </Link>
            </div>
          ) : (
            filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-3d hover:shadow-3d-hover transition-all duration-300 border border-white/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {contract.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            contract.status
                          )}`}
                        >
                          {getStatusIcon(contract.status)}
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <FaLeaf className="mr-2 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Product</p>
                          <p className="font-medium">{contract.product}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaDollarSign className="mr-2 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-medium">{contract.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FaCalendarAlt className="mr-2 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-medium">{contract.duration}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Farmer:</span> {contract.farmer}
                      </div>
                      <div>
                        <span className="font-medium">Buyer:</span> {contract.buyer}
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span> {contract.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col gap-2">
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center"
                    >
                      View Details
                    </Link>
                    {contract.status === "pending" && (
                      <button className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300">
                        Negotiate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-3d">
          <div className="flex items-center mb-4">
            <FaHandshake className="text-4xl mr-4" />
            <div>
              <h3 className="text-2xl font-bold">Assured Contract Farming</h3>
              <p className="text-green-100">Secure your income with transparent agreements</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold mb-2">✓ Price Stability</h4>
              <p className="text-sm text-green-100">
                Lock in fair prices and protect against market volatility
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold mb-2">✓ Guaranteed Market</h4>
              <p className="text-sm text-green-100">
                Secure buyers before planting, reducing market risks
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-semibold mb-2">✓ Timely Payments</h4>
              <p className="text-sm text-green-100">
                Automated payment processing ensures you get paid on time
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractsPage;
