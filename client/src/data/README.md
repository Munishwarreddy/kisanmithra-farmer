# Mock Data for KisanMithra

This directory contains mock data that is displayed in the client application when the API is not available or when `USE_MOCK_DATA` is set to `true` in the Redux slices.

## Data Included

### Farmers (20 total)

#### Andhra Pradesh Farmers (10)
1. **Venkata Ramana** - Rice specialist from Guntur
2. **Lakshmi Narayana** - Chillies specialist from Warangal
3. **Srinivasa Rao** - Turmeric specialist from Nizamabad
4. **Rama Krishna** - Cotton specialist from Kurnool
5. **Subba Rao** - Groundnut specialist from Anantapur
6. **Venkateswara Rao** - Mango specialist from Chittoor
7. **Narasimha Murthy** - Tomato specialist from Krishna
8. **Prasad Reddy** - Banana specialist from East Godavari
9. **Ramesh Babu** - Sugarcane specialist from West Godavari
10. **Satya Narayana** - Pulses specialist from Prakasam

#### Telangana Farmers (10)
1. **Krishna Reddy** - Rice specialist from Karimnagar
2. **Rajesh Kumar** - Maize specialist from Adilabad
3. **Mahesh Goud** - Cotton specialist from Nalgonda
4. **Suresh Naik** - Soybean specialist from Khammam
5. **Ravi Teja** - Vegetables specialist from Rangareddy
6. **Balaji Rao** - Turmeric specialist from Nizamabad
7. **Venkat Swamy** - Chillies specialist from Warangal
8. **Anand Kumar** - Mango specialist from Medak
9. **Prakash Goud** - Groundnut specialist from Mahbubnagar
10. **Sai Kumar** - Grapes specialist from Sangareddy

### Products (20 total)

#### Vegetables (5 products)
- Fresh Tomatoes
- Green Chillies
- Brinjal (Eggplant)
- Onions
- Potatoes

#### Fruits (5 products)
- Alphonso Mangoes
- Bananas
- Pomegranate
- Grapes
- Guava

#### Grains (4 products)
- Basmati Rice
- Sona Masoori Rice
- Maize (Corn)
- Jowar (Sorghum)

#### Pulses (3 products)
- Toor Dal
- Moong Dal
- Chana Dal

#### Spices (3 products)
- Turmeric Powder
- Red Chilli Powder
- Fresh Ginger

### Categories (5 total)
- Vegetables
- Fruits
- Grains
- Pulses
- Spices

## How to Use

The mock data is automatically used when:
1. `USE_MOCK_DATA` is set to `true` in the Redux slices (default)
2. The API is unavailable (automatic fallback)

To switch to real API data:
1. Make sure MongoDB is running
2. Run the seed script: `cd api && node seedDataEnhanced.js`
3. Set `USE_MOCK_DATA = false` in:
   - `client/src/redux/slices/productSlice.js`
   - `client/src/redux/slices/farmerSlice.js`
   - `client/src/redux/slices/categorySlice.js`

## Data Structure

Each farmer object includes:
- _id, name, email, phone, role
- farmSize, farmLocation, experience, specialization
- rating, totalProducts, image, bio

Each product object includes:
- _id, name, description, price, unit
- category, categoryName, farmer, farmerName
- stock, isOrganic, image, rating, reviewCount

## Images

All images use Unsplash placeholder URLs. These will load real images from Unsplash's API.
