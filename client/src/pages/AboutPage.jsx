import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaLeaf,
  FaUsers,
  FaHandshake,
  FaShoppingBasket,
  FaCheck,
  FaTractor,
  FaSeedling,
  FaHeart,
  FaAward,
  FaChartLine,
  FaGlobe,
  FaShieldAlt,
  FaRocket,
  FaLightbulb,
  FaHandHoldingHeart,
  FaBalanceScale,
  FaRecycle,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import { member1, member2, member3, member4 } from "../assets";
import AnimatedBackground from "../components/AnimatedBackground";
import "../styles/animations.css";

const teamMembers = [
  {
    id: 1,
    name: "Kathi Munishwar",
    pic: member1,
    role: "Full Stack Developer",
    linkedin: "https://www.linkedin.com/in/kathi-munishwar-ba2934327/",
  },
  {
    id: 2,
    name: "Shashivadhan Pulluri",
    pic: member2,
    role: "Backend Developer",
    linkedin: "https://www.linkedin.com/in/shashivadhan-pulluri-662a4a309/",
  },
  {
    id: 3,
    name: "Lingamsetty Siva",
    pic: member3,
    role: "Frontend Developer",
    linkedin: "https://www.linkedin.com/in/siva-lingamsetty-4a892929a/",
  },
  {
    id: 4,
    name: "Ajith Kumar",
    pic: member4,
    role: "UI/UX Designer",
    linkedin: "https://www.linkedin.com/in/ajith-kumar-rayeeshetti-8196352a5/",
  },
];

const AboutPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: FaTractor,
      title: "Direct Farm Connection",
      description: "Connect directly with local farmers, eliminating middlemen and ensuring fair prices for both parties.",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: FaShoppingBasket,
      title: "Fresh Produce Marketplace",
      description: "Browse and purchase fresh, organic produce directly from verified farmers in your area.",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: FaHandshake,
      title: "Contract Farming",
      description: "Secure assured contract farming agreements with transparent terms and timely payments.",
      color: "from-teal-400 to-cyan-500"
    },
    {
      icon: FaChartLine,
      title: "Price Negotiation",
      description: "Fair and transparent price negotiation tools for both farmers and buyers.",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: FaShieldAlt,
      title: "Secure Payments",
      description: "Safe and secure payment processing with multiple payment options and buyer protection.",
      color: "from-blue-400 to-indigo-500"
    },
    {
      icon: FaUsers,
      title: "Community Building",
      description: "Real-time messaging system to build trust and relationships between farmers and consumers.",
      color: "from-indigo-400 to-purple-500"
    },
  ];

  const problems = [
    {
      icon: "❌",
      title: "Limited Digital Presence",
      description: "Farmers struggle to reach customers online"
    },
    {
      icon: "❌",
      title: "Middlemen Dependency",
      description: "Reduced profit margins due to intermediaries"
    },
    {
      icon: "❌",
      title: "Lack of Trust",
      description: "No direct connection with consumers"
    },
    {
      icon: "❌",
      title: "Market Uncertainty",
      description: "Unpredictable demand and pricing"
    },
  ];

  const solutions = [
    {
      icon: FaSeedling,
      title: "Farmer Profiles",
      description: "Showcase farm products, locations, and background with beautiful profiles",
      color: "green"
    },
    {
      icon: FaShoppingBasket,
      title: "Consumer Dashboard",
      description: "Browse goods by category, farm, and location with advanced filters",
      color: "emerald"
    },
    {
      icon: FaUsers,
      title: "Messaging System",
      description: "Real-time communication between farmers and consumers",
      color: "teal"
    },
    {
      icon: FaHandshake,
      title: "Order Requests",
      description: "Simple, secure order placement with tracking",
      color: "cyan"
    },
    {
      icon: FaShieldAlt,
      title: "Admin Panel",
      description: "Manage users, listings, categories, and platform operations",
      color: "blue"
    },
    {
      icon: FaChartLine,
      title: "Trust Building",
      description: "Transparent and localized digital marketplace",
      color: "indigo"
    },
  ];

  const stats = [
    { number: "500+", label: "Active Farmers", icon: FaTractor },
    { number: "10,000+", label: "Products Sold", icon: FaShoppingBasket },
    { number: "50+", label: "Villages Connected", icon: FaGlobe },
    { number: "4.8★", label: "Average Rating", icon: FaStar },
  ];

  return (
    <div className="overflow-hidden relative">
      {/* Hero Section with 3D Effects */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-50/70 via-emerald-50 to-cyan-50/40">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-emerald-200 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000"></div>
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
        <div className="absolute top-20 right-20 text-5xl animate-bounce animation-delay-2000 opacity-20">🥕</div>
        <div className="absolute bottom-20 left-20 text-6xl animate-bounce animation-delay-3000 opacity-20">🍅</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-bounce animation-delay-4000 opacity-20">🌽</div>

        <div className="relative z-10 w-full">
          <div className="max-w-5xl mx-auto text-center px-4">
            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold rounded-full px-6 py-3 mb-8 shadow-lg border border-green-200 backdrop-blur-sm animate-fade-in-scale">
              <FaLeaf className="mr-2" />
              <span className="uppercase tracking-wider">Our Story</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent leading-tight animate-slide-up">
              About KisanMithra
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up animation-delay-1000">
              Revolutionizing agriculture by connecting local farmers directly with consumers,
              promoting sustainable farming, and building stronger communities through technology.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-slide-up animation-delay-2000">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-2xl hover:shadow-glow-green transform hover:-translate-y-2 transition-all duration-300"
              >
                <span className="flex items-center">
                  Join Our Community
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                to="/products"
                className="group inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-green-600 bg-white border-2 border-green-200 rounded-2xl shadow-xl hover:shadow-2xl hover:border-green-300 hover:bg-green-50 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaShoppingBasket className="mr-3" />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center transform hover:scale-110 transition-transform duration-300">
                <div className="flex justify-center mb-4">
                  <stat.icon className="text-5xl animate-pulse-3d" />
                </div>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-green-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              The Problem We're Solving
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Farmers face major challenges in today's agricultural landscape
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-red-100">
                <div className="text-5xl mb-4 text-center">{problem.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">{problem.title}</h3>
                <p className="text-gray-600 text-center">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Our Comprehensive Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              KisanMithra directly addresses these issues with powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br from-${solution.color}-400 to-${solution.color}-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <solution.icon className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">{solution.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for successful farm-to-table connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 transform hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-green group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-white text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          {/* Section Heading */}
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Our Mission &amp; Vision
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Driving the future of agriculture with purpose, transparency, and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mission */}
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-glow-green">
                  <FaRocket className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                To create a direct, transparent, and sustainable connection between local farmers and consumers,
                eliminating middlemen and ensuring fair compensation for farmers while providing fresh,
                quality produce to consumers.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We believe in empowering farmers with technology, building trust through transparency,
                and creating a sustainable food ecosystem that benefits everyone.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mr-4 shadow-glow-emerald">
                  <FaLightbulb className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Our Vision</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                To become the leading platform for farm-to-table connections across India,
                revolutionizing the agricultural supply chain and creating a sustainable,
                technology-driven farming ecosystem.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We envision a future where every farmer has a digital presence, every consumer knows
                their food's origin, and communities thrive through local, sustainable agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              KisanMithra creates value for all stakeholders in the agricultural ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* For Consumers */}
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <FaShoppingBasket className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">For Consumers</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Access to fresher, more nutritious produce directly from farms</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Complete transparency about food origin and growing practices</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Support local economy and sustainable farming practices</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Reduced environmental impact from shorter supply chains</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Direct communication with farmers for custom orders</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Competitive prices without middleman markup</span>
                </li>
              </ul>
            </div>

            {/* For Farmers */}
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20">
              <div className="flex items-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-glow-green">
                  <FaTractor className="text-white text-3xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">For Farmers</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Higher profit margins by selling directly to consumers</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Stable local market with predictable demand</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Reduced waste through better demand planning and contracts</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Showcase sustainable farming practices and build brand</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Direct customer feedback for continuous improvement</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0 text-xl" />
                  <span className="text-gray-700 text-lg">Access to digital tools for modern farm management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              How KisanMithra Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple, transparent, and efficient process for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow-green">
                  1
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 shadow-glow-green">
                  <FaUsers className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Connect</h3>
                <p className="text-gray-600 leading-relaxed">
                  Farmers create detailed profiles showcasing their farms, growing practices, and available produce.
                  Consumers browse and discover local farms in their area with advanced search filters.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 text-green-500 text-4xl">
                →
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow-emerald">
                  2
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 shadow-glow-emerald">
                  <FaShoppingBasket className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Order</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse available products by category, farm, or location. Select items, communicate with farmers,
                  and place orders directly. Choose between pickup or delivery options.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-5 transform -translate-y-1/2 text-green-500 text-4xl">
                →
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-glow-teal">
                  3
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 shadow-glow-teal">
                  <FaHandshake className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Enjoy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive fresh, locally grown produce directly from farmers. Build lasting relationships,
                  provide feedback, and support your local agricultural community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-b from-white to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate innovators dedicated to transforming agriculture
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="group relative bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <img
                      src={member.pic}
                      alt={member.name}
                      className="relative w-32 h-32 rounded-full object-cover border-4 border-green-500 shadow-glow-green mx-auto group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{member.name}</h3>
                  <p className="text-green-600 font-semibold mb-4">{member.role}</p>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-green">
                <FaBalanceScale className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Transparency</h3>
              <p className="text-gray-600">Open, honest communication and clear pricing for all stakeholders</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-emerald">
                <FaRecycle className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Sustainability</h3>
              <p className="text-gray-600">Promoting eco-friendly farming practices and reducing carbon footprint</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-teal">
                <FaHandHoldingHeart className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Empowerment</h3>
              <p className="text-gray-600">Empowering farmers with technology and fair market access</p>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-3d hover:shadow-3d-hover transition-all duration-500 border border-white/20 text-center transform hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaHeart className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Community</h3>
              <p className="text-gray-600">Building strong connections between farmers and consumers</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-black opacity-10"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-5 rounded-full animate-float"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white opacity-5 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white opacity-5 rounded-full animate-float animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Join the
              <br className="hidden md:block" />
              <span className="text-yellow-300"> Agricultural Revolution?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              Whether you're a farmer looking to expand your reach or a consumer seeking fresh,
              local produce, KisanMithra is your gateway to a sustainable food future.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
                <FaSeedling className="text-5xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">For Farmers</h3>
                <p className="text-green-100">Increase income and reach more customers</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
                <FaShoppingBasket className="text-5xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">For Consumers</h3>
                <p className="text-green-100">Get fresh, organic produce at fair prices</p>
              </div>
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
                <FaHeart className="text-5xl mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2">For Communities</h3>
                <p className="text-green-100">Support sustainable local agriculture</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-green-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <FaSeedling className="mr-3" />
                  Join KisanMithra Today
                  <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              <Link
                to="/products"
                className="group inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white border-2 border-white rounded-2xl hover:bg-white hover:text-green-600 transform hover:-translate-y-1 transition-all duration-300"
              >
                <FaShoppingBasket className="mr-3" />
                Browse Products
                <FaArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaLeaf className="text-3xl mr-3 text-green-400" />
            <span className="text-2xl font-bold">KisanMithra</span>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Empowering farmers, connecting communities, and revolutionizing agriculture through technology.
            Together, we're building a sustainable food future.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-2 text-gray-400">
            <span>Made with</span>
            <FaHeart className="text-red-500 animate-heartbeat" />
            <span>for farmers and communities</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
