/**
 * Verification Script for Saved Farmers API Implementation
 * 
 * This script verifies that all saved farmers API components are properly implemented.
 * Run this before running the integration tests.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Saved Farmers API Implementation\n');
console.log('='.repeat(60));
console.log('\n');

let allChecksPass = true;

// Helper function to check if file exists
const checkFile = (filePath, description) => {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}`);
  if (!exists) {
    console.log(`   Missing: ${filePath}`);
    allChecksPass = false;
  }
  return exists;
};

// Helper function to check if file contains text
const checkFileContains = (filePath, searchText, description) => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${description}`);
    console.log(`   File not found: ${filePath}`);
    allChecksPass = false;
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const contains = content.includes(searchText);
  const status = contains ? '✅' : '❌';
  console.log(`${status} ${description}`);
  if (!contains) {
    console.log(`   Missing text: "${searchText}"`);
    allChecksPass = false;
  }
  return contains;
};

console.log('📁 Checking File Structure:\n');

// Check model (should already exist)
checkFile('models/SavedFarmerModel.js', 'SavedFarmer model exists');

// Check controller
checkFile('controllers/savedFarmerController.js', 'SavedFarmer controller exists');

// Check routes
checkFile('routes/savedFarmerRoutes.js', 'SavedFarmer routes exist');

// Check test file
checkFile('test-saved-farmers.js', 'Integration test file exists');

// Check documentation
checkFile('docs/TASK_8.2_SAVED_FARMERS_API.md', 'API documentation exists');
checkFile('docs/TASK_8.2_SUMMARY.md', 'Summary documentation exists');

console.log('\n');
console.log('🔧 Checking Controller Implementation:\n');

// Check controller functions
checkFileContains(
  'controllers/savedFarmerController.js',
  'const saveFarmer',
  'saveFarmer function implemented'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'const getSavedFarmers',
  'getSavedFarmers function implemented'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'const unsaveFarmer',
  'unsaveFarmer function implemented'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'module.exports',
  'Controller exports functions'
);

console.log('\n');
console.log('🛣️  Checking Routes Configuration:\n');

// Check routes
checkFileContains(
  'routes/savedFarmerRoutes.js',
  'router.post("/:id/save"',
  'POST /farmers/:id/save route defined'
);

checkFileContains(
  'routes/savedFarmerRoutes.js',
  'router.get("/saved"',
  'GET /farmers/saved route defined'
);

checkFileContains(
  'routes/savedFarmerRoutes.js',
  'router.delete("/:id/save"',
  'DELETE /farmers/:id/save route defined'
);

checkFileContains(
  'routes/savedFarmerRoutes.js',
  'verifyToken',
  'Authentication middleware applied'
);

checkFileContains(
  'routes/savedFarmerRoutes.js',
  'isConsumer',
  'Consumer role middleware applied'
);

console.log('\n');
console.log('🔌 Checking Server Integration:\n');

// Check server.js
checkFileContains(
  'server.js',
  "require('./routes/savedFarmerRoutes')",
  'Saved farmer routes imported in server.js'
);

checkFileContains(
  'server.js',
  "app.use('/api/farmers', savedFarmerRoutes)",
  'Saved farmer routes registered in server.js'
);

console.log('\n');
console.log('🧪 Checking Test Coverage:\n');

// Check test file
checkFileContains(
  'test-saved-farmers.js',
  'Save a farmer',
  'Test for saving farmer'
);

checkFileContains(
  'test-saved-farmers.js',
  'Get saved farmers',
  'Test for getting saved farmers'
);

checkFileContains(
  'test-saved-farmers.js',
  'Unsave a farmer',
  'Test for unsaving farmer'
);

checkFileContains(
  'test-saved-farmers.js',
  'Duplicate save prevention',
  'Test for duplicate prevention'
);

checkFileContains(
  'test-saved-farmers.js',
  'Authentication requirement',
  'Test for authentication'
);

console.log('\n');
console.log('🔒 Checking Security Implementation:\n');

// Check security features
checkFileContains(
  'controllers/savedFarmerController.js',
  'req.user',
  'Uses authenticated user from middleware'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'role !== "farmer"',
  'Validates farmer role'
);

checkFileContains(
  'routes/savedFarmerRoutes.js',
  'router.use(verifyToken)',
  'Token verification middleware applied'
);

checkFileContains(
  'routes/savedFarmerRoutes.js',
  'router.use(isConsumer)',
  'Consumer role check middleware applied'
);

console.log('\n');
console.log('📊 Checking Error Handling:\n');

// Check error handling
checkFileContains(
  'controllers/savedFarmerController.js',
  'try {',
  'Try-catch blocks implemented'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'catch (error)',
  'Error handling implemented'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'res.status(404)',
  'Handles 404 errors'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'res.status(400)',
  'Handles 400 errors'
);

checkFileContains(
  'controllers/savedFarmerController.js',
  'res.status(500)',
  'Handles 500 errors'
);

console.log('\n');
console.log('='.repeat(60));
console.log('\n');

if (allChecksPass) {
  console.log('✅ All verification checks passed!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Ensure MongoDB is running');
  console.log('   2. Seed the database: node seedData.js');
  console.log('   3. Start the server: npm run dev');
  console.log('   4. Run integration tests: node test-saved-farmers.js');
  console.log('\n');
  process.exit(0);
} else {
  console.log('❌ Some verification checks failed!');
  console.log('\n⚠️  Please review the errors above and fix the issues.');
  console.log('\n');
  process.exit(1);
}
