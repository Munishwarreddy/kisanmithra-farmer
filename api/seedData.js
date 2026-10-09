const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./models/UserModel");
const Product = require("./models/ProductModel");
const Category = require("./models/CategoryModel");
const FarmerProfile = require("./models/FarmerProfileModel");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/kisanmithra");
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Indian farmer names
const farmerNames = [
  "Ramesh Kumar", "Suresh Patel", "Rajesh Singh", "Mahesh Sharma", "Dinesh Yadav",
  "Prakash Reddy", "Vijay Naik", "Anil Desai", "Santosh Jadhav", "Ganesh Patil",
  "Ravi Verma", "Mohan Das", "Kiran Rao", "Ashok Gupta", "Deepak Joshi",
  "Sanjay Nair", "Manoj Kulkarni", "Vinod Mehta", "Harish Iyer", "Sunil Pandey",
  "Rakesh Thakur", "Naveen Chaudhary", "Pradeep Mishra", "Ajay Tiwari", "Yogesh Sinha",
  "Mukesh Agarwal", "Pankaj Saxena", "Nitin Jain", "Sachin Kapoor", "Rohit Malhotra",
  "Amit Bhatia", "Sumit Chopra", "Rahul Khanna", "Ankit Arora", "Vishal Sethi",
  "Gaurav Bansal", "Manish Goyal", "Abhishek Mittal", "Vivek Singhal", "Tarun Garg",
  "Lalit Aggarwal", "Prem Chand", "Hari Om", "Shyam Lal", "Babu Rao",
  "Krishna Murthy", "Venkat Rao", "Subhash Babu", "Gopal Krishna", "Balaji Naidu"
];

// Indian locations
const locations = [
  "Punjab", "Haryana", "Uttar Pradesh", "Maharashtra", "Karnataka",
  "Tamil Nadu", "Andhra Pradesh", "Telangana", "Gujarat", "Rajasthan",
  "Madhya Pradesh", "West Bengal", "Bihar", "Odisha", "Kerala"
];

