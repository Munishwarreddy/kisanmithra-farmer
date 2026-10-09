const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let consumerToken = '';
let farmerToken = '';
let adminToken = '';
let productId = '';
let farmerId = '';
let reviewIds = [];

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

// Setup test data
async function setupTestData() {
  log('\n=== Setting Up Test Data ===', 'blue');

  // Register farmer
  const farmerData = {
    name: 'Rating Test Farmer',
    email: `rating_farmer_${Date.now()}@test.com`,
    password: 'password123',
    role: 'farmer',
  };

  const farmerResult = await apiCall('post', '/auth/register', farmerData);
  if (farmerResult.success) {
    farmerToken = farmerResult.data.token;
    farmerId = farmerResult.data.user._id;
    log('✓ Farmer registered', 'green');
  } else {
    log('✗ Failed to register farmer', 'red');
    return false;
  }

  // Create product
  const productData = {
    name: 'Rating Test Product',
    description: 'Product for testing rating calculation',
    price: 100,
    unit: 'kg',
    category: '507f1f77bcf86cd799439011',
    images: ['https://example.com/product.jpg'],
    inStock: true,
    quantityAvailable: 100,
    farmingPractice: 'organic',
  };

  const productResult = await apiCall('post', '/products', productData, farmerToken);
  if (productResult.success) {
    productId = productResult.data.data._id;
    log(`✓ Product created with ID: ${productId}`, 'green');
  } else {
    log('✗ Failed to create product', 'red');
    return false;
  }

  // Register admin
  const adminData = {
    name: 'Rating Test Admin',
    email: `rating_admin_${Date.now()}@test.com`,
    password: 'password123',
    role: 'admin',
  };

  const adminResult = await apiCall('post', '/auth/register', adminData);
  if (adminResult.success) {
    adminToken = adminResult.data.token;
    log('✓ Admin registered', 'green');
  } else {
    log('✗ Failed to register admin', 'red');
    return false;
  }

  return true;
}

// Create a consumer and submit a review with a specific rating
async function createConsumerAndReview(rating, comment) {
  // Register consumer
  const consumerData = {
    name: `Test Consumer ${Date.now()}`,
    email: `consumer_${Date.now()}_${Math.random()}@test.com`,
    password: 'password123',
    role: 'consumer',
  };

  const consumerResult = await apiCall('post', '/auth/register', consumerData);
  if (!consumerResult.success) {
    log('✗ Failed to register consumer', 'red');
    return null;
  }

  const token = consumerResult.data.token;
  const consumerId = consumerResult.data.user._id;

  // Create a delivered order
  const orderData = {
    farmer: farmerId,
    items: [
      {
        product: productId,
        name: 'Rating Test Product',
        quantity: 1,
        price: 100,
        unit: 'kg',
      },
    ],
    subtotal: 100,
    deliveryFee: 20,
    tax: 10,
    totalAmount: 130,
    status: 'delivered',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    deliveryAddress: {
      name: consumerData.name,
      phone: '1234567890',
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
    },
  };

  const orderResult = await apiCall('post', '/orders', orderData, token);
  if (!orderResult.success) {
    log('✗ Failed to create order', 'red');
    return null;
  }

  // Submit review
  const reviewData = {
    rating,
    comment,
  };

  const reviewResult = await apiCall(
    'post',
    `/products/${productId}/reviews`,
    reviewData,
    token
  );

  if (reviewResult.success) {
    return {
      consumerId,
      token,
      reviewId: reviewResult.data.data._id,
      rating,
    };
  } else {
    log(`✗ Failed to submit review: ${JSON.stringify(reviewResult.error)}`, 'red');
    return null;
  }
}

