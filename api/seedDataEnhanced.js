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

// 10 Farmers from Andhra Pradesh with different crops
const andhraFarmers = [
  { name: "Venkata Ramana", email: "venkata.ramana@kisanmithra.com", phone: "9848012345", specialization: "Rice", farmSize: 15, experience: 20, location: "Guntur, Andhra Pradesh" },
  { name: "Lakshmi Narayana", email: "lakshmi.narayana@kisanmithra.com", phone: "9848012346", specialization: "Chillies", farmSize: 10, experience: 15, location: "Warangal, Andhra Pradesh" },
  { name: "Srinivasa Rao", email: "srinivasa.rao@kisanmithra.com", phone: "9848012347", specialization: "Turmeric", farmSize: 12, experience: 18, location: "Nizamabad, Andhra Pradesh" },
  { name: "Rama Krishna", email: "rama.krishna@kisanmithra.com", phone: "9848012348", specialization: "Cotton", farmSize: 20, experience: 22, location: "Kurnool, Andhra Pradesh" },
  { name: "Subba Rao", email: "subba.rao@kisanmithra.com", phone: "9848012349", specialization: "Groundnut", farmSize: 18, experience: 16, location: "Anantapur, Andhra Pradesh" },
  { name: "Venkateswara Rao", email: "venkateswara.rao@kisanmithra.com", phone: "9848012350", specialization: "Mango", farmSize: 25, experience: 25, location: "Chittoor, Andhra Pradesh" },
  { name: "Narasimha Murthy", email: "narasimha.murthy@kisanmithra.com", phone: "9848012351", specialization: "Tomato", farmSize: 8, experience: 12, location: "Krishna, Andhra Pradesh" },
  { name: "Prasad Reddy", email: "prasad.reddy@kisanmithra.com", phone: "9848012352", specialization: "Banana", farmSize: 14, experience: 14, location: "East Godavari, Andhra Pradesh" },
  { name: "Ramesh Babu", email: "ramesh.babu@kisanmithra.com", phone: "9848012353", specialization: "Sugarcane", farmSize: 22, experience: 19, location: "West Godavari, Andhra Pradesh" },
  { name: "Satya Narayana", email: "satya.narayana@kisanmithra.com", phone: "9848012354", specialization: "Pulses", farmSize: 16, experience: 17, location: "Prakasam, Andhra Pradesh" }
];

// 10 Farmers from Telangana with different crops
const telanganaFarmers = [
  { name: "Krishna Reddy", email: "krishna.reddy@kisanmithra.com", phone: "9848022345", specialization: "Rice", farmSize: 18, experience: 21, location: "Karimnagar, Telangana" },
  { name: "Rajesh Kumar", email: "rajesh.kumar@kisanmithra.com", phone: "9848022346", specialization: "Maize", farmSize: 14, experience: 16, location: "Adilabad, Telangana" },
  { name: "Mahesh Goud", email: "mahesh.goud@kisanmithra.com", phone: "9848022347", specialization: "Cotton", farmSize: 20, experience: 19, location: "Nalgonda, Telangana" },
  { name: "Suresh Naik", email: "suresh.naik@kisanmithra.com", phone: "9848022348", specialization: "Soybean", farmSize: 16, experience: 15, location: "Khammam, Telangana" },
  { name: "Ravi Teja", email: "ravi.teja@kisanmithra.com", phone: "9848022349", specialization: "Vegetables", farmSize: 10, experience: 13, location: "Rangareddy, Telangana" },
  { name: "Balaji Rao", email: "balaji.rao@kisanmithra.com", phone: "9848022350", specialization: "Turmeric", farmSize: 12, experience: 18, location: "Nizamabad, Telangana" },
  { name: "Venkat Swamy", email: "venkat.swamy@kisanmithra.com", phone: "9848022351", specialization: "Chillies", farmSize: 11, experience: 14, location: "Warangal, Telangana" },
  { name: "Anand Kumar", email: "anand.kumar@kisanmithra.com", phone: "9848022352", specialization: "Mango", farmSize: 24, experience: 23, location: "Medak, Telangana" },
  { name: "Prakash Goud", email: "prakash.goud@kisanmithra.com", phone: "9848022353", specialization: "Groundnut", farmSize: 17, experience: 17, location: "Mahbubnagar, Telangana" },
  { name: "Sai Kumar", email: "sai.kumar@kisanmithra.com", phone: "9848022354", specialization: "Grapes", farmSize: 13, experience: 12, location: "Sangareddy, Telangana" }
];