// Agricultural products with Indian context
const productData = [
  // Grains & Cereals
  { name: "Basmati Rice", category: "Grains", unit: "kg", priceRange: [80, 150], description: "Premium long-grain aromatic rice", isOrganic: true },
  { name: "Wheat", category: "Grains", unit: "kg", priceRange: [25, 40], description: "Fresh whole wheat grains", isOrganic: false },
  { name: "Jowar (Sorghum)", category: "Grains", unit: "kg", priceRange: [40, 60], description: "Nutritious millet grain", isOrganic: true },
  { name: "Bajra (Pearl Millet)", category: "Grains", unit: "kg", priceRange: [35, 55], description: "High-protein millet", isOrganic: true },
  { name: "Ragi (Finger Millet)", category: "Grains", unit: "kg", priceRange: [50, 70], description: "Calcium-rich millet", isOrganic: true },
  
  // Pulses & Lentils
  { name: "Toor Dal (Pigeon Pea)", category: "Pulses", unit: "kg", priceRange: [100, 140], description: "Popular Indian lentil", isOrganic: false },
  { name: "Moong Dal (Green Gram)", category: "Pulses", unit: "kg", priceRange: [90, 130], description: "Protein-rich lentil", isOrganic: true },
  { name: "Chana Dal (Bengal Gram)", category: "Pulses", unit: "kg", priceRange: [80, 120], description: "Split chickpeas", isOrganic: false },
  { name: "Masoor Dal (Red Lentil)", category: "Pulses", unit: "kg", priceRange: [70, 110], description: "Quick-cooking lentil", isOrganic: false },
  { name: "Urad Dal (Black Gram)", category: "Pulses", unit: "kg", priceRange: [95, 135], description: "Essential for South Indian cuisine", isOrganic: true },
  
  // Vegetables
  { name: "Tomatoes", category: "Vegetables", unit: "kg", priceRange: [20, 50], description: "Fresh red tomatoes", isOrganic: true },
  { name: "Onions", category: "Vegetables", unit: "kg", priceRange: [25, 60], description: "Fresh red onions", isOrganic: false },
  { name: "Potatoes", category: "Vegetables", unit: "kg", priceRange: [15, 35], description: "Farm-fresh potatoes", isOrganic: false },
  { name: "Cauliflower", category: "Vegetables", unit: "piece", priceRange: [30, 60], description: "Fresh cauliflower heads", isOrganic: true },
  { name: "Cabbage", category: "Vegetables", unit: "piece", priceRange: [20, 40], description: "Green cabbage", isOrganic: false },
  { name: "Brinjal (Eggplant)", category: "Vegetables", unit: "kg", priceRange: [30, 50], description: "Fresh purple brinjal", isOrganic: true },
  { name: "Bhindi (Okra)", category: "Vegetables", unit: "kg", priceRange: [40, 70], description: "Fresh lady fingers", isOrganic: true },
  { name: "Bottle Gourd (Lauki)", category: "Vegetables", unit: "kg", priceRange: [25, 45], description: "Fresh bottle gourd", isOrganic: false },
  { name: "Ridge Gourd (Turai)", category: "Vegetables", unit: "kg", priceRange: [30, 55], description: "Fresh ridge gourd", isOrganic: true },
  { name: "Bitter Gourd (Karela)", category: "Vegetables", unit: "kg", priceRange: [35, 60], description: "Fresh bitter gourd", isOrganic: true },
  
  // Leafy Greens
  { name: "Spinach (Palak)", category: "Leafy Greens", unit: "bunch", priceRange: [15, 30], description: "Fresh spinach leaves", isOrganic: true },
  { name: "Fenugreek (Methi)", category: "Leafy Greens", unit: "bunch", priceRange: [10, 25], description: "Fresh fenugreek leaves", isOrganic: true },
  { name: "Coriander Leaves", category: "Leafy Greens", unit: "bunch", priceRange: [10, 20], description: "Fresh coriander", isOrganic: false },
  { name: "Mint Leaves", category: "Leafy Greens", unit: "bunch", priceRange: [10, 20], description: "Fresh mint", isOrganic: true },
  { name: "Curry Leaves", category: "Leafy Greens", unit: "bunch", priceRange: [5, 15], description: "Fresh curry leaves", isOrganic: false },
  
  // Fruits
  { name: "Mangoes (Alphonso)", category: "Fruits", unit: "dozen", priceRange: [400, 800], description: "Premium Alphonso mangoes", isOrganic: true },
  { name: "Bananas", category: "Fruits", unit: "dozen", priceRange: [40, 70], description: "Fresh ripe bananas", isOrganic: false },
  { name: "Pomegranate", category: "Fruits", unit: "kg", priceRange: [100, 180], description: "Fresh pomegranates", isOrganic: true },
  { name: "Guava", category: "Fruits", unit: "kg", priceRange: [40, 80], description: "Fresh guavas", isOrganic: false },
  { name: "Papaya", category: "Fruits", unit: "kg", priceRange: [30, 60], description: "Ripe papayas", isOrganic: true },
  { name: "Watermelon", category: "Fruits", unit: "kg", priceRange: [20, 40], description: "Sweet watermelons", isOrganic: false },
  { name: "Grapes", category: "Fruits", unit: "kg", priceRange: [60, 120], description: "Fresh grapes", isOrganic: true },
  
  // Spices
  { name: "Green Chillies", category: "Spices", unit: "kg", priceRange: [40, 80], description: "Fresh green chillies", isOrganic: true },
  { name: "Ginger", category: "Spices", unit: "kg", priceRange: [80, 150], description: "Fresh ginger root", isOrganic: true },
  { name: "Garlic", category: "Spices", unit: "kg", priceRange: [100, 200], description: "Fresh garlic bulbs", isOrganic: false },
  { name: "Turmeric (Fresh)", category: "Spices", unit: "kg", priceRange: [60, 120], description: "Fresh turmeric root", isOrganic: true },
  
  // Oilseeds
  { name: "Groundnuts", category: "Oilseeds", unit: "kg", priceRange: [80, 140], description: "Fresh groundnuts", isOrganic: false },
  { name: "Sesame Seeds", category: "Oilseeds", unit: "kg", priceRange: [120, 200], description: "Premium sesame seeds", isOrganic: true },
  { name: "Mustard Seeds", category: "Oilseeds", unit: "kg", priceRange: [90, 150], description: "Black mustard seeds", isOrganic: false },
  
  // Sugarcane & Jaggery
  { name: "Sugarcane", category: "Sugarcane", unit: "kg", priceRange: [20, 40], description: "Fresh sugarcane", isOrganic: false },
  { name: "Jaggery (Gur)", category: "Sugarcane", unit: "kg", priceRange: [60, 100], description: "Pure jaggery", isOrganic: true },
  
  // Dairy & Honey
  { name: "Fresh Milk", category: "Dairy", unit: "liter", priceRange: [50, 70], description: "Farm-fresh cow milk", isOrganic: true },
  { name: "Desi Ghee", category: "Dairy", unit: "kg", priceRange: [400, 600], description: "Pure cow ghee", isOrganic: true },
  { name: "Honey", category: "Honey", unit: "kg", priceRange: [300, 500], description: "Pure natural honey", isOrganic: true },
  
  // Nuts
  { name: "Almonds", category: "Nuts", unit: "kg", priceRange: [600, 900], description: "Premium almonds", isOrganic: true },
  { name: "Cashews", category: "Nuts", unit: "kg", priceRange: [700, 1000], description: "Premium cashew nuts", isOrganic: true },
  { name: "Walnuts", category: "Nuts", unit: "kg", priceRange: [800, 1200], description: "Fresh walnuts", isOrganic: true },
  
  // Others
  { name: "Coconut", category: "Fruits", unit: "piece", priceRange: [30, 50], description: "Fresh coconuts", isOrganic: false },
  { name: "Drumsticks (Moringa)", category: "Vegetables", unit: "kg", priceRange: [40, 70], description: "Fresh drumsticks", isOrganic: true },
  { name: "Jackfruit", category: "Fruits", unit: "kg", priceRange: [30, 60], description: "Fresh jackfruit", isOrganic: false }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({ role: { $in: ["farmer", "consumer"] } });
    await Product.deleteMany({});
    await FarmerProfile.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    console.log("📁 Creating categories...");
    const categoryNames = [
      "Grains", "Pulses", "Vegetables", "Leafy Greens", "Fruits",
      "Spices", "Oilseeds", "Sugarcane", "Dairy", "Honey", "Nuts"
    ];
    
    const categories = await Category.insertMany(
      categoryNames.map(name => ({ name, description: `Fresh ${name}` }))
    );
    console.log(`✅ Created ${categories.length} categories`);

    // Create farmers
    console.log("👨‍🌾 Creating 50 farmers...");
    const hashedPassword = await bcrypt.hash("farmer123", 10);
    const farmers = [];

    for (let i = 0; i < 50; i++) {
      const farmer = await User.create({
        name: farmerNames[i],
        email: `farmer${i + 1}@kisanmithra.com`,
        password: hashedPassword,
        role: "farmer",
        phone: `98${String(i).padStart(8, "0")}`,
      });

      // Create farmer profile
      await FarmerProfile.create({
        user: farmer._id,
        farmSize: Math.floor(Math.random() * 50) + 5,
        farmLocation: locations[Math.floor(Math.random() * locations.length)],
        experience: Math.floor(Math.random() * 30) + 5,
        specialization: categoryNames[Math.floor(Math.random() * categoryNames.length)],
        certifications: Math.random() > 0.5 ? ["Organic Certified"] : [],
        bio: `Experienced farmer specializing in organic farming with ${Math.floor(Math.random() * 20) + 5} years of experience.`,
      });

      farmers.push(farmer);
    }
    console.log(`✅ Created ${farmers.length} farmers with profiles`);

    // Create products
    console.log("🌾 Creating 50 agricultural products...");
    const products = [];

    for (let i = 0; i < 50; i++) {
      const productInfo = productData[i];
      const randomFarmer = farmers[Math.floor(Math.random() * farmers.length)];
      const category = categories.find(c => c.name === productInfo.category);
      const price = Math.floor(Math.random() * (productInfo.priceRange[1] - productInfo.priceRange[0])) + productInfo.priceRange[0];

      const product = await Product.create({
        name: productInfo.name,
        description: productInfo.description,
        price: price,
        unit: productInfo.unit,
        category: category._id,
        farmer: randomFarmer._id,
        stock: Math.floor(Math.random() * 500) + 50,
        isOrganic: productInfo.isOrganic,
        images: [`https://placehold.co/400x300/4ade80/ffffff?text=${encodeURIComponent(productInfo.name)}`],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        reviewCount: Math.floor(Math.random() * 100) + 10,
      });

      products.push(product);
    }
    console.log(`✅ Created ${products.length} products`);

    // Create a few consumers for testing
    console.log("👥 Creating 5 test consumers...");
    const consumers = [];
    for (let i = 0; i < 5; i++) {
      const consumer = await User.create({
        name: `Consumer ${i + 1}`,
        email: `consumer${i + 1}@kisanmithra.com`,
        password: hashedPassword,
        role: "consumer",
        phone: `97${String(i).padStart(8, "0")}`,
      });
      consumers.push(consumer);
    }
    console.log(`✅ Created ${consumers.length} test consumers`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Farmers: ${farmers.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Consumers: ${consumers.length}`);
    console.log("\n🔐 Login Credentials:");
    console.log("   Farmers: farmer1@kisanmithra.com to farmer50@kisanmithra.com");
    console.log("   Consumers: consumer1@kisanmithra.com to consumer5@kisanmithra.com");
    console.log("   Password: farmer123 (for all)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
