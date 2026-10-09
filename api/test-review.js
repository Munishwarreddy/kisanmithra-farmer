const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let consumerToken = '';
let farmerToken = '';
let adminToken = '';
let productId = '';
let farmerId = '';
let orderId = '';
let reviewId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to handle API calls
async function apiCall(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {},
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

// Test 1: Setup - Create test users and get tokens
async function setupTestData() {
  log('\n=== Setting Up Test Data ===', 'blue');

  // Register consumer
  const consumerData = {
    name: 'Test Consumer',
    email: `consumer_${Date.now()}@test.com`,
    password: 'password123',
    role: 'consumer',
  };

  const consumerResult = await apiCall('post', '/auth/register', consumerData);
  if (consumerResult.success) {
    consumerToken = consumerResult.data.token;
    log('✓ Consumer registered and logged in', 'green');
  } else {
    log('✗ Failed to register consumer', 'red');
    return false;
  }

  // Register farmer
  const farmerData = {
    name: 'Test Farmer',
    email: `farmer_${Date.now()}@test.com`,
    password: 'password123',
    role: 'farmer',
  };

  const farmerResult = await apiCall('post', '/auth/register', farmerData);
  if (farmerResult.success) {
    farmerToken = farmerResult.data.token;
    farmerId = farmerResult.data.user._id;
    log('✓ Farmer registered and logged in', 'green');
  } else {
    log('✗ Failed to register farmer', 'red');
    return false;
  }

  // Register admin
  const adminData = {
    name: 'Test Admin',
    email: `admin_${Date.now()}@test.com`,
    password: 'password123',
    role: 'admin',
  };

  const adminResult = await apiCall('post', '/auth/register', adminData);
  if (adminResult.success) {
    adminToken = adminResult.data.token;
    log('✓ Admin registered and logged in', 'green');
  } else {
    log('✗ Failed to register admin', 'red');
    return false;
  }

  return true;
}

// Test 2: Create a product
async function createProduct() {
  log('\n=== Test 2: Create Product ===', 'blue');

  const productData = {
    name: 'Test Organic Tomatoes',
    description: 'Fresh organic tomatoes',
    price: 50,
    unit: 'kg',
    category: '507f1f77bcf86cd799439011', // Dummy category ID
    images: ['https://example.com/tomato.jpg'],
    inStock: true,
    quantityAvailable: 100,
    farmingPractice: 'organic',
  };

  const result = await apiCall('post', '/products', productData, farmerToken);
  if (result.success) {
    productId = result.data.data._id;
    log(`✓ Product created with ID: ${productId}`, 'green');
    return true;
  } else {
    log(`✗ Failed to create product: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Test 3: Create an order (simulated)
async function createOrder() {
  log('\n=== Test 3: Create Order ===', 'blue');

  const orderData = {
    farmer: farmerId,
    items: [
      {
        product: productId,
        name: 'Test Organic Tomatoes',
        quantity: 5,
        price: 50,
        unit: 'kg',
      },
    ],
    subtotal: 250,
    deliveryFee: 50,
    tax: 25,
    totalAmount: 325,
    status: 'delivered', // Set to delivered so we can review
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    deliveryAddress: {
      name: 'Test Consumer',
      phone: '1234567890',
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
    },
  };

  const result = await apiCall('post', '/orders', orderData, consumerToken);
  if (result.success) {
    orderId = result.data.data._id;
    log(`✓ Order created with ID: ${orderId}`, 'green');
    return true;
  } else {
    log(`✗ Failed to create order: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Test 4: Submit a product review (Consumer)
async function submitProductReview() {
  log('\n=== Test 4: Submit Product Review ===', 'blue');

  const reviewData = {
    rating: 5,
    comment: 'Excellent quality tomatoes! Very fresh and organic.',
    images: ['https://example.com/review1.jpg'],
  };

  const result = await apiCall(
    'post',
    `/products/${productId}/reviews`,
    reviewData,
    consumerToken
  );

  if (result.success) {
    reviewId = result.data.data._id;
    log('✓ Review submitted successfully', 'green');
    log(`  Rating: ${result.data.data.rating}`, 'yellow');
    log(`  Comment: ${result.data.data.comment}`, 'yellow');
    return true;
  } else {
    log(`✗ Failed to submit review: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Test 5: Try to submit duplicate review (should fail)
async function submitDuplicateReview() {
  log('\n=== Test 5: Submit Duplicate Review (Should Fail) ===', 'blue');

  const reviewData = {
    rating: 4,
    comment: 'Another review',
  };

  const result = await apiCall(
    'post',
    `/products/${productId}/reviews`,
    reviewData,
    consumerToken
  );

  if (!result.success && result.status === 400) {
    log('✓ Duplicate review correctly rejected', 'green');
    return true;
  } else {
    log('✗ Duplicate review should have been rejected', 'red');
    return false;
  }
}

// Test 6: Get product reviews
async function getProductReviews() {
  log('\n=== Test 6: Get Product Reviews ===', 'blue');

  const result = await apiCall('get', `/products/${productId}/reviews`);

  if (result.success) {
    log(`✓ Retrieved ${result.data.count} review(s)`, 'green');
    if (result.data.data.length > 0) {
      const review = result.data.data[0];
      log(`  Rating: ${review.rating}`, 'yellow');
      log(`  Comment: ${review.comment}`, 'yellow');
      log(`  Consumer: ${review.consumer.name}`, 'yellow');
    }
    return true;
  } else {
    log(`✗ Failed to get reviews: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Test 7: Get farmer reviews
async function getFarmerReviews() {
  log('\n=== Test 7: Get Farmer Reviews ===', 'blue');

  const result = await apiCall('get', `/farmers/${farmerId}/reviews`);

  if (result.success) {
    log(`✓ Retrieved ${result.data.count} review(s) for farmer`, 'green');
    if (result.data.data.length > 0) {
      const review = result.data.data[0];
      log(`  Rating: ${review.rating}`, 'yellow');
      log(`  Product: ${review.product.name}`, 'yellow');
    }
    return true;
  } else {
    log(`✗ Failed to get farmer reviews: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Test 8: Try to submit review without purchase (should fail)
async function submitReviewWithoutPurchase() {
  log('\n=== Test 8: Submit Review Without Purchase (Should Fail) ===', 'blue');

  // Create a new product
  const productData = {
    name: 'Test Product 2',
    description: 'Another test product',
    price: 100,
    unit: 'kg',
    category: '507f1f77bcf86cd799439011',
    images: ['https://example.com/product2.jpg'],
    inStock: true,
    quantityAvailable: 50,
    farmingPractice: 'organic',
  };

  const productResult = await apiCall('post', '/products', productData, farmerToken);
  if (!productResult.success) {
    log('✗ Failed to create test product', 'red');
    return false;
  }

  const newProductId = productResult.data.data._id;

  // Try to review without purchasing
  const reviewData = {
    rating: 5,
    comment: 'Review without purchase',
  };

  const result = await apiCall(
    'post',
    `/products/${newProductId}/reviews`,
    reviewData,
    consumerToken
  );

  if (!result.success && result.status === 403) {
    log('✓ Review without purchase correctly rejected', 'green');
    return true;
  } else {
    log('✗ Review without purchase should have been rejected', 'red');
    return false;
  }
}

// Test 9: Try to submit review with invalid rating (should fail)
async function submitReviewWithInvalidRating() {
  log('\n=== Test 9: Submit Review With Invalid Rating (Should Fail) ===', 'blue');

  const reviewData = {
    rating: 6, // Invalid rating
    comment: 'Invalid rating test',
  };

  const result = await apiCall(
    'post',
    `/products/${productId}/reviews`,
    reviewData,
    consumerToken
  );

  if (!result.success && result.status === 400) {
    log('✓ Invalid rating correctly rejected', 'green');
    return true;
  } else {
    log('✗ Invalid rating should have been rejected', 'red');
    return false;
  }
}

// Test 10: Delete review (Admin)
async function deleteReview() {
  log('\n=== Test 10: Delete Review (Admin) ===', 'blue');

  const result = await apiCall('delete', `/admin/reviews/${reviewId}`, null, adminToken);

  if (result.success) {
    log('✓ Review deleted successfully by admin', 'green');
    return true;
  } else {
    log(`✗ Failed to delete review: ${JSON.stringify(result.error)}`, 'red');
    return false;
  }
}

// Test 11: Verify review is deleted
async function verifyReviewDeleted() {
  log('\n=== Test 11: Verify Review Is Deleted ===', 'blue');

  const result = await apiCall('get', `/products/${productId}/reviews`);

  if (result.success && result.data.count === 0) {
    log('✓ Review successfully deleted (count is 0)', 'green');
    return true;
  } else {
    log('✗ Review still exists after deletion', 'red');
    return false;
  }
}

// Run all tests
async function runTests() {
  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║   Review API Endpoint Test Suite      ║', 'blue');
  log('╚════════════════════════════════════════╝', 'blue');

  const tests = [
    { name: 'Setup Test Data', fn: setupTestData },
    { name: 'Create Product', fn: createProduct },
    { name: 'Create Order', fn: createOrder },
    { name: 'Submit Product Review', fn: submitProductReview },
    { name: 'Submit Duplicate Review', fn: submitDuplicateReview },
    { name: 'Get Product Reviews', fn: getProductReviews },
    { name: 'Get Farmer Reviews', fn: getFarmerReviews },
    { name: 'Submit Review Without Purchase', fn: submitReviewWithoutPurchase },
    { name: 'Submit Review With Invalid Rating', fn: submitReviewWithInvalidRating },
    { name: 'Delete Review', fn: deleteReview },
    { name: 'Verify Review Deleted', fn: verifyReviewDeleted },
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
      log(`✗ Test "${test.name}" threw an error: ${error.message}`, 'red');
      failed++;
    }
  }

  log('\n╔════════════════════════════════════════╗', 'blue');
  log('║           Test Summary                 ║', 'blue');
  log('╚════════════════════════════════════════╝', 'blue');
  log(`Total Tests: ${tests.length}`, 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log(`\n⚠️  ${failed} test(s) failed`, 'red');
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  console.error(error);
});
