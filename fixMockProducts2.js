const fs = require('fs');

let content = fs.readFileSync('client/src/data/mockData.js', 'utf8');

// We will replace the entire export const products = [...] block with dynamically generated products
// based EXACTLY on the hardcoded farmer.totalProducts!

const injection = `
// Auto-generated products explicitly matching the hardcoded totalProducts count
export const products = [...andhraFarmers, ...telanganaFarmers].flatMap((farmer, index) => {
  if (!farmer.specialtyProducts || !farmer.totalProducts) return [];
  
  const generatedProducts = [];
  const targetCount = farmer.totalProducts; // 5, 3, 4, etc.
  
  for (let i = 0; i < targetCount; i++) {
    // Start by pushing their actual specialty items to ensure they exist
    if (i < farmer.specialtyProducts.length) {
      const sp = farmer.specialtyProducts[i];
      generatedProducts.push({
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
      });
    } else {
      // Create additional premium variations to reach the exact totalProducts count!
      const variationPrefixes = ["Premium", "Fresh", "Export Quality", "Raw", "Natural", "Hand-picked"];
      const prefix = variationPrefixes[i % variationPrefixes.length];
      
      generatedProducts.push({
        _id: \`auto_prod_\${farmer._id}_\${i}\`,
        name: \`\${prefix} \${farmer.specialization}\`,
        description: \`\${prefix} \${farmer.specialization} from \${farmer.farmLocation}.\`,
        price: Math.floor(Math.random() * 100) + 50,
        unit: "kg",
        category: "cat1", 
        categoryName: farmer.specialization,
        farmer: farmer._id,
        farmerName: farmer.name,
        stock: Math.floor(Math.random() * 300) + 50,
        isOrganic: Math.random() > 0.5,
        image: "https://images.unsplash.com/photo-1546470427-227a1e3b0b5f?w=400&h=300&fit=crop", // Safe generic image
        rating: (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 50) + 5
      });
    }
  }

  return generatedProducts;
});
`;

// Replace the previous generated products block
content = content.replace(/\/\/ Auto-generated products explicitly strictly mapping ALL specialtyProducts[\s\S]*?\}\);/g, injection);

fs.writeFileSync('client/src/data/mockData.js', content);