// Test 1: Verify initial rating is 0
async function testInitialRating() {
  log('\n=== Test 1: Verify Initial Rating ===', 'blue');

  const result = await apiCall('get', `/products/${productId}`);

  if (result.success) {
    const product = result.data.data;
    if (product.rating === 0 && product.totalReviews === 0) {
      log('✓ Initial rating is 0 and totalReviews is 0', 'green');
      return true;
    } else {
      log(`✗ Expected rating: 0, totalReviews: 0, got rating: ${product.rating}, totalReviews: ${product.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get product', 'red');
    return false;
  }
}

// Test 2: Submit single review and verify rating
async function testSingleReview() {
  log('\n=== Test 2: Single Review Rating Calculation ===', 'blue');

  const review = await createConsumerAndReview(5, 'Excellent product!');
  if (!review) {
    return false;
  }

  reviewIds.push(review.reviewId);

  // Get product and verify rating
  const result = await apiCall('get', `/products/${productId}`);

  if (result.success) {
    const product = result.data.data;
    if (product.rating === 5 && product.totalReviews === 1) {
      log('✓ Rating correctly calculated: 5.0 with 1 review', 'green');
      return true;
    } else {
      log(`✗ Expected rating: 5, totalReviews: 1, got rating: ${product.rating}, totalReviews: ${product.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get product', 'red');
    return false;
  }
}

// Test 3: Submit multiple reviews and verify average rating
async function testMultipleReviews() {
  log('\n=== Test 3: Multiple Reviews Average Rating Calculation ===', 'blue');

  // Submit reviews with ratings: 4, 3, 5
  // Expected average: (5 + 4 + 3 + 5) / 4 = 4.25 ≈ 4.3 (rounded to 1 decimal)
  const ratings = [
    { rating: 4, comment: 'Good product' },
    { rating: 3, comment: 'Average product' },
    { rating: 5, comment: 'Excellent!' },
  ];

  for (const { rating, comment } of ratings) {
    const review = await createConsumerAndReview(rating, comment);
    if (!review) {
      return false;
    }
    reviewIds.push(review.reviewId);
  }

  // Get product and verify rating
  const result = await apiCall('get', `/products/${productId}`);

  if (result.success) {
    const product = result.data.data;
    const expectedAverage = (5 + 4 + 3 + 5) / 4;
    const expectedRounded = Math.round(expectedAverage * 10) / 10;

    if (product.rating === expectedRounded && product.totalReviews === 4) {
      log(`✓ Average rating correctly calculated: ${product.rating} with ${product.totalReviews} reviews`, 'green');
      log(`  Individual ratings: 5, 4, 3, 5`, 'yellow');
      log(`  Expected average: ${expectedAverage.toFixed(2)} → ${expectedRounded}`, 'yellow');
      return true;
    } else {
      log(`✗ Expected rating: ${expectedRounded}, totalReviews: 4, got rating: ${product.rating}, totalReviews: ${product.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get product', 'red');
    return false;
  }
}

// Test 4: Verify farmer rating is also updated
async function testFarmerRating() {
  log('\n=== Test 4: Farmer Rating Calculation ===', 'blue');

  const result = await apiCall('get', `/farmers/${farmerId}`);

  if (result.success) {
    const farmer = result.data.data;
    const expectedAverage = (5 + 4 + 3 + 5) / 4;
    const expectedRounded = Math.round(expectedAverage * 10) / 10;

    if (farmer.rating === expectedRounded && farmer.totalReviews === 4) {
      log(`✓ Farmer rating correctly calculated: ${farmer.rating} with ${farmer.totalReviews} reviews`, 'green');
      return true;
    } else {
      log(`✗ Expected farmer rating: ${expectedRounded}, totalReviews: 4, got rating: ${farmer.rating}, totalReviews: ${farmer.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get farmer profile', 'red');
    return false;
  }
}

// Test 5: Delete a review and verify rating recalculation
async function testRatingAfterDeletion() {
  log('\n=== Test 5: Rating Recalculation After Review Deletion ===', 'blue');

  // Delete the first review (rating: 5)
  const reviewToDelete = reviewIds[0];
  const deleteResult = await apiCall('delete', `/admin/reviews/${reviewToDelete}`, null, adminToken);

  if (!deleteResult.success) {
    log('✗ Failed to delete review', 'red');
    return false;
  }

  log('✓ Review deleted', 'green');

  // Get product and verify rating
  // Remaining ratings: 4, 3, 5
  // Expected average: (4 + 3 + 5) / 3 = 4.0
  const result = await apiCall('get', `/products/${productId}`);

  if (result.success) {
    const product = result.data.data;
    const expectedAverage = (4 + 3 + 5) / 3;
    const expectedRounded = Math.round(expectedAverage * 10) / 10;

    if (product.rating === expectedRounded && product.totalReviews === 3) {
      log(`✓ Rating correctly recalculated after deletion: ${product.rating} with ${product.totalReviews} reviews`, 'green');
      log(`  Remaining ratings: 4, 3, 5`, 'yellow');
      log(`  Expected average: ${expectedAverage.toFixed(2)} → ${expectedRounded}`, 'yellow');
      return true;
    } else {
      log(`✗ Expected rating: ${expectedRounded}, totalReviews: 3, got rating: ${product.rating}, totalReviews: ${product.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get product', 'red');
    return false;
  }
}

// Test 6: Verify farmer rating is also updated after deletion
async function testFarmerRatingAfterDeletion() {
  log('\n=== Test 6: Farmer Rating After Review Deletion ===', 'blue');

  const result = await apiCall('get', `/farmers/${farmerId}`);

  if (result.success) {
    const farmer = result.data.data;
    const expectedAverage = (4 + 3 + 5) / 3;
    const expectedRounded = Math.round(expectedAverage * 10) / 10;

    if (farmer.rating === expectedRounded && farmer.totalReviews === 3) {
      log(`✓ Farmer rating correctly recalculated: ${farmer.rating} with ${farmer.totalReviews} reviews`, 'green');
      return true;
    } else {
      log(`✗ Expected farmer rating: ${expectedRounded}, totalReviews: 3, got rating: ${farmer.rating}, totalReviews: ${farmer.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get farmer profile', 'red');
    return false;
  }
}

// Test 7: Test edge case - all reviews deleted
async function testAllReviewsDeleted() {
  log('\n=== Test 7: Rating After All Reviews Deleted ===', 'blue');

  // Delete remaining reviews
  for (let i = 1; i < reviewIds.length; i++) {
    await apiCall('delete', `/admin/reviews/${reviewIds[i]}`, null, adminToken);
  }

  log('✓ All reviews deleted', 'green');

  // Get product and verify rating is reset to 0
  const result = await apiCall('get', `/products/${productId}`);

  if (result.success) {
    const product = result.data.data;
    if (product.rating === 0 && product.totalReviews === 0) {
      log('✓ Rating correctly reset to 0 after all reviews deleted', 'green');
      return true;
    } else {
      log(`✗ Expected rating: 0, totalReviews: 0, got rating: ${product.rating}, totalReviews: ${product.totalReviews}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get product', 'red');
    return false;
  }
}

// Test 8: Test rounding to 1 decimal place
async function testRoundingPrecision() {
  log('\n=== Test 8: Rating Rounding Precision ===', 'blue');

  // Submit reviews with ratings that will test rounding
  // Ratings: 3, 4, 5, 5, 5
  // Average: 22 / 5 = 4.4
  const ratings = [3, 4, 5, 5, 5];

  for (const rating of ratings) {
    const review = await createConsumerAndReview(rating, `Rating ${rating}`);
    if (!review) {
      return false;
    }
  }

  const result = await apiCall('get', `/products/${productId}`);

  if (result.success) {
    const product = result.data.data;
    const expectedAverage = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const expectedRounded = Math.round(expectedAverage * 10) / 10;

    if (product.rating === expectedRounded && product.totalReviews === 5) {
      log(`✓ Rating correctly rounded to 1 decimal place: ${product.rating}`, 'green');
      log(`  Ratings: ${ratings.join(', ')}`, 'yellow');
      log(`  Exact average: ${expectedAverage.toFixed(10)}`, 'yellow');
      log(`  Rounded to 1 decimal: ${expectedRounded}`, 'yellow');
      return true;
    } else {
      log(`✗ Expected rating: ${expectedRounded}, got: ${product.rating}`, 'red');
      return false;
    }
  } else {
    log('✗ Failed to get product', 'red');
    return false;
  }
}

// Run all tests
async function runTests() {
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║   Task 6.2: Rating Calculation Test Suite         ║', 'blue');
  log('║   Testing average rating calculation and          ║', 'blue');
  log('║   aggregation for products and farmers            ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');

  const setupSuccess = await setupTestData();
  if (!setupSuccess) {
    log('\n❌ Setup failed. Cannot continue with tests.', 'red');
    return;
  }

  const tests = [
    { name: 'Initial Rating', fn: testInitialRating },
    { name: 'Single Review Rating', fn: testSingleReview },
    { name: 'Multiple Reviews Average', fn: testMultipleReviews },
    { name: 'Farmer Rating Calculation', fn: testFarmerRating },
    { name: 'Rating After Deletion', fn: testRatingAfterDeletion },
    { name: 'Farmer Rating After Deletion', fn: testFarmerRatingAfterDeletion },
    { name: 'All Reviews Deleted', fn: testAllReviewsDeleted },
    { name: 'Rounding Precision', fn: testRoundingPrecision },
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
      console.error(error);
      failed++;
    }
  }

  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║                  Test Summary                      ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');
  log(`Total Tests: ${tests.length}`, 'yellow');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All rating calculation tests passed!', 'green');
    log('\n✅ Task 6.2 Implementation Verified:', 'green');
    log('   • Average ratings calculated correctly for products', 'green');
    log('   • Average ratings calculated correctly for farmers', 'green');
    log('   • Ratings updated on new review submission', 'green');
    log('   • Ratings recalculated on review deletion', 'green');
    log('   • Ratings rounded to 1 decimal place', 'green');
    log('   • Edge cases handled (no reviews, all deleted)', 'green');
  } else {
    log(`\n⚠️  ${failed} test(s) failed`, 'red');
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  console.error(error);
});
