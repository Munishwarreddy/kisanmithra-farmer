// Mock data for KisanMithra - 10 AP farmers, 10 Telangana farmers, 20 products

// 10 Farmers from Andhra Pradesh
export const andhraFarmers = [
  {
    _id: "ap1",
    name: "Venkata Ramana",
    email: "venkata.ramana@kisanmithra.com",
    phone: "9848012345",
    role: "farmer",
    farmSize: 15,
    farmLocation: "Guntur, Andhra Pradesh",
    experience: 20,
    specialization: "Rice",
    rating: 4.8,
    totalProducts: 5,
    image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=400&fit=crop",
    bio: "Experienced Rice farmer from Guntur, Andhra Pradesh with 20 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Basmati Rice", price: 120, unit: "kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" },
      { name: "Jowar (Sorghum)", price: 50, unit: "kg", image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap2",
    name: "Lakshmi Narayana",
    email: "lakshmi.narayana@kisanmithra.com",
    phone: "9848012346",
    role: "farmer",
    farmSize: 10,
    farmLocation: "Warangal, Andhra Pradesh",
    experience: 15,
    specialization: "Chillies",
    rating: 4.7,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Dedicated Chillies farmer from Warangal, Andhra Pradesh with 15 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Green Chillies", price: 60, unit: "kg", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop" },
      { name: "Dried Red Chillies", price: 150, unit: "kg", image: "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap3",
    name: "Srinivasa Rao",
    email: "srinivasa.rao@kisanmithra.com",
    phone: "9848012347",
    role: "farmer",
    farmSize: 12,
    farmLocation: "Nizamabad, Andhra Pradesh",
    experience: 18,
    specialization: "Turmeric",
    rating: 4.9,
    totalProducts: 4,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    bio: "Experienced Turmeric farmer from Nizamabad, Andhra Pradesh with 18 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Turmeric Powder", price: 180, unit: "kg", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop" },
      { name: "Raw Turmeric Roots", price: 90, unit: "kg", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap4",
    name: "Rama Krishna",
    email: "rama.krishna@kisanmithra.com",
    phone: "9848012348",
    role: "farmer",
    farmSize: 20,
    farmLocation: "Kurnool, Andhra Pradesh",
    experience: 22,
    specialization: "Cotton",
    rating: 4.6,
    totalProducts: 2,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Dedicated Cotton farmer from Kurnool, Andhra Pradesh with 22 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Raw Cotton", price: 75, unit: "kg", image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop" },
      { name: "Cotton Seeds", price: 40, unit: "kg", image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap5",
    name: "Subba Rao",
    email: "subba.rao@kisanmithra.com",
    phone: "9848012349",
    role: "farmer",
    farmSize: 18,
    farmLocation: "Anantapur, Andhra Pradesh",
    experience: 16,
    specialization: "Groundnut",
    rating: 4.7,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    bio: "Experienced Groundnut farmer from Anantapur, Andhra Pradesh with 16 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Groundnut (Raw)", price: 95, unit: "kg", image: "https://images.unsplash.com/photo-1567892320421-e535868de7c3?w=400&h=300&fit=crop" },
      { name: "Groundnut Oil", price: 210, unit: "litre", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap6",
    name: "Venkateswara Rao",
    email: "venkateswara.rao@kisanmithra.com",
    phone: "9848012350",
    role: "farmer",
    farmSize: 25,
    farmLocation: "Chittoor, Andhra Pradesh",
    experience: 25,
    specialization: "Mango",
    rating: 4.9,
    totalProducts: 6,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Dedicated Mango farmer from Chittoor, Andhra Pradesh with 25 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Alphonso Mangoes", price: 600, unit: "dozen", image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop" },
      { name: "Banganapalli Mangoes", price: 400, unit: "dozen", image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap7",
    name: "Narasimha Murthy",
    email: "narasimha.murthy@kisanmithra.com",
    phone: "9848012351",
    role: "farmer",
    farmSize: 8,
    farmLocation: "Krishna, Andhra Pradesh",
    experience: 12,
    specialization: "Tomato",
    rating: 4.5,
    totalProducts: 4,
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop",
    bio: "Experienced Tomato farmer from Krishna, Andhra Pradesh with 12 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Fresh Tomatoes", price: 35, unit: "kg", image: "https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400&h=300&fit=crop" },
      { name: "Cherry Tomatoes", price: 80, unit: "kg", image: "https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap8",
    name: "Prasad Reddy",
    email: "prasad.reddy@kisanmithra.com",
    phone: "9848012352",
    role: "farmer",
    farmSize: 14,
    farmLocation: "East Godavari, Andhra Pradesh",
    experience: 14,
    specialization: "Banana",
    rating: 4.8,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
    bio: "Dedicated Banana farmer from East Godavari, Andhra Pradesh with 14 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Bananas", price: 50, unit: "dozen", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop" },
      { name: "Red Bananas", price: 70, unit: "dozen", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap9",
    name: "Ramesh Babu",
    email: "ramesh.babu@kisanmithra.com",
    phone: "9848012353",
    role: "farmer",
    farmSize: 22,
    farmLocation: "West Godavari, Andhra Pradesh",
    experience: 19,
    specialization: "Sugarcane",
    rating: 4.6,
    totalProducts: 2,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Experienced Sugarcane farmer from West Godavari, Andhra Pradesh with 19 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Sugarcane", price: 40, unit: "bundle", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop" },
      { name: "Jaggery (Bellam)", price: 90, unit: "kg", image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "ap10",
    name: "Satya Narayana",
    email: "satya.narayana@kisanmithra.com",
    phone: "9848012354",
    role: "farmer",
    farmSize: 16,
    farmLocation: "Prakasam, Andhra Pradesh",
    experience: 17,
    specialization: "Pulses",
    rating: 4.7,
    totalProducts: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    bio: "Dedicated Pulses farmer from Prakasam, Andhra Pradesh with 17 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Toor Dal", price: 120, unit: "kg", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop" },
      { name: "Moong Dal", price: 110, unit: "kg", image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=300&fit=crop" }
    ]
  }
];

// 10 Farmers from Telangana
export const telanganaFarmers = [
  {
    _id: "tg1",
    name: "Krishna Reddy",
    email: "krishna.reddy@kisanmithra.com",
    phone: "9848022345",
    role: "farmer",
    farmSize: 18,
    farmLocation: "Karimnagar, Telangana",
    experience: 21,
    specialization: "Rice",
    rating: 4.8,
    totalProducts: 4,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Experienced Rice farmer from Karimnagar, Telangana with 21 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Sona Masoori Rice", price: 65, unit: "kg", image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&h=300&fit=crop" },
      { name: "Brown Rice", price: 85, unit: "kg", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg2",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@kisanmithra.com",
    phone: "9848022346",
    role: "farmer",
    farmSize: 14,
    farmLocation: "Adilabad, Telangana",
    experience: 16,
    specialization: "Maize",
    rating: 4.6,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    bio: "Dedicated Maize farmer from Adilabad, Telangana with 16 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Maize (Corn)", price: 30, unit: "kg", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop" },
      { name: "Sweet Corn", price: 45, unit: "kg", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg3",
    name: "Mahesh Goud",
    email: "mahesh.goud@kisanmithra.com",
    phone: "9848022347",
    role: "farmer",
    farmSize: 20,
    farmLocation: "Nalgonda, Telangana",
    experience: 19,
    specialization: "Cotton",
    rating: 4.7,
    totalProducts: 2,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Experienced Cotton farmer from Nalgonda, Telangana with 19 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Raw Cotton", price: 80, unit: "kg", image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop" },
      { name: "Cotton Lint", price: 110, unit: "kg", image: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg4",
    name: "Suresh Naik",
    email: "suresh.naik@kisanmithra.com",
    phone: "9848022348",
    role: "farmer",
    farmSize: 16,
    farmLocation: "Khammam, Telangana",
    experience: 15,
    specialization: "Soybean",
    rating: 4.5,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop",
    bio: "Dedicated Soybean farmer from Khammam, Telangana with 15 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Soybean Seeds", price: 55, unit: "kg", image: "https://images.unsplash.com/photo-1567892320421-e535868de7c3?w=400&h=300&fit=crop" },
      { name: "Soybean Oil", price: 160, unit: "litre", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg5",
    name: "Ravi Teja",
    email: "ravi.teja@kisanmithra.com",
    phone: "9848022349",
    role: "farmer",
    farmSize: 10,
    farmLocation: "Rangareddy, Telangana",
    experience: 13,
    specialization: "Vegetables",
    rating: 4.9,
    totalProducts: 6,
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop",
    bio: "Experienced Vegetables farmer from Rangareddy, Telangana with 13 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Brinjal (Eggplant)", price: 40, unit: "kg", image: "https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=400&h=300&fit=crop" },
      { name: "Onions", price: 45, unit: "kg", image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg6",
    name: "Balaji Rao",
    email: "balaji.rao@kisanmithra.com",
    phone: "9848022350",
    role: "farmer",
    farmSize: 12,
    farmLocation: "Nizamabad, Telangana",
    experience: 18,
    specialization: "Turmeric",
    rating: 4.8,
    totalProducts: 4,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    bio: "Dedicated Turmeric farmer from Nizamabad, Telangana with 18 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Fresh Ginger", price: 120, unit: "kg", image: "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&h=300&fit=crop" },
      { name: "Turmeric Fingers", price: 150, unit: "kg", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg7",
    name: "Venkat Swamy",
    email: "venkat.swamy@kisanmithra.com",
    phone: "9848022351",
    role: "farmer",
    farmSize: 11,
    farmLocation: "Warangal, Telangana",
    experience: 14,
    specialization: "Chillies",
    rating: 4.7,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    bio: "Experienced Chillies farmer from Warangal, Telangana with 14 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Red Chilli Powder", price: 200, unit: "kg", image: "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&h=300&fit=crop" },
      { name: "Guntur Chillies", price: 180, unit: "kg", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg8",
    name: "Anand Kumar",
    email: "anand.kumar@kisanmithra.com",
    phone: "9848022352",
    role: "farmer",
    farmSize: 24,
    farmLocation: "Medak, Telangana",
    experience: 23,
    specialization: "Mango",
    rating: 4.9,
    totalProducts: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    bio: "Dedicated Mango farmer from Medak, Telangana with 23 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Pomegranate", price: 140, unit: "kg", image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=300&fit=crop" },
      { name: "Guava", price: 60, unit: "kg", image: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg9",
    name: "Prakash Goud",
    email: "prakash.goud@kisanmithra.com",
    phone: "9848022353",
    role: "farmer",
    farmSize: 17,
    farmLocation: "Mahbubnagar, Telangana",
    experience: 17,
    specialization: "Groundnut",
    rating: 4.6,
    totalProducts: 3,
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
    bio: "Experienced Groundnut farmer from Mahbubnagar, Telangana with 17 years of expertise in sustainable farming practices.",
    specialtyProducts: [
      { name: "Groundnut (Raw)", price: 100, unit: "kg", image: "https://images.unsplash.com/photo-1567892320421-e535868de7c3?w=400&h=300&fit=crop" },
      { name: "Groundnut Cake", price: 65, unit: "kg", image: "https://images.unsplash.com/photo-1567892320421-e535868de7c3?w=400&h=300&fit=crop" }
    ]
  },
  {
    _id: "tg10",
    name: "Sai Kumar",
    email: "sai.kumar@kisanmithra.com",
    phone: "9848022354",
    role: "farmer",
    farmSize: 13,
    farmLocation: "Sangareddy, Telangana",
    experience: 12,
    specialization: "Grapes",
    rating: 4.8,
    totalProducts: 4,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Dedicated Grapes farmer from Sangareddy, Telangana with 12 years of experience in modern agricultural techniques.",
    specialtyProducts: [
      { name: "Grapes", price: 90, unit: "kg", image: "https://images.unsplash.com/photo-1599819177626-c2f9c9ca6f68?w=400&h=300&fit=crop" },
      { name: "Raisins (Dry Grapes)", price: 250, unit: "kg", image: "https://images.unsplash.com/photo-1599819177626-c2f9c9ca6f68?w=400&h=300&fit=crop" }
    ]
  }
];

// All farmers combined
export const allFarmers = [...andhraFarmers, ...telanganaFarmers];

// Categories
export const categories = [
  { _id: "cat1", name: "Vegetables", description: "Fresh Vegetables from local farmers" },
  { _id: "cat2", name: "Fruits", description: "Fresh Fruits from local farmers" },
  { _id: "cat3", name: "Grains", description: "Fresh Grains from local farmers" },
  { _id: "cat4", name: "Pulses", description: "Fresh Pulses from local farmers" },
  { _id: "cat5", name: "Spices", description: "Fresh Spices from local farmers" }
];

// 20 Products across all categories



// Auto-generated products explicitly matching ONLY the natively defined specialtyProducts
export const products = [...andhraFarmers, ...telanganaFarmers].flatMap((farmer) => {
  if (!farmer.specialtyProducts) return [];
  
  const generatedProducts = [];
  const targetCount = farmer.totalProducts || farmer.specialtyProducts.length || 0;
  
  for (let i = 0; i < targetCount; i++) {
    if (i < farmer.specialtyProducts.length) {
      // Direct physical product map
      const sp = farmer.specialtyProducts[i];
      generatedProducts.push({
        _id: `auto_prod_${farmer._id}_${i}`,
        name: sp.name,
        description: `Farm-fresh ${sp.name} directly from ${farmer.name}'s farm located in ${farmer.farmLocation}.`,
        price: sp.price,
        unit: sp.unit,
        category: "cat1", 
        categoryName: farmer.specialization || "General",
        farmer: farmer._id,
        farmerName: farmer.name,
        stock: Math.floor(Math.random() * 500) + 100,
        isOrganic: Math.random() > 0.5,
        image: sp.image || "https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400&h=300&fit=crop",
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 100) + 10
      });
    } else {
      // Synthesize missing premium padding to exactly match their arbitrary totalProducts!
      const variationPrefixes = ["Premium", "Fresh", "Export Quality", "Raw", "Natural", "Hand-picked"];
      const prefix = variationPrefixes[i % variationPrefixes.length];
      const fallbackName = farmer.specialization || "Produce";
      
      generatedProducts.push({
        _id: `auto_prod_${farmer._id}_${i}`,
        name: `${prefix} ${fallbackName}`,
        description: `${prefix} ${fallbackName} safely sourced from ${farmer.farmLocation}.`,
        price: Math.floor(Math.random() * 100) + 50,
        unit: "kg",
        category: "cat1", 
        categoryName: farmer.specialization || "General",
        farmer: farmer._id,
        farmerName: farmer.name,
        stock: Math.floor(Math.random() * 300) + 50,
        isOrganic: Math.random() > 0.5,
        image: "https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400&h=300&fit=crop",
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 50) + 5
      });
    }
  }

  return generatedProducts;
});
