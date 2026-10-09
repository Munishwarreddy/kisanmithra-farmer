import React, { useEffect, useRef, useState } from 'react';
import { FaRocket, FaCode, FaMobile, FaCloud, FaShieldAlt, FaChartLine, FaUsers, FaLightbulb } from 'react-icons/fa';

const ShowcaseSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: FaRocket,
      title: "Lightning Fast",
      description: "Optimized performance with sub-second load times and smooth interactions",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: FaCode,
      title: "Modern Tech Stack",
      description: "Built with React, TypeScript, Node.js, and MongoDB for scalability",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FaMobile,
      title: "Mobile First",
      description: "Responsive design that works flawlessly on all devices",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: FaCloud,
      title: "Cloud Ready",
      description: "Deployed on Vercel with automatic scaling and global CDN",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: FaShieldAlt,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with JWT authentication and data encryption",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: FaChartLine,
      title: "Analytics Driven",
      description: "Real-time insights and performance metrics for better decisions",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: FaUsers,
      title: "User Centric",
      description: "Intuitive UX design based on extensive user research and feedback",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: FaLightbulb,
      title: "Innovative Features",
      description: "Cutting-edge functionality that sets new industry standards",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const techStack = [
    { name: "React", icon: "⚛️", level: 95 },
    { name: "TypeScript", icon: "📘", level: 90 },
    { name: "Node.js", icon: "🟢", level: 88 },
    { name: "MongoDB", icon: "🍃", level: 85 },
    { name: "Tailwind CSS", icon: "🎨", level: 92 },
    { name: "Redux", icon: "🔄", level: 87 }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-text-gradient">
            Technical Excellence
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Showcase of cutting-edge technology and innovative features that make KisanMithra a 
            <span className="font-semibold text-green-600"> revolutionary platform</span> for modern agriculture
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`stagger-item group relative bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 ${
                isVisible ? 'animate' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white mb-20">
          <h3 className="text-3xl font-bold text-center mb-12">Technology Stack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="text-4xl">{tech.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{tech.name}</span>
                    <span className="text-sm text-gray-300">{tech.level}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: isVisible ? `${tech.level}%` : '0%',
                        transitionDelay: `${index * 100}ms`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-green-50 rounded-3xl">
            <div className="text-5xl font-bold text-green-600 mb-4">99.9%</div>
            <div className="text-lg font-semibold text-gray-800 mb-2">Uptime</div>
            <div className="text-gray-600">Reliable service guarantee</div>
          </div>
          <div className="text-center p-8 bg-blue-50 rounded-3xl">
            <div className="text-5xl font-bold text-blue-600 mb-4">&lt;1s</div>
            <div className="text-lg font-semibold text-gray-800 mb-2">Load Time</div>
            <div className="text-gray-600">Lightning fast performance</div>
          </div>
          <div className="text-center p-8 bg-purple-50 rounded-3xl">
            <div className="text-5xl font-bold text-purple-600 mb-4">50K+</div>
            <div className="text-lg font-semibold text-gray-800 mb-2">API Calls</div>
            <div className="text-gray-600">High scalability capacity</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;
