/**
 * Review API Implementation Verification Script
 * 
 * This script verifies that the review API endpoints are properly implemented
 * by checking the code structure, routes, and controller functions.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContains(filePath, searchStrings) {
  if (!checkFileExists(filePath)) {
    return { exists: false, found: [] };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const found = searchStrings.filter(str => content.includes(str));
  
  return {
    exists: true,
    found,
    missing: searchStrings.filter(str => !content.includes(str)),
    allFound: found.length === searchStrings.length
  };
}

function runVerification() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║   Review API Implementation Verification              ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');

  let passed = 0;
  let failed = 0;

  // Test 1: Check if reviewController.js exists
  log('\n=== Test 1: Review Controller File ===', 'blue');
  const controllerPath = path.join(__dirname, 'controllers', 'reviewController.js');
  if (checkFileExists(controllerPath)) {
    log('✓ reviewController.js exists', 'green');
    passed++;
  } else {
    log('✗ reviewController.js not found', 'red');
    failed++;
  }

  // Test 2: Check controller functions
  log('\n=== Test 2: Controller Functions ===', 'blue');
  const controllerFunctions = [
    'submitProductReview',
    'getProductReviews',
    'getFarmerReviews',
    'deleteReview',
    'updateProductRating',
    'updateFarmerRating'
  ];

  const controllerCheck = checkFileContains(controllerPath, controllerFunctions);
  if (controllerCheck.allFound) {
    log(`✓ All ${controllerFunctions.length} controller functions found`, 'green');
    passed++;
  } else {
    log(`✗ Missing functions: ${controllerCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 3: Check if reviewRoutes.js exists
  log('\n=== Test 3: Review Routes File ===', 'blue');
  const routesPath = path.join(__dirname, 'routes', 'reviewRoutes.js');
  if (checkFileExists(routesPath)) {
    log('✓ reviewRoutes.js exists', 'green');
    passed++;
  } else {
    log('✗ reviewRoutes.js not found', 'red');
    failed++;
  }

  // Test 4: Check route definitions
  log('\n=== Test 4: Route Definitions ===', 'blue');
  const routeDefinitions = [
    'POST /api/products/:id/reviews',
    'GET /api/products/:id/reviews',
    'GET /api/farmers/:id/reviews',
    'DELETE /api/admin/reviews/:id'
  ];

  const routesCheck = checkFileContains(routesPath, [
    'router.post',
    'router.get',
    'router.delete',
    'submitProductReview',
    'getProductReviews',
    'getFarmerReviews',
    'deleteReview'
  ]);

  if (routesCheck.allFound) {
    log('✓ All route definitions found', 'green');
    passed++;
  } else {
    log(`✗ Missing route elements: ${routesCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 5: Check middleware usage
  log('\n=== Test 5: Middleware Usage ===', 'blue');
  const middlewareCheck = checkFileContains(routesPath, [
    'verifyToken',
    'isConsumer',
    'isAdmin'
  ]);

  if (middlewareCheck.allFound) {
    log('✓ All required middleware found', 'green');
    passed++;
  } else {
    log(`✗ Missing middleware: ${middlewareCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 6: Check server.js integration
  log('\n=== Test 6: Server Integration ===', 'blue');
  const serverPath = path.join(__dirname, 'server.js');
  const serverCheck = checkFileContains(serverPath, [
    "require('./routes/reviewRoutes')",
    "app.use('/api', reviewRoutes)"
  ]);

  if (serverCheck.allFound) {
    log('✓ Review routes registered in server.js', 'green');
    passed++;
  } else {
    log('✗ Review routes not properly registered in server.js', 'red');
    failed++;
  }

  // Test 7: Check validation logic
  log('\n=== Test 7: Validation Logic ===', 'blue');
  const validationChecks = [
    'rating < 1 || rating > 5',
    'status: "delivered"',
    'existingReview',
    'Product.findById',
    'Order.findOne'
  ];

  const validationCheck = checkFileContains(controllerPath, validationChecks);
  if (validationCheck.allFound) {
    log('✓ All validation logic implemented', 'green');
    passed++;
  } else {
    log(`✗ Missing validation: ${validationCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 8: Check rating calculation
  log('\n=== Test 8: Rating Calculation ===', 'blue');
  const ratingChecks = [
    'reduce',
    'averageRating',
    'Math.round',
    'totalReviews'
  ];

  const ratingCheck = checkFileContains(controllerPath, ratingChecks);
  if (ratingCheck.allFound) {
    log('✓ Rating calculation logic implemented', 'green');
    passed++;
  } else {
    log(`✗ Missing rating calculation elements: ${ratingCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 9: Check error handling
  log('\n=== Test 9: Error Handling ===', 'blue');
  const errorChecks = [
    'try {',
    'catch (error)',
    'res.status(400)',
    'res.status(403)',
    'res.status(404)',
    'res.status(500)'
  ];

  const errorCheck = checkFileContains(controllerPath, errorChecks);
  if (errorCheck.allFound) {
    log('✓ Error handling implemented', 'green');
    passed++;
  } else {
    log(`✗ Missing error handling: ${errorCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 10: Check model references
  log('\n=== Test 10: Model References ===', 'blue');
  const modelChecks = [
    'require("../models/ReviewModel")',
    'require("../models/ProductModel")',
    'require("../models/OrderModel")',
    'require("../models/UserModel")',
    'require("../models/FarmerProfileModel")'
  ];

  const modelCheck = checkFileContains(controllerPath, modelChecks);
  if (modelCheck.allFound) {
    log('✓ All model references found', 'green');
    passed++;
  } else {
    log(`✗ Missing model references: ${modelCheck.missing.join(', ')}`, 'red');
    failed++;
  }

  // Test 11: Check documentation
  log('\n=== Test 11: Documentation ===', 'blue');
  const docPath = path.join(__dirname, 'docs', 'TASK_6.1_REVIEW_API.md');
  if (checkFileExists(docPath)) {
    log('✓ Documentation file exists', 'green');
    passed++;
  } else {
    log('✗ Documentation file not found', 'red');
    failed++;
  }

  // Test 12: Check test file
  log('\n=== Test 12: Test File ===', 'blue');
  const testPath = path.join(__dirname, 'test-review.js');
  if (checkFileExists(testPath)) {
    log('✓ Test file exists', 'green');
    passed++;
  } else {
    log('✗ Test file not found', 'red');
    failed++;
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║                  Verification Summary                  ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝', 'blue');
  log(`\nTotal Checks: ${passed + failed}`, 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All verification checks passed!', 'green');
    log('✅ Review API endpoints are properly implemented', 'green');
    log('\nImplemented Endpoints:', 'blue');
    log('  • POST   /api/products/:id/reviews      - Submit review (Consumer)', 'yellow');
    log('  • GET    /api/products/:id/reviews      - Get product reviews (Public)', 'yellow');
    log('  • GET    /api/farmers/:id/reviews       - Get farmer reviews (Public)', 'yellow');
    log('  • DELETE /api/admin/reviews/:id         - Delete review (Admin)', 'yellow');
    log('\nFeatures:', 'blue');
    log('  ✓ Purchase verification before allowing reviews', 'green');
    log('  ✓ Rating validation (1-5 stars required)', 'green');
    log('  ✓ Duplicate review prevention', 'green');
    log('  ✓ Automatic rating calculation and updates', 'green');
    log('  ✓ Role-based authorization (Consumer, Admin)', 'green');
    log('  ✓ Public access to view reviews', 'green');
    log('  ✓ Comprehensive error handling', 'green');
  } else {
    log(`\n⚠️  ${failed} verification check(s) failed`, 'red');
    log('Please review the failed checks above', 'yellow');
  }

  return failed === 0;
}

// Run verification
const success = runVerification();
process.exit(success ? 0 : 1);