// 20 Products across all categories
const productsData = [
  // Vegetables (5 products)
  { name: "Fresh Tomatoes", category: "Vegetables", description: "Farm-fresh red tomatoes, rich in vitamins", price: 35, unit: "kg", stock: 500, isOrganic: true },
  { name: "Green Chillies", category: "Vegetables", description: "Spicy green chillies from Andhra Pradesh", price: 60, unit: "kg", stock: 300, isOrganic: true },
  { name: "Brinjal (Eggplant)", category: "Vegetables", description: "Fresh purple brinjal, perfect for curries", price: 40, unit: "kg", stock: 400, isOrganic: false },
  { name: "Onions", category: "Vegetables", description: "Premium red onions from local farms", price: 45, unit: "kg", stock: 600, isOrganic: false },
  { name: "Potatoes", category: "Vegetables", description: "Fresh farm potatoes, versatile vegetable", price: 25, unit: "kg", stock: 800, isOrganic: false },
  
  // Fruits (5 products)
  { name: "Alphonso Mangoes", category: "Fruits", description: "King of mangoes from Andhra Pradesh", price: 600, unit: "dozen", stock: 200, isOrganic: true },
  { name: "Bananas", category: "Fruits", description: "Fresh ripe bananas from Telangana", price: 50, unit: "dozen", stock: 500, isOrganic: false },
  { name: "Pomegranate", category: "Fruits", description: "Juicy pomegranates rich in antioxidants", price: 140, unit: "kg", stock: 250, isOrganic: true },
  { name: "Grapes", category: "Fruits", description: "Sweet seedless grapes from Telangana", price: 90, unit: "kg", stock: 300, isOrganic: true },
  { name: "Guava", category: "Fruits", description: "Fresh guavas, vitamin C rich", price: 60, unit: "kg", stock: 350, isOrganic: false },
  
  // Grains (4 products)
  { name: "Basmati Rice", category: "Grains", description: "Premium long-grain aromatic rice", price: 120, unit: "kg", stock: 1000, isOrganic: true },
  { name: "Sona Masoori Rice", category: "Grains", description: "Popular medium-grain rice from Andhra", price: 65, unit: "kg", stock: 1200, isOrganic: false },
  { name: "Maize (Corn)", category: "Grains", description: "Fresh yellow maize from Telangana farms", price: 30, unit: "kg", stock: 700, isOrganic: false },
  { name: "Jowar (Sorghum)", category: "Grains", description: "Nutritious millet grain, gluten-free", price: 50, unit: "kg", stock: 400, isOrganic: true },
  
  // Pulses (3 products)
  { name: "Toor Dal", category: "Pulses", description: "Premium pigeon pea lentils", price: 120, unit: "kg", stock: 600, isOrganic: false },
  { name: "Moong Dal", category: "Pulses", description: "Green gram lentils, protein-rich", price: 110, unit: "kg", stock: 500, isOrganic: true },
  { name: "Chana Dal", category: "Pulses", description: "Split chickpeas, popular in Indian cuisine", price: 100, unit: "kg", stock: 550, isOrganic: false },
  
  // Spices (3 products)
  { name: "Turmeric Powder", category: "Spices", description: "Pure turmeric from Nizamabad", price: 180, unit: "kg", stock: 300, isOrganic: true },
  { name: "Red Chilli Powder", category: "Spices", description: "Spicy red chilli powder from Guntur", price: 200, unit: "kg", stock: 350, isOrganic: true },
  { name: "Fresh Ginger", category: "Spices", description: "Fresh ginger root, aromatic and spicy", price: 120, unit: "kg", stock: 400, isOrganic: false }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting enhanced database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({ role: { $in: ["farmer", "consumer"] } });
    await Product.deleteMany({});
    await FarmerProfile.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    console.log("📁 Creating categories...");
    const categoryNames = ["Vegetables", "Fruits", "Grains", "Pulses", "Spices"];
    
    const categories = await Category.insertMany(
      categoryNames.map(name => ({ 
        name, 
        description: `Fresh ${name} from local farmers` 
      }))
    );
    console.log(`✅ Created ${categories.length} categories`);

    // Hash password
    const hashedPassword = await bcrypt.hash("farmer123", 10);

    // Create Andhra Pradesh farmers
    console.log("👨‍🌾 Creating 10 farmers from Andhra Pradesh...");
    const andhraFarmersCreated = [];
    for (const farmerData of andhraFarmers) {
      const farmer = await User.create({
        name: farmerData.name,
        email: farmerData.email,
        password: hashedPassword,
        role: "farmer",
        phone: farmerData.phone,
      });

      await FarmerProfile.create({
        user: farmer._id,
        farmName: `${farmerData.name}'s Farm`,
        farmSize: farmerData.farmSize,
        location: {
          address: farmerData.location,
          city: farmerData.location.split(', ')[0],
          state: farmerData.location.split(', ')[1] || 'Andhra Pradesh'
        },
        yearsOfExperience: farmerData.experience,
        specialties: [farmerData.specialization],
        certifications: [],
        description: `Experienced ${farmerData.specialization} farmer from ${farmerData.location} with ${farmerData.experience} years of expertise in sustainable farming practices.`,
      });

      andhraFarmersCreated.push(farmer);
    }
    console.log(`✅ Created ${andhraFarmersCreated.length} farmers from Andhra Pradesh`);

    // Create Telangana farmers
    console.log("👨‍🌾 Creating 10 farmers from Telangana...");
    const telanganaFarmersCreated = [];
    for (const farmerData of telanganaFarmers) {
      const farmer = await User.create({
        name: farmerData.name,
        email: farmerData.email,
        password: hashedPassword,
        role: "farmer",
        phone: farmerData.phone,
      });

      await FarmerProfile.create({
        user: farmer._id,
        farmName: `${farmerData.name}'s Farm`,
        farmSize: farmerData.farmSize,
        location: {
          address: farmerData.location,
          city: farmerData.location.split(', ')[0],
          state: farmerData.location.split(', ')[1] || 'Telangana'
        },
        yearsOfExperience: farmerData.experience,
        specialties: [farmerData.specialization],
        certifications: [],
        description: `Dedicated ${farmerData.specialization} farmer from ${farmerData.location} with ${farmerData.experience} years of experience in modern agricultural techniques.`,
      });

      telanganaFarmersCreated.push(farmer);
    }
    console.log(`✅ Created ${telanganaFarmersCreated.length} farmers from Telangana`);

    // Combine all farmers
    const allFarmers = [...andhraFarmersCreated, ...telanganaFarmersCreated];
    const allFarmersData = [...andhraFarmers, ...telanganaFarmers];

    // Create a pool of products for each and every farmer
    console.log("🌾 Creating products so that EACH and EVERY farmer has at least 2 or 3 products...");
    const products = [];

    // Loop through each farmer and assign them 2 or 3 products
    for (let i = 0; i < allFarmers.length; i++) {
      const farmer = allFarmers[i];
      const farmerData = allFarmersData[i];
      const specialization = farmerData.specialization;

      // 1) Assign 2 or 3 specialization products
      const numSpecProducts = Math.floor(Math.random() * 2) + 2; // 2 or 3
      
      // Look for products matching the specialization
      let matchingProductPrototypes = productsData.filter(p => 
        p.name.toLowerCase().includes(specialization.toLowerCase()) || 
        p.description.toLowerCase().includes(specialization.toLowerCase()) ||
        p.category.toLowerCase().includes(specialization.toLowerCase())
      );

      // If we don't have prototypes for this specialization (e.g., Cotton), formulate on the fly!
      if (matchingProductPrototypes.length === 0) {
        matchingProductPrototypes = [
          { name: `Fresh ${specialization}`, description: `High quality ${specialization} directly from the farm`, category: "Vegetables", price: 50, unit: "kg", stock: 100, isOrganic: true },
          { name: `Premium ${specialization}`, description: `Export quality ${specialization}`, category: "Vegetables", price: 75, unit: "kg", stock: 50, isOrganic: false },
          { name: `Raw ${specialization}`, description: `100% natural ${specialization}`, category: "Vegetables", price: 60, unit: "kg", stock: 200, isOrganic: true }
        ];
      }

      // Fill exactly numSpecProducts
      let selectedSpecProducts = [];
      for (let j = 0; j < numSpecProducts; j++) {
        // Just take them circularly if we run out
        selectedSpecProducts.push(matchingProductPrototypes[j % matchingProductPrototypes.length]);
      }

      // 2) Assign 2 other random products
      let shuffledProductsData = [...productsData].sort(() => 0.5 - Math.random());
      let selectedRandomProducts = shuffledProductsData.slice(0, 2);

      // Combine them
      const totalSelectedProducts = [...selectedSpecProducts, ...selectedRandomProducts];

      for (const productData of totalSelectedProducts) {
        // Find category (fallback to first if not exactly matching)
        let category = categories.find(c => c.name === productData.category);
        if (!category) category = categories[0];

        const product = await Product.create({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          unit: productData.unit,
          category: category._id,
          farmer: farmer._id,
          quantityAvailable: productData.stock,
          isOrganic: productData.isOrganic,
          images: [`https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000000)}?w=400&h=300&fit=crop`],
          rating: (Math.random() * 1.5 + 3.5).toFixed(1), // 3.5 to 5.0
          totalReviews: Math.floor(Math.random() * 50) + 10,
        });

        products.push(product);
      }
    }
    console.log(`✅ Created ${products.length} products`);

    // Create test consumers
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

    console.log("\n🎉 Enhanced database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Andhra Pradesh Farmers: ${andhraFarmersCreated.length}`);
    console.log(`   - Telangana Farmers: ${telanganaFarmersCreated.length}`);
    console.log(`   - Total Farmers: ${allFarmers.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Consumers: ${consumers.length}`);
    console.log("\n🔐 Login Credentials:");
    console.log("   Password for all users: farmer123");
    console.log("\n👨‍🌾 Andhra Pradesh Farmers:");
    andhraFarmers.forEach(f => console.log(`   - ${f.email} (${f.specialization})`));
    console.log("\n👨‍🌾 Telangana Farmers:");
    telanganaFarmers.forEach(f => console.log(`   - ${f.email} (${f.specialization})`));
    console.log("\n👥 Consumers:");
    console.log("   - consumer1@kisanmithra.com to consumer5@kisanmithra.com");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
