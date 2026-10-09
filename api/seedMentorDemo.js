/**
 * 🌾 KisanMithra — Mentor Demo Seed Script
 * ============================================================
 * Creates exactly 5 realistic entries per collection for a
 * clean, impressive demo presentation to mentors.
 *
 * 🔐 Login Credentials (all use password: demo@123)
 *   Farmers:
 *     farmer1@kisanmithra.com  — Ramesh Kumar     (Organic Veggie Farmer, Telangana)
 *     farmer2@kisanmithra.com  — Surekha Devi     (Fruit Specialist, Maharashtra)
 *     farmer3@kisanmithra.com  — Arjun Singh      (Grain Farmer, Punjab)
 *     farmer4@kisanmithra.com  — Padma Reddy      (Spice Grower, Andhra Pradesh)
 *     farmer5@kisanmithra.com  — Gopal Nair       (Dairy Farmer, Kerala)
 *   Consumers:
 *     consumer1@kisanmithra.com — Priya Sharma    (Hyderabad)
 *     consumer2@kisanmithra.com — Rahul Mehta     (Mumbai)
 *     consumer3@kisanmithra.com — Divya Nair      (Bangalore)
 *     consumer4@kisanmithra.com — Aakash Patel    (Ahmedabad)
 *     consumer5@kisanmithra.com — Sunita Rao      (Chennai)
 *   Admin:
 *     admin@kisanmithra.com     — Admin User
 *
 * Usage: node seedMentorDemo.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User         = require('./models/UserModel');
const FarmerProfile = require('./models/FarmerProfileModel');
const Category     = require('./models/CategoryModel');
const Product      = require('./models/ProductModel');
const Order        = require('./models/OrderModel');
const Review       = require('./models/ReviewModel');
const Contract     = require('./models/ContractModel');
const Message      = require('./models/MessageModel');
const Subscription = require('./models/SubscriptionModel');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kisanmithra');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const daysAgo     = (n) => new Date(Date.now() - n * 86400000);
const convId      = (a, b) => [a.toString(), b.toString()].sort().join('_');

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Starting KisanMithra Mentor Demo Seed...\n');

  console.log('🗑️  Clearing previous demo data...');
  await Promise.all([
    User.deleteMany({}),
    FarmerProfile.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
    Contract.deleteMany({}),
    Message.deleteMany({}),
    Subscription.deleteMany({}),
  ]);
  console.log('   ✅ All collections cleared\n');

  const password = await bcrypt.hash('demo@123', 10);

  // CATEGORIES (5)
  console.log('📁 Creating 5 categories...');
  const categoryDocs = await Category.insertMany([
    { name: 'Vegetables',  description: 'Fresh farm vegetables' },
    { name: 'Fruits',      description: 'Seasonal and exotic fresh fruits' },
    { name: 'Grains',      description: 'Staple grains and cereals' },
    { name: 'Spices',      description: 'Aromatic spices and herbs' },
    { name: 'Dairy',       description: 'Farm-fresh dairy and honey' },
  ]);
  const [catVeg, catFruit, catGrain, catSpice, catDairy] = categoryDocs;
  console.log('   ✅ 5 categories created\n');

  // ADMIN
  console.log('🛡️  Creating admin user...');
  await User.create({ name: 'Admin User', email: 'admin@kisanmithra.com', password, role: 'admin', phone: '9000000000', isActive: true });
  console.log('   ✅ Admin created\n');

  // FARMERS (5)
  console.log('👨‍🌾 Creating 5 farmers with profiles...');
  const farmerDefs = [
    {
      user: { name: 'Ramesh Kumar', email: 'farmer1@kisanmithra.com', phone: '9876543210', role: 'farmer' },
      profile: {
        farmName: 'Green Valley Organic Farm', farmSize: 12,
        location: { address: 'Medchal Road', city: 'Hyderabad', state: 'Telangana', coordinates: { lat: 17.4985, lng: 78.3742 } },
        description: 'Third-generation farmer growing certified organic vegetables. No pesticides, drip irrigation, natural composting.',
        farmingPhilosophy: 'Nature first — healthy soil grows healthy food.',
        farmingPractices: ['organic', 'sustainable'],
        certifications: [{ name: 'India Organic', issuedBy: 'APEDA', issuedDate: new Date('2022-04-01'), expiryDate: new Date('2025-03-31') }],
        yearsOfExperience: 18, specialties: ['Tomatoes', 'Spinach', 'Okra'],
        rating: 4.8, totalReviews: 42, totalProducts: 5, totalOrders: 137, totalRevenue: 285000,
        acceptsPickup: true, acceptsDelivery: true, deliveryRadius: 30, isVerified: true,
      },
    },
    {
      user: { name: 'Surekha Devi', email: 'farmer2@kisanmithra.com', phone: '9765432109', role: 'farmer' },
      profile: {
        farmName: 'Nashik Fruit Paradise', farmSize: 20,
        location: { address: 'Gangapur Road', city: 'Nashik', state: 'Maharashtra', coordinates: { lat: 19.9975, lng: 73.7898 } },
        description: 'Running a 20-acre fruit orchard in Nashik — the grape capital of India. Specializing in Alphonso mangoes, pomegranates and table grapes.',
        farmingPhilosophy: 'Every fruit tells the story of the soil it came from.',
        farmingPractices: ['sustainable'],
        certifications: [{ name: 'GlobalGAP', issuedBy: 'SGS India', issuedDate: new Date('2023-01-15'), expiryDate: new Date('2026-01-14') }],
        yearsOfExperience: 22, specialties: ['Alphonso Mangoes', 'Pomegranate', 'Grapes'],
        rating: 4.9, totalReviews: 78, totalProducts: 5, totalOrders: 204, totalRevenue: 680000,
        acceptsPickup: true, acceptsDelivery: true, deliveryRadius: 50, isVerified: true,
      },
    },
    {
      user: { name: 'Arjun Singh', email: 'farmer3@kisanmithra.com', phone: '9654321098', role: 'farmer' },
      profile: {
        farmName: 'Golden Fields Punjab', farmSize: 45,
        location: { address: 'Ludhiana-Chandigarh Road', city: 'Ludhiana', state: 'Punjab', coordinates: { lat: 30.9010, lng: 75.8573 } },
        description: 'Large-scale grain and pulse farmer in Punjab. Produces premium Basmati rice and wheat supplied to restaurants across North India.',
        farmingPhilosophy: 'Punjab feeds India — every grain counts.',
        farmingPractices: ['traditional', 'sustainable'],
        certifications: [],
        yearsOfExperience: 30, specialties: ['Basmati Rice', 'Wheat', 'Toor Dal'],
        rating: 4.6, totalReviews: 55, totalProducts: 5, totalOrders: 320, totalRevenue: 1250000,
        acceptsPickup: true, acceptsDelivery: false, deliveryRadius: 0, isVerified: true,
      },
    },
    {
      user: { name: 'Padma Reddy', email: 'farmer4@kisanmithra.com', phone: '9543210987', role: 'farmer' },
      profile: {
        farmName: 'Guntur Spice Garden', farmSize: 8,
        location: { address: 'Narasaraopet Road', city: 'Guntur', state: 'Andhra Pradesh', coordinates: { lat: 16.3067, lng: 80.4365 } },
        description: 'Guntur is famous for the hottest chillies in India. Growing world-class green chillies, turmeric, ginger and garlic.',
        farmingPhilosophy: 'Good spices begin with patience and passion.',
        farmingPractices: ['organic', 'traditional'],
        certifications: [{ name: 'Organic India Certified', issuedBy: 'APEDA', issuedDate: new Date('2021-06-01'), expiryDate: new Date('2024-05-31') }],
        yearsOfExperience: 14, specialties: ['Green Chillies', 'Turmeric', 'Ginger'],
        rating: 4.7, totalReviews: 33, totalProducts: 5, totalOrders: 98, totalRevenue: 175000,
        acceptsPickup: true, acceptsDelivery: true, deliveryRadius: 40, isVerified: true,
      },
    },
    {
      user: { name: 'Gopal Nair', email: 'farmer5@kisanmithra.com', phone: '9432109876', role: 'farmer' },
      profile: {
        farmName: 'Kerala Green Homestead', farmSize: 6,
        location: { address: 'Thrissur-Palakkad Road', city: 'Thrissur', state: 'Kerala', coordinates: { lat: 10.5276, lng: 76.2144 } },
        description: 'Traditional Kerala homestead producing A2 desi cow milk, pure forest honey and coconuts. Chemical-free, preservative-free.',
        farmingPhilosophy: 'Back to roots — traditional farming wisdom meets modern safety.',
        farmingPractices: ['organic', 'traditional'],
        certifications: [{ name: 'Kerala Organic Mission', issuedBy: 'KSSB', issuedDate: new Date('2022-09-01'), expiryDate: new Date('2025-08-31') }],
        yearsOfExperience: 25, specialties: ['A2 Cow Milk', 'Forest Honey', 'Desi Ghee'],
        rating: 4.9, totalReviews: 61, totalProducts: 5, totalOrders: 183, totalRevenue: 420000,
        acceptsPickup: true, acceptsDelivery: true, deliveryRadius: 20, isVerified: true,
      },
    },
  ];

  const farmers = [];
  for (const fd of farmerDefs) {
    const u = await User.create({ ...fd.user, password, isActive: true });
    await FarmerProfile.create({ user: u._id, ...fd.profile });
    farmers.push(u);
  }
  const [f1, f2, f3, f4, f5] = farmers;
  console.log('   ✅ 5 farmers + profiles created\n');

  // CONSUMERS (5)
  console.log('🛒 Creating 5 consumers...');
  const consumers = await User.insertMany([
    { name: 'Priya Sharma',  email: 'consumer1@kisanmithra.com', password, role: 'consumer', phone: '9111111111', isActive: true },
    { name: 'Rahul Mehta',   email: 'consumer2@kisanmithra.com', password, role: 'consumer', phone: '9222222222', isActive: true },
    { name: 'Divya Nair',    email: 'consumer3@kisanmithra.com', password, role: 'consumer', phone: '9333333333', isActive: true },
    { name: 'Aakash Patel',  email: 'consumer4@kisanmithra.com', password, role: 'consumer', phone: '9444444444', isActive: true },
    { name: 'Sunita Rao',    email: 'consumer5@kisanmithra.com', password, role: 'consumer', phone: '9555555555', isActive: true },
  ]);
  const [c1, c2, c3, c4, c5] = consumers;
  console.log('   ✅ 5 consumers created\n');

  // PRODUCTS (5)
  console.log('🌾 Creating 5 products...');
  const products = await Product.insertMany([
    { name: 'Organic Tomatoes', description: 'Sun-ripened organic tomatoes grown without pesticides. Rich in lycopene and Vitamin C. Harvested fresh every morning.', price: 35, unit: 'kg', category: catVeg._id, farmer: f1._id, quantityAvailable: 200, isOrganic: true, rating: 4.8, totalReviews: 38, images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'] },
    { name: 'Alphonso Mangoes', description: 'The king of mangoes — Devgad Alphonso from Nashik. Naturally ripened, no carbide. Sweet fibre-free pulp with heavenly aroma.', price: 600, unit: 'dozen', category: catFruit._id, farmer: f2._id, quantityAvailable: 80, isOrganic: false, rating: 4.9, totalReviews: 65, images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'] },
    { name: 'Premium Basmati Rice', description: '1121 variety long-grain Basmati directly from Punjab. Aged 12 months for maximum aroma. Each grain separate after cooking.', price: 120, unit: 'kg', category: catGrain._id, farmer: f3._id, quantityAvailable: 500, isOrganic: false, rating: 4.7, totalReviews: 49, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'] },
    { name: 'Guntur Green Chillies', description: 'Famous Guntur variety with intense heat and rich flavour. Used by South Indian restaurants. Harvested at peak ripeness.', price: 60, unit: 'kg', category: catSpice._id, farmer: f4._id, quantityAvailable: 150, isOrganic: true, rating: 4.6, totalReviews: 27, images: ['https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400'] },
    { name: 'Pure Forest Honey', description: 'Raw, unfiltered forest honey from wild beehives in Kerala forests. Rich in antioxidants, no heating, no additives.', price: 450, unit: 'kg', category: catDairy._id, farmer: f5._id, quantityAvailable: 40, isOrganic: true, rating: 4.9, totalReviews: 58, images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400'] },
  ]);
  const [p1, p2, p3, p4, p5] = products;
  console.log('   ✅ 5 products created\n');

  // ORDERS (5)
  console.log('📦 Creating 5 orders...');
  const makeOrder = async (i, consumer, farmer, product, qty, status, paymentStatus, paymentMethod, createdAt, deliveryDate, address) => {
    const subtotal = product.price * qty;
    const deliveryFee = subtotal >= 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.05);
    return Order.create({
      orderNumber: `ORD-20260829-${1000 + i}`,
      consumer, farmer,
      items: [{ product: product._id, name: product.name, quantity: qty, price: product.price, unit: product.unit }],
      subtotal, deliveryFee, tax, totalAmount: subtotal + deliveryFee + tax,
      status, paymentStatus, paymentMethod,
      deliveryAddress: address,
      deliveryDate, createdAt,
    });
  };
  const addrs = [
    { name: 'Priya Sharma',  phone: '9111111111', street: '12-A Banjara Hills',       city: 'Hyderabad',  state: 'Telangana',   pincode: '500034' },
    { name: 'Rahul Mehta',   phone: '9222222222', street: '7/B Andheri West',          city: 'Mumbai',     state: 'Maharashtra', pincode: '400058' },
    { name: 'Divya Nair',    phone: '9333333333', street: '24 Koramangala 4th Block',  city: 'Bangalore',  state: 'Karnataka',   pincode: '560034' },
    { name: 'Aakash Patel',  phone: '9444444444', street: '3 Vastrapur Lake Road',     city: 'Ahmedabad',  state: 'Gujarat',     pincode: '380015' },
    { name: 'Sunita Rao',    phone: '9555555555', street: '18 T Nagar Main Road',      city: 'Chennai',    state: 'Tamil Nadu',  pincode: '600017' },
  ];
  const o1 = await makeOrder(1, c1._id, f1._id, p1, 5,  'delivered', 'completed', 'upi',          daysAgo(12), daysAgo(8),      addrs[0]);
  const o2 = await makeOrder(2, c2._id, f2._id, p2, 2,  'shipped',   'completed', 'online',       daysAgo(4),  daysFromNow(1),  addrs[1]);
  const o3 = await makeOrder(3, c3._id, f3._id, p3, 10, 'confirmed', 'completed', 'bank_transfer',daysAgo(2),  daysFromNow(3),  addrs[2]);
  const o4 = await makeOrder(4, c4._id, f4._id, p4, 3,  'placed',    'pending',   'cash',         daysAgo(1),  daysFromNow(4),  addrs[3]);
  const o5 = await makeOrder(5, c5._id, f5._id, p5, 1,  'delivered', 'completed', 'upi',          daysAgo(20), daysAgo(15),     addrs[4]);
  console.log('   ✅ 5 orders created\n');

  // REVIEWS (5)
  console.log('⭐ Creating 5 reviews...');
  await Review.insertMany([
    {
      consumer: c1._id, product: p1._id, farmer: f1._id, order: o1._id, rating: 5,
      comment: 'Absolutely fresh tomatoes! I could smell the farm when I opened the bag. Ramesh bhai packed them so carefully. Will order every week!',
      farmerResponse: { comment: 'Dhanyawad Priya ji! Your satisfaction is my motivation. 🙏', respondedAt: daysAgo(7) },
    },
    {
      consumer: c5._id, product: p5._id, farmer: f5._id, order: o5._id, rating: 5,
      comment: 'Best honey I have ever tasted in my life. Completely different from bottled honey. Dark amber colour, rich taste. Highly recommend!',
      farmerResponse: { comment: 'Thank you Sunita ji! Our bees work hard in the Kerala forests for this. ❤️', respondedAt: daysAgo(12) },
    },
    {
      consumer: c2._id, product: p2._id, farmer: f2._id, order: o2._id, rating: 5,
      comment: 'These Alphonso mangoes are next level! The fragrance filled our entire flat. Ordered 3 dozens more for family.',
      farmerResponse: { comment: 'So happy you loved them Rahul ji! The Devgad trees are giving excellent yield 🥭', respondedAt: daysAgo(2) },
    },
    {
      consumer: c3._id, product: p3._id, farmer: f3._id, order: o3._id, rating: 4,
      comment: 'Really good Basmati rice. Made biryani and family loved it. Grains separate perfectly. Slight delay but quality is excellent.',
      farmerResponse: { comment: 'Thank you Divya ji! Sorry for the delay — we will do better next time! 🌾', respondedAt: daysAgo(1) },
    },
    {
      consumer: c4._id, product: p4._id, farmer: f4._id, order: o4._id, rating: 5,
      comment: 'Guntur chillies are fire! 🌶️ I am from Andhra and these are authentic. My mother recognised the smell immediately. Restaurant quality!',
    },
  ]);
  console.log('   ✅ 5 reviews created\n');

  // CONTRACTS (5)
  console.log('📝 Creating 5 contracts...');
  await Contract.insertMany([
    {
      contractNumber: 'CNT-20260829-10001', initiator: c1._id, recipient: f1._id, product: p1._id,
      quantity: 20, unit: 'kg', pricePerUnit: 32, totalValue: 20 * 32 * 3, duration: 3,
      startDate: daysAgo(10), endDate: daysFromNow(80), deliverySchedule: 'weekly',
      terms: 'Priya Sharma purchases 20kg Organic Tomatoes weekly for 3 months at Rs.32/kg. Free delivery within Hyderabad. Payment via UPI within 24 hours of delivery.',
      status: 'active',
      deliveries: [{ scheduledDate: daysAgo(7), quantity: 20, status: 'completed', orderId: o1._id }, { scheduledDate: daysFromNow(0), quantity: 20, status: 'pending' }],
    },
    {
      contractNumber: 'CNT-20260829-10002', initiator: c2._id, recipient: f2._id, product: p2._id,
      quantity: 5, unit: 'dozen', pricePerUnit: 550, totalValue: 5 * 550, duration: 1,
      startDate: daysFromNow(5), endDate: daysFromNow(35), deliverySchedule: 'on-demand',
      terms: 'Rahul Mehta contracts 5 dozen Alphonso Mangoes at Rs.550/dozen during peak season. Naturally ripened, carbide-free. Payment online within 12 hours.',
      status: 'pending', deliveries: [],
    },
    {
      contractNumber: 'CNT-20260829-10003', initiator: c3._id, recipient: f3._id, product: p3._id,
      quantity: 50, unit: 'kg', pricePerUnit: 110, totalValue: 50 * 110 * 6, duration: 6,
      startDate: daysAgo(30), endDate: daysFromNow(150), deliverySchedule: 'monthly',
      terms: 'Divya Nair (Nair Kitchen restaurant) contracts 50kg Premium Basmati Rice monthly for 6 months at Rs.110/kg. Payment bank transfer within 3 days.',
      status: 'active',
      deliveries: [{ scheduledDate: daysAgo(28), quantity: 50, status: 'completed', orderId: o3._id }, { scheduledDate: daysFromNow(3), quantity: 50, status: 'pending' }],
    },
    {
      contractNumber: 'CNT-20260829-10004', initiator: c4._id, recipient: f4._id, product: p4._id,
      quantity: 10, unit: 'kg', pricePerUnit: 55, totalValue: 10 * 55 * 2, duration: 2,
      startDate: daysAgo(5), endDate: daysFromNow(55), deliverySchedule: 'weekly',
      terms: 'Aakash Patel (hotel supplier) contracts 10kg Guntur Green Chillies every two weeks for 2 months at Rs.55/kg. Grade A freshness guaranteed. Cash on delivery.',
      status: 'active',
      deliveries: [{ scheduledDate: daysAgo(3), quantity: 10, status: 'completed', orderId: o4._id }, { scheduledDate: daysFromNow(11), quantity: 10, status: 'pending' }],
    },
    {
      contractNumber: 'CNT-20260829-10005', initiator: c5._id, recipient: f5._id, product: p5._id,
      quantity: 2, unit: 'kg', pricePerUnit: 420, totalValue: 2 * 420 * 12, duration: 12,
      startDate: daysAgo(60), endDate: daysFromNow(305), deliverySchedule: 'monthly',
      terms: 'Sunita Rao subscribes to 2kg Pure Forest Honey monthly for one year at Rs.420/kg. Raw unfiltered, batch purity tested. Payment UPI within 24 hours.',
      status: 'active',
      deliveries: [{ scheduledDate: daysAgo(55), quantity: 2, status: 'completed', orderId: o5._id }, { scheduledDate: daysAgo(25), quantity: 2, status: 'completed' }, { scheduledDate: daysFromNow(5), quantity: 2, status: 'pending' }],
    },
  ]);
  console.log('   ✅ 5 contracts created\n');

  // MESSAGES (5 conversations x 3 messages)
  console.log('💬 Creating 5 conversations (3 messages each)...');
  const convos = [
    { cid: convId(c1._id, f1._id), msgs: [
      { s: c1, r: f1, text: 'Namaste Ramesh ji! I saw your organic tomatoes. Can you do 5kg every week? My family is large and we cook daily.', sent: { label: 'positive', confidence: 0.92, emoji: '😊' } },
      { s: f1, r: c1, text: 'Namaste Priya ji! Yes, I can deliver 5kg weekly. For regular customers I give Rs.32/kg instead of Rs.35. Free delivery within Hyderabad. Interest hai?', sent: { label: 'positive', confidence: 0.88, emoji: '😊' } },
      { s: c1, r: f1, text: 'Bilkul! Rs.32/kg is perfect. Let us start a contract so the deal is clear on both sides.', sent: { label: 'positive', confidence: 0.95, emoji: '😊' } },
    ]},
    { cid: convId(c2._id, f2._id), msgs: [
      { s: c2, r: f2, text: 'Hi Surekha ji! Are these real Devgad Alphonso or regular ones? Last time I got cheated with Kesar mangoes labelled as Alphonso.', sent: { label: 'urgent', confidence: 0.78, emoji: '⚠️' } },
      { s: f2, r: c2, text: 'I understand Rahul ji! Ours are genuine Devgad GI-certified Alphonso. I can send a video of the trees and the GI certificate. No carbide at all.', sent: { label: 'positive', confidence: 0.91, emoji: '😊' } },
      { s: c2, r: f2, text: 'That video really helped, thank you! Placing order for 2 dozens. If quality is good I will order 10 dozens for my office party!', sent: { label: 'positive', confidence: 0.93, emoji: '😊' } },
    ]},
    { cid: convId(c3._id, f3._id), msgs: [
      { s: c3, r: f3, text: 'Arjun ji, I run a restaurant in Bangalore. We need 50kg Basmati monthly. What is your bulk price and can you guarantee consistency?', sent: { label: 'neutral', confidence: 0.85, emoji: '😐' } },
      { s: f3, r: c3, text: 'Divya ji, for 50kg monthly I can give Rs.110/kg fixed. Same batch quality — GI-tagged 1121 variety. Supplying 5 Delhi restaurants for 3 years. Can share references.', sent: { label: 'positive', confidence: 0.89, emoji: '😊' } },
      { s: c3, r: f3, text: 'Please share references. Can we do a 6-month contract? Stable supply is very important for my kitchen planning.', sent: { label: 'neutral', confidence: 0.82, emoji: '😐' } },
    ]},
    { cid: convId(c4._id, f4._id), msgs: [
      { s: c4, r: f4, text: 'URGENT: My hotel needs 10kg green chillies by tomorrow morning. My regular supplier failed. Can you do next-day delivery?', sent: { label: 'urgent', confidence: 0.94, emoji: '⚠️' } },
      { s: f4, r: c4, text: 'Yes Aakash ji! I have 15kg freshly harvested today. I can send 10kg by bus parcel by 4 PM. Total Rs.600. Confirm?', sent: { label: 'positive', confidence: 0.87, emoji: '😊' } },
      { s: c4, r: f4, text: 'Confirmed! Payment sent via UPI — check your phone. You saved me today! Want to set up regular supply.', sent: { label: 'positive', confidence: 0.96, emoji: '😊' } },
    ]},
    { cid: convId(c5._id, f5._id), msgs: [
      { s: c5, r: f5, text: 'Gopal ji, how do I know the honey is pure forest honey and not adulterated? Is there any certificate?', sent: { label: 'neutral', confidence: 0.80, emoji: '😐' } },
      { s: f5, r: c5, text: 'Valid question Sunita ji! Our honey is tested by Kerala Forest Department lab. I can share the test report. Pure honey also sinks in water — adulterated floats.', sent: { label: 'positive', confidence: 0.93, emoji: '😊' } },
      { s: c5, r: f5, text: 'The test report convinced me! Placing order for 1kg. If it is what you say — and I am sure it will be — I want 2kg monthly subscription!', sent: { label: 'positive', confidence: 0.95, emoji: '😊' } },
    ]},
  ];

  let msgCount = 0;
  for (const conv of convos) {
    for (const m of conv.msgs) {
      await Message.create({ conversationId: conv.cid, sender: m.s._id, recipient: m.r._id, content: m.text, isRead: true, sentiment: { ...m.sent, analyzedAt: daysAgo(1) }, originalLanguage: 'en' });
      msgCount++;
    }
  }
  console.log(`   ✅ ${msgCount} messages across 5 conversations created\n`);

  // SUBSCRIPTIONS (5)
  console.log('🔄 Creating 5 subscriptions...');
  await Subscription.insertMany([
    { consumer: c1._id, farmer: f1._id, product: p1._id, quantity: 5,  frequency: 'weekly',   startDate: daysAgo(14), nextDeliveryDate: daysFromNow(0), status: 'active', paymentMethod: 'upi',          totalDeliveries: 12, completedDeliveries: 2, deliveryAddress: { name: 'Priya Sharma',  phone: '9111111111', street: '12-A Banjara Hills',       city: 'Hyderabad',  state: 'Telangana',   pincode: '500034' } },
    { consumer: c2._id, farmer: f2._id, product: p2._id, quantity: 2,  frequency: 'weekly',   startDate: daysFromNow(5), nextDeliveryDate: daysFromNow(5),  status: 'active', paymentMethod: 'online',       totalDeliveries: 4,  completedDeliveries: 0, deliveryAddress: { name: 'Rahul Mehta',   phone: '9222222222', street: '7/B Andheri West',          city: 'Mumbai',     state: 'Maharashtra', pincode: '400058' } },
    { consumer: c3._id, farmer: f3._id, product: p3._id, quantity: 50, frequency: 'monthly',  startDate: daysAgo(30), nextDeliveryDate: daysFromNow(3),  status: 'active', paymentMethod: 'bank_transfer', totalDeliveries: 6,  completedDeliveries: 1, deliveryAddress: { name: 'Divya Nair',    phone: '9333333333', street: '24 Koramangala 4th Block',  city: 'Bangalore',  state: 'Karnataka',   pincode: '560034' } },
    { consumer: c4._id, farmer: f4._id, product: p4._id, quantity: 10, frequency: 'biweekly', startDate: daysAgo(5),  nextDeliveryDate: daysFromNow(9),  status: 'active', paymentMethod: 'cash',         totalDeliveries: 4,  completedDeliveries: 1, deliveryAddress: { name: 'Aakash Patel',  phone: '9444444444', street: '3 Vastrapur Lake Road',     city: 'Ahmedabad',  state: 'Gujarat',     pincode: '380015' } },
    { consumer: c5._id, farmer: f5._id, product: p5._id, quantity: 2,  frequency: 'monthly',  startDate: daysAgo(60), nextDeliveryDate: daysFromNow(5),  status: 'active', paymentMethod: 'upi',          totalDeliveries: 12, completedDeliveries: 2, deliveryAddress: { name: 'Sunita Rao',    phone: '9555555555', street: '18 T Nagar Main Road',      city: 'Chennai',    state: 'Tamil Nadu',  pincode: '600017' } },
  ]);
  console.log('   ✅ 5 subscriptions created\n');

  // SUMMARY
  console.log('═'.repeat(62));
  console.log('🎉  KisanMithra Mentor Demo Seed COMPLETE!');
  console.log('═'.repeat(62));
  console.log('\n📊 DATA CREATED (5 entries per collection)');
  console.log('────────────────────────────────────────────────────────────');
  console.log('  Categories    : 5');
  console.log('  Farmers       : 5  (+5 farmer profiles)');
  console.log('  Consumers     : 5');
  console.log('  Products      : 5');
  console.log('  Orders        : 5  (delivered×2, shipped, confirmed, placed)');
  console.log('  Reviews       : 5  (all with detailed comments)');
  console.log('  Contracts     : 5  (active×4, pending×1)');
  console.log('  Messages      : 15 (5 conversations × 3 messages each)');
  console.log('  Subscriptions : 5  (all active)');
  console.log('\n🔐 LOGIN CREDENTIALS  (password: demo@123 for all accounts)');
  console.log('────────────────────────────────────────────────────────────');
  console.log('  FARMERS:');
  console.log('    farmer1@kisanmithra.com  →  Ramesh Kumar   (Organic Veggies, Hyderabad)');
  console.log('    farmer2@kisanmithra.com  →  Surekha Devi   (Fruits, Nashik)');
  console.log('    farmer3@kisanmithra.com  →  Arjun Singh    (Grains, Ludhiana)');
  console.log('    farmer4@kisanmithra.com  →  Padma Reddy    (Spices, Guntur)');
  console.log('    farmer5@kisanmithra.com  →  Gopal Nair     (Dairy & Honey, Thrissur)');
  console.log('  CONSUMERS:');
  console.log('    consumer1@kisanmithra.com →  Priya Sharma  (Hyderabad)');
  console.log('    consumer2@kisanmithra.com →  Rahul Mehta   (Mumbai)');
  console.log('    consumer3@kisanmithra.com →  Divya Nair    (Bangalore)');
  console.log('    consumer4@kisanmithra.com →  Aakash Patel  (Ahmedabad)');
  console.log('    consumer5@kisanmithra.com →  Sunita Rao    (Chennai)');
  console.log('  ADMIN:');
  console.log('    admin@kisanmithra.com     →  Admin User');
  console.log('\n🌐 App: http://localhost:8080');
  console.log('═'.repeat(62));

  process.exit(0);
};

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });