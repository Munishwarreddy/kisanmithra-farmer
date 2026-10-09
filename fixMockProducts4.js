const fs = require('fs');
let content = fs.readFileSync('client/src/data/mockData.js', 'utf8');

const productsIndex = content.indexOf('export const products =');
content = content.substring(0, productsIndex);

const exportString = `export const products = [...andhraFarmers, ...telanganaFarmers].flatMap((farmer) => {
  if (!farmer.specialtyProducts) return [];
  
  return farmer.specialtyProducts.map((sp, i) => ({
    _id: \`auto_prod_\${farmer._id}_\${i}\`,
    name: sp.name,
    description: \`Farm-fresh \${sp.name} directly from \${farmer.name}'s farm located in \${farmer.farmLocation}.\`,
    price: sp.price,
    unit: sp.unit,
    category: "cat1", 
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

fs.writeFileSync('client/src/data/mockData.js', content + exportString);
