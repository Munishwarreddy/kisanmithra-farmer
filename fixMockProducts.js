const fs = require('fs');

let content = fs.readFileSync('client/src/data/mockData.js', 'utf8');

// We will replace the entire export const products = [...] block with dynamically generated products
// based on exactly what every farmer has in their specialtyProducts array!

// First, let's inject a self-executing logic that reads all farmers and builds the products array.
const injection = `
// Auto-generated products explicitly strictly mapping ALL specialtyProducts and total counts
export const products = [...andhraFarmers, ...telanganaFarmers].flatMap((farmer, index) => {
  if (!farmer.specialtyProducts) return [];
  
  // ensure totalProducts matches exact length
  farmer.totalProducts = farmer.specialtyProducts.length;

  return farmer.specialtyProducts.map((sp, spIndex) => ({
    _id: \`auto_prod_\${farmer._id}_\${spIndex}\`,
    name: sp.name,
    description: \`Farm-fresh \${sp.name} directly from \${farmer.name}'s farm located in \${farmer.farmLocation}.\`,
    price: sp.price,
    unit: sp.unit,
    category: "cat1", // Default visual category
    categoryName: farmer.specialization,
    farmer: farmer._id,
    farmerName: farmer.name,
    stock: Math.floor(Math.random() * 500) + 100,
    isOrganic: Math.random() > 0.5,
    image: sp.image || "https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400&h=300&fit=crop",
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviewCount: Math.floor(Math.random() * 100) + 10
  }));
});
`;

// Regex to replace from `export const products = [` to the end of the file.
// Since mockData.js ends with the products array and reviews array.
// Wait, mockData.js also has reviews! I cannot just replace to the end.
// Let's replace only the products array.
content = content.replace(/export const products = \[[\s\S]*?\];/g, injection);

fs.writeFileSync('client/src/data/mockData.js', content);
