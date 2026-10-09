const fs = require('fs');

let content = fs.readFileSync('client/src/data/mockData.js', 'utf8');

// Find the export clause so we can safely delete the old implementations
const productsIndex = content.indexOf('export const products =');
content = content.substring(0, productsIndex);

const exportString = `export const products = [...andhraFarmers, ...telanganaFarmers].flatMap((farmer) => {
  if (!farmer.specialtyProducts) return [];
  
  const generatedProducts = [];
  const targetCount = farmer.totalProducts || farmer.specialtyProducts.length || 0;
  
  for (let i = 0; i < targetCount; i++) {
    if (i < farmer.specialtyProducts.length) {
      // Direct physical product map
      const sp = farmer.specialtyProducts[i];
      generatedProducts.push({
        _id: \`auto_prod_\${farmer._id}_\${i}\`,
        name: sp.name,
        description: \`Farm-fresh \${sp.name} directly from \${farmer.name}'s farm located in \${farmer.farmLocation}.\`,
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
        _id: \`auto_prod_\${farmer._id}_\${i}\`,
        name: \`\${prefix} \${fallbackName}\`,
        description: \`\${prefix} \${fallbackName} safely sourced from \${farmer.farmLocation}.\`,
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
`;

fs.writeFileSync('client/src/data/mockData.js', content + exportString);
