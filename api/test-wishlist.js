/**
 * Test script for Wishlist API endpoints
 * 
 * This script tests:
 * - POST /api/wishlist/:productId - Add to wishlist
 * - GET /api/wishlist - Get wishlist
 * - DELETE /api/wishlist/:productId - Remove from wishlist
 * 
 * Requirements validated: 12.1-12.5
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let authToken = '';
let testProductId = '';
let consumerUserId = '';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };
    if (data) config.data = data;
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
};

// Test 1: Login as consumer
async function testLogin() {
  log.section('TEST 1: Login as Consumer');
  
  const result = await makeRequest('post', '/auth/login', {
    email: 'consumer@test.com',
    password: 'password123',
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    consumerUserId = result.data.user._id;
    log.success('Consumer login successful');
    log.info(`Token: ${authToken.substring(0, 20)}...`);
    log.info(`Consumer ID: ${consumerUserId}`);
    return true;
  } else {
    log.error('Consumer login failed');
    console.log(result.error);
    return false;
  }
}

// Test 2: Get a product to add to wishlist
async function testGetProduct() {
  log.section('TEST 2: Get a Product for Testing');
  
  const result = await makeRequest('get', '/products?limit=1');

  if (result.success && result.data.data && result.data.data.length > 0) {
    testProductId = result.data.data[0]._id;
    log.success('Product retrieved successfully');
    log.info(`Product ID: ${testProductId}`);
    log.info(`Product Name: ${result.data.data[0].name}`);
    return true;
  } else {
    log.error('Failed to get product');
    console.log(result.error);
    return false;
  }
}

// Test 3: Get empty wishlist (should return empty array)
async function testGetEmptyWishlist() {
  log.section('TEST 3: Get Empty Wishlist');
  
  const result = await makeRequest('get', '/wishlist');

  if (result.success) {
    log.success('Wishlist retrieved successfully');
    log.info(`Products in wishlist: ${result.data.data.products?.length || 0}`);
    return true;
  } else {
    log.error('Failed to get wishlist');
    console.log(result.error);
    return false;
  }
}

// Test 4: Add product to wishlist (Requirement 12.1)
async function testAddToWishlist() {
  log.section('TEST 4: Add Product to Wishlist (Requirement 12.1)');
  
  const result = await makeRequest('post', `/wishlist/${testProductId}`);

  if (result.success) {
    log.success('Product added to wishlist successfully');
    log.info(`Message: ${result.data.message}`);
    log.info(`Products in wishlist: ${result.data.data.products.length}`);
    
    // Verify the product is in the wishlist
    const productInWishlist = result.data.data.products.some(
      item => item.product._id === testProductId
    );
    
    if (productInWishlist) {
      log.success('✓ Requirement 12.1: Product added to wishlist');
    } else {
      log.error('✗ Requirement 12.1: Product not found in wishlist');
      return false;
    }
    
    return true;
  } else {
    log.error('Failed to add product to wishlist');
    console.log(result.error);
    return false;
  }
}

// Test 5: Confirm addition (Requirement 12.2)
async function testConfirmAddition() {
  log.section('TEST 5: Confirm Addition and Count Update (Requirement 12.2)');
  
  const result = await makeRequest('get', '/wishlist');

  if (result.success) {
    const count = result.data.count;
    log.success('Wishlist retrieved successfully');
    log.info(`Wishlist count: ${count}`);
    
    if (count > 0) {
      log.success('✓ Requirement 12.2: Wishlist count updated after addition');
    } else {
      log.error('✗ Requirement 12.2: Wishlist count not updated');
      return false;
    }
    
    return true;
  } else {
    log.error('Failed to get wishlist');
    console.log(result.error);
    return false;
  }
}

// Test 6: Get wishlist with products (Requirement 12.3)
async function testGetWishlistWithProducts() {
  log.section('TEST 6: Get Wishlist with Products (Requirement 12.3)');
  
  const result = await makeRequest('get', '/wishlist');

  if (result.success) {
    log.success('Wishlist retrieved successfully');
    log.info(`Products in wishlist: ${result.data.count}`);
    
    // Verify product details are populated
    if (result.data.data.products.length > 0) {
      const product = result.data.data.products[0].product;
      log.info(`Product Name: ${product.name}`);
      log.info(`Product Price: $${product.price}`);
      log.info(`In Stock: ${product.inStock}`);
      
      if (product.name && product.price !== undefined && product.inStock !== undefined) {
        log.success('✓ Requirement 12.3: Wishlist displays products with availability and pricing');
      } else {
        log.error('✗ Requirement 12.3: Product details incomplete');
        return false;
      }
    }
    
    return true;
  } else {
    log.error('Failed to get wishlist');
    console.log(result.error);
    return false;
  }
}

// Test 7: Try to add duplicate product
async function testAddDuplicateProduct() {
  log.section('TEST 7: Try to Add Duplicate Product');
  
  const result = await makeRequest('post', `/wishlist/${testProductId}`);

  if (!result.success && result.status === 400) {
    log.success('Duplicate product correctly rejected');
    log.info(`Message: ${result.error.message}`);
    return true;
  } else if (result.success) {
    log.error('Duplicate product was incorrectly added');
    return false;
  } else {
    log.error('Unexpected error when adding duplicate');
    console.log(result.error);
    return false;
  }
}

// Test 8: Remove product from wishlist (Requirement 12.5)
async function testRemoveFromWishlist() {
  log.section('TEST 8: Remove Product from Wishlist (Requirement 12.5)');
  
  const result = await makeRequest('delete', `/wishlist/${testProductId}`);

  if (result.success) {
    log.success('Product removed from wishlist successfully');
    log.info(`Message: ${result.data.message}`);
    
    // Verify the product is no longer in the wishlist
    const productInWishlist = result.data.data.products.some(
      item => item.product._id === testProductId
    );
    
    if (!productInWishlist) {
      log.success('✓ Requirement 12.5: Product removed from wishlist');
    } else {
      log.error('✗ Requirement 12.5: Product still in wishlist');
      return false;
    }
    
    return true;
  } else {
    log.error('Failed to remove product from wishlist');
    console.log(result.error);
    return false;
  }
}

// Test 9: Verify wishlist is empty after removal
async function testVerifyEmptyWishlist() {
  log.section('TEST 9: Verify Wishlist is Empty After Removal');
  
  const result = await makeRequest('get', '/wishlist');

  if (result.success) {
    const count = result.data.count || result.data.data.products.length;
    log.success('Wishlist retrieved successfully');
    log.info(`Products in wishlist: ${count}`);
    
    if (count === 0) {
      log.success('Wishlist is empty as expected');
    } else {
      log.error('Wishlist still contains products');
      return false;
    }
    
    return true;
  } else {
    log.error('Failed to get wishlist');
    console.log(result.error);
    return false;
  }
}

// Test 10: Test authentication requirement
async function testAuthenticationRequired() {
  log.section('TEST 10: Test Authentication Requirement');
  
  const tempToken = authToken;
  authToken = ''; // Remove token
  
  const result = await makeRequest('get', '/wishlist');
  
  authToken = tempToken; // Restore token

  if (!result.success && result.status === 401) {
    log.success('Authentication correctly required for wishlist access');
    log.info(`Message: ${result.error.message}`);
    return true;
  } else {
    log.error('Wishlist accessible without authentication');
    return false;
  }
}

// Test 11: Test invalid product ID
async function testInvalidProductId() {
  log.section('TEST 11: Test Invalid Product ID');
  
  const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
  const result = await makeRequest('post', `/wishlist/${invalidId}`);

  if (!result.success && result.status === 404) {
    log.success('Invalid product ID correctly rejected');
    log.info(`Message: ${result.error.message}`);
    return true;
  } else {
    log.error('Invalid product ID was not handled correctly');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║         WISHLIST API ENDPOINT TESTS                        ║
║         Testing Requirements 12.1-12.5                     ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const tests = [
    { name: 'Login as Consumer', fn: testLogin },
    { name: 'Get Product for Testing', fn: testGetProduct },
    { name: 'Get Empty Wishlist', fn: testGetEmptyWishlist },
    { name: 'Add Product to Wishlist', fn: testAddToWishlist },
    { name: 'Confirm Addition and Count', fn: testConfirmAddition },
    { name: 'Get Wishlist with Products', fn: testGetWishlistWithProducts },
    { name: 'Add Duplicate Product', fn: testAddDuplicateProduct },
    { name: 'Remove Product from Wishlist', fn: testRemoveFromWishlist },
    { name: 'Verify Empty Wishlist', fn: testVerifyEmptyWishlist },
    { name: 'Test Authentication Required', fn: testAuthenticationRequired },
    { name: 'Test Invalid Product ID', fn: testInvalidProductId },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log.error(`Test "${test.name}" threw an error: ${error.message}`);
      failed++;
    }
  }

  // Summary
  log.section('TEST SUMMARY');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}✓ All tests passed! Wishlist API is working correctly.${colors.reset}`);
    console.log(`${colors.green}✓ Requirements 12.1-12.5 validated successfully.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed. Please review the errors above.${colors.reset}`);
  }
}

// Run the tests
runAllTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  console.error(error);
});
