const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Helper function for colored console output
function log(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    white: '\x1b[37m',
  };
  console.log(`${colors[color]}${message}\x1b[0m`);
}

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
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
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
}

let adminToken = '';
let consumerToken = '';
let farmerToken = '';
let testUserId = '';
let testProductId = '';

// Test 1: Setup - Register users
async function setupUsers() {
  log('\n=== Test 1: Setup Users ===', 'blue');

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
    testUserId = consumerResult.data.user._id;
    log('✓ Consumer registered', 'green');
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
    log('✓ Farmer registered', 'green');
  } else {
    log('✗ Failed to register farmer', 'red');
    return false;
  }

  return true;
}

// Test 2: Get dashboard statistics
async function getDashboardStats() {
  log('\n=== Test 2: Get Dashboard Statistics ===', 'blue');

  const result = await apiCall('get', '/admin/dashboard', null, adminToken);

  if (result.success) {
    log('✓ Dashboard statistics retrieved', 'green');
    log(`  Total Users: ${result.data.data.users.total}`, 'yellow');
    log(`  Total Consumers: ${result.data.data.users.consumers}`, 'yellow');
    log(`  Total Farmers: ${result.data.data.users.farmers}`, 'yellow');
    log(`  Total Orders: ${result.data.data.orders.total}`, 'yellow');
    log(`  Total Revenue: $${result.data.data.revenue.total}`, 'yellow');
    return true;
  } else {
    log(`✗ Failed to get dashboard stats: ${result.error}`, 'red');
    return false;
  }
}

// Test 3: Get all users without filters
async function getAllUsers() {
  log('\n=== Test 3: Get All Users ===', 'blue');

  const result = await apiCall('get', '/admin/users', null, adminToken);

  if (result.success) {
    log(`✓ Retrieved ${result.data.count} users`, 'green');
    return true;
  } else {
    log(`✗ Failed to get users: ${result.error}`, 'red');
    return false;
  }
}

// Test 4: Get users with role filter
async function getUsersByRole() {
  log('\n=== Test 4: Get Users by Role (Consumer) ===', 'blue');

  const result = await apiCall('get', '/admin/users?role=consumer', null, adminToken);

  if (result.success) {
    log(`✓ Retrieved ${result.data.count} consumers`, 'green');
    const allConsumers = result.data.data.every(user => user.role === 'consumer');
    if (allConsumers) {
      log('✓ All users have consumer role', 'green');
    } else {
      log('✗ Some users do not have consumer role', 'red');
      return false;
    }
    return true;
  } else {
    log(`✗ Failed to get consumers: ${result.error}`, 'red');
    return false;
  }
}

// Test 5: Update user status
async function updateUserStatus() {
  log('\n=== Test 5: Update User Status ===', 'blue');

  const result = await apiCall(
    'put',
    `/admin/users/${testUserId}/status`,
    { isActive: false },
    adminToken
  );

  if (result.success) {
    log('✓ User status updated to inactive', 'green');
    log(`  User: ${result.data.data.name}`, 'yellow');
    log(`  Active: ${result.data.data.isActive}`, 'yellow');
    return true;
  } else {
    log(`✗ Failed to update user status: ${result.error}`, 'red');
    return false;
  }
}

// Test 6: Reactivate user
async function reactivateUser() {
  log('\n=== Test 6: Reactivate User ===', 'blue');

  const result = await apiCall(
    'put',
    `/admin/users/${testUserId}/status`,
    { isActive: true },
    adminToken
  );

  if (result.success) {
    log('✓ User status updated to active', 'green');
    log(`  Active: ${result.data.data.isActive}`, 'yellow');
    return true;
  } else {
    log(`✗ Failed to reactivate user: ${result.error}`, 'red');
    return false;
  }
}

// Test 7: Create a test product
async function createTestProduct() {
  log('\n=== Test 7: Create Test Product ===', 'blue');

  const productData = {
    name: 'Admin Test Product',
    description: 'Product for admin testing',
    price: 50,
    unit: 'kg',
    category: null,
    quantityAvailable: 100,
    inStock: true,
    images: ['test-image.jpg'],
  };

  const result = await apiCall('post', '/products', productData, farmerToken);

  if (result.success) {
    testProductId = result.data.data._id;
    log('✓ Test product created', 'green');
    return true;
  } else {
    log(`✗ Failed to create product: ${result.error}`, 'red');
    return false;
  }
}

// Test 8: Get all products (admin view)
async function getAllProducts() {
  log('\n=== Test 8: Get All Products (Admin) ===', 'blue');

  const result = await apiCall('get', '/admin/products', null, adminToken);

  if (result.success) {
    log(`✓ Retrieved ${result.data.count} products`, 'green');
    return true;
  } else {
    log(`✗ Failed to get products: ${result.error}`, 'red');
    return false;
  }
}

// Test 9: Get all orders (admin view)
async function getAllOrders() {
  log('\n=== Test 9: Get All Orders (Admin) ===', 'blue');

  const result = await apiCall('get', '/admin/orders', null, adminToken);

  if (result.success) {
    log(`✓ Retrieved ${result.data.count} orders`, 'green');
    return true;
  } else {
    log(`✗ Failed to get orders: ${result.error}`, 'red');
    return false;
  }
}

// Test 10: Delete product (admin)
async function deleteProduct() {
  log('\n=== Test 10: Delete Product (Admin) ===', 'blue');

  const result = await apiCall('delete', `/admin/products/${testProductId}`, null, adminToken);

  if (result.success) {
    log('✓ Product deleted successfully', 'green');
    return true;
  } else {
    log(`✗ Failed to delete product: ${result.error}`, 'red');
    return false;
  }
}

// Test 11: Delete user (admin)
async function deleteUser() {
  log('\n=== Test 11: Delete User (Admin) ===', 'blue');

  const result = await apiCall('delete', `/admin/users/${testUserId}`, null, adminToken);

  if (result.success) {
    log('✓ User deleted successfully', 'green');
    return true;
  } else {
    log(`✗ Failed to delete user: ${result.error}`, 'red');
    return false;
  }
}

// Test 12: Verify non-admin cannot access admin routes
async function testUnauthorizedAccess() {
  log('\n=== Test 12: Test Unauthorized Access ===', 'blue');

  const result = await apiCall('get', '/admin/dashboard', null, consumerToken);

  if (!result.success && result.status === 403) {
    log('✓ Non-admin correctly denied access', 'green');
    return true;
  } else {
    log('✗ Non-admin was able to access admin route', 'red');
    return false;
  }
}

// Run all tests
async function runTests() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║   Admin Dashboard API Test Suite          ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');

  const tests = [
    setupUsers,
    getDashboardStats,
    getAllUsers,
    getUsersByRole,
    updateUserStatus,
    reactivateUser,
    createTestProduct,
    getAllProducts,
    getAllOrders,
    deleteProduct,
    deleteUser,
    testUnauthorizedAccess,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`✗ Test threw an error: ${error.message}`, 'red');
      failed++;
    }
  }

  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║              Test Summary                  ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');
  log(`Total Tests: ${tests.length}`, 'white');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n✓ All tests passed!', 'green');
  } else {
    log(`\n✗ ${failed} test(s) failed`, 'red');
  }
}

// Run the tests
runTests().catch((error) => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
