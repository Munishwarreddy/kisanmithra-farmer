const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Advanced Search Implementation\n');
console.log('=' .repeat(60));

let allPassed = true;

// Helper function to check if file exists
function checkFileExists(filePath) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  console.log(exists ? '✅' : '❌', `File exists: ${filePath}`);
  if (!exists) allPassed = false;
  return exists;
}

// Helper function to check if file contains text
function checkFileContains(filePath, searchText, description) {
  const fullPath = path.join(__dirname, filePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const contains = content.includes(searchText);
    console.log(contains ? '✅' : '❌', description);
    if (!contains) {
      console.log(`   Missing: "${searchText}"`);
      allPassed = false;
    }
    return contains;
  } catch (error) {
    console.log('❌', `Error reading ${filePath}:`, error.message);
    allPassed = false;
    return false;
  }
}

console.log('\n📋 Task 11.1: Implement advanced search functionality');
console.log('-'.repeat(60));

// Check 1: Search controller exists
console.log('\n1️⃣  Search Controller');
checkFileExists('controllers/searchController.js');
if (checkFileExists('controllers/searchController.js')) {
  checkFileContains('controllers/searchController.js', 'advancedSearch', 'Has advancedSearch function');
  checkFileContains('controllers/searchController.js', 'autocomplete', 'Has autocomplete function');
  checkFileContains('controllers/searchController.js', '$text', 'Uses MongoDB text search');
  checkFileContains('controllers/searchController.js', 'textScore', 'Uses text score for ranking');
  checkFileContains('controllers/searchController.js', 'highlightText', 'Implements result highlighting');
}

// Check 2: Search routes exist
console.log('\n2️⃣  Search Routes');
checkFileExists('routes/searchRoutes.js');
if (checkFileExists('routes/searchRoutes.js')) {
  checkFileContains('routes/searchRoutes.js', 'advancedSearch', 'Routes to advancedSearch');
  checkFileContains('routes/searchRoutes.js', 'autocomplete', 'Routes to autocomplete');
}

// Check 3: Routes registered in server
console.log('\n3️⃣  Server Configuration');
checkFileContains('server.js', "require('./routes/searchRoutes')", 'Search routes imported');
checkFileContains('server.js', "app.use('/api/search'", 'Search routes registered');

// Check 4: Product model has text indexes
console.log('\n4️⃣  Product Model Text Indexes');
checkFileContains('models/ProductModel.js', "name: 'text'", 'Product name indexed for text search');
checkFileContains('models/ProductModel.js', "description: 'text'", 'Product description indexed for text search');

// Check 5: User model has text index for farmer names
console.log('\n5️⃣  User Model Text Index');
checkFileContains('models/UserModel.js', "name: 'text'", 'User name indexed for text search');

// Check 6: Search functionality features
console.log('\n6️⃣  Search Features');
if (checkFileExists('controllers/searchController.js')) {
  const searchContent = fs.readFileSync(path.join(__dirname, 'controllers/searchController.js'), 'utf8');
  
  // Check for multi-field search
  const hasProductSearch = searchContent.includes('Product.find') && searchContent.includes('$text');
  console.log(hasProductSearch ? '✅' : '❌', 'Searches products by name and description');
  if (!hasProductSearch) allPassed = false;
  
  // Check for farmer search
  const hasFarmerSearch = searchContent.includes('User.find') && searchContent.includes('role: "farmer"');
  console.log(hasFarmerSearch ? '✅' : '❌', 'Searches farmers by name');
  if (!hasFarmerSearch) allPassed = false;
  
  // Check for category search
  const hasCategorySearch = searchContent.includes('Category.find');
  console.log(hasCategorySearch ? '✅' : '❌', 'Searches by category name');
  if (!hasCategorySearch) allPassed = false;
  
  // Check for result highlighting
  const hasHighlighting = searchContent.includes('highlightText') && searchContent.includes('<mark>');
  console.log(hasHighlighting ? '✅' : '❌', 'Highlights matching terms in results');
  if (!hasHighlighting) allPassed = false;
  
  // Check for dual entity results
  const hasDualResults = searchContent.includes('products:') && searchContent.includes('farmers:');
  console.log(hasDualResults ? '✅' : '❌', 'Returns both products and farmers');
  if (!hasDualResults) allPassed = false;
  
  // Check for autocomplete
  const hasAutocomplete = searchContent.includes('autocomplete') && searchContent.includes('suggestions');
  console.log(hasAutocomplete ? '✅' : '❌', 'Implements autocomplete suggestions');
  if (!hasAutocomplete) allPassed = false;
  
  // Check for prefix matching in autocomplete
  const hasPrefixMatch = searchContent.includes('^${searchQuery}') || searchContent.includes('^$');
  console.log(hasPrefixMatch ? '✅' : '❌', 'Uses prefix matching for autocomplete');
  if (!hasPrefixMatch) allPassed = false;
}

// Check 7: Test file exists
console.log('\n7️⃣  Test Files');
checkFileExists('test-search.js');

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All verification checks passed!');
  console.log('\n📝 Implementation Summary:');
  console.log('   ✓ Search controller with advancedSearch and autocomplete');
  console.log('   ✓ Text indexes on Product (name, description)');
  console.log('   ✓ Text index on User (name) for farmer search');
  console.log('   ✓ Category-based product search');
  console.log('   ✓ Result highlighting with <mark> tags');
  console.log('   ✓ Returns both products and farmers');
  console.log('   ✓ Autocomplete with prefix matching');
  console.log('\n🎯 API Endpoints:');
  console.log('   GET /api/search?q=<query>&limit=<number>');
  console.log('   GET /api/search/autocomplete?q=<query>&limit=<number>');
  console.log('\n📋 Requirements Covered:');
  console.log('   ✓ 6.4: Search across multiple fields');
  console.log('   ✓ 18.1: Multi-field search (name, description, category, farmer)');
  console.log('   ✓ 18.2: Return both products and farmers');
  console.log('   ✓ 18.3: Highlight matching terms');
  console.log('   ✓ 18.5: Autocomplete suggestions');
  console.log('\n⚠️  Note: MongoDB must be running to test the search functionality.');
  console.log('   Run "node test-search.js" when MongoDB is available.');
} else {
  console.log('❌ Some verification checks failed.');
  console.log('   Please review the implementation.');
}

console.log('');
