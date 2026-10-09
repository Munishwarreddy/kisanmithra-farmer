const fs = require('fs');
let content = fs.readFileSync('client/src/pages/FarmerDetailPage.jsx', 'utf8');

content = content.replace(
  'const { farmer, profile } = farmerProfile;',
`const { farmer, profile } = farmerProfile;
  const displayFarmer = { ...farmerProfile };
  if (farmer) {
    displayFarmer.name = farmer.name;
    displayFarmer.email = farmer.email;
    displayFarmer.phone = farmer.phone;
    displayFarmer.image = profile?.image || farmer.image || (profile?.farmImages && profile.farmImages[0]);
    displayFarmer.specialization = (profile?.specialties && profile.specialties[0]) || farmer.specialization || "Mixed Crops";
    displayFarmer.rating = profile?.rating || farmer.rating || "4.8";
    displayFarmer.bio = profile?.description || farmer.bio;
    displayFarmer.farmLocation = (profile?.location && profile.location.address) ? profile.location.address + ', ' + (profile.location.state || '') : farmer.farmLocation || 'India';
    displayFarmer.farmSize = profile?.farmSize || farmer.farmSize || 10;
    displayFarmer.experience = profile?.yearsOfExperience || farmer.experience || 5;
  }`
);

content = content.replace(/farmerProfile\.(name|image|specialization|rating|phone|email|farmLocation|farmSize|experience|bio)/g, 'displayFarmer.$1');

content = content.replace(
  'const farmerProducts = products.filter(p => p.farmer === id || p.farmer === farmer?._id);',
  'const farmerProducts = products.filter(p => p.farmer === id || p.farmer?._id === id || p.farmer === farmer?._id || p.farmer?._id === farmer?._id);'
);

fs.writeFileSync('client/src/pages/FarmerDetailPage.jsx', content);
