/**
 * Test script for Task 9.1: Order API Enhancements
 * 
 * Tests:
 * 1. Update order status with tracking info
 * 2. Update order status with delivery date (when shipped)
 * 3. Verify notification is sent on status change
 * 4. Reorder functionality
 * 5. Get order tracking info
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test users (from seed data)
let consumerToken = '';
let farmerToken = '';
let testOrderId = '';

// Helper function to log test results
const logTest = (testName, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) console.log(`   ${details}`);
  console.log('');
};

// Helper function to login
const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Test 1: Create a test order
const createTestOrder = async () => {
  console.log('📝 Test 1: Create a test order');
  try {
    // First, get a product from a farmer
    const productsResponse = await axios.get(`${API_URL}/products`);
    const product = productsResponse.data.data[0];
    
    if (!product) {
      logTest('Create test order', false, 'No products available');
      return;
    }

    const orderData = {
      farmer: product.farmer,
      items: [{
        product: product._id,
        name: product.name,
        quantity: 2,
        price: product.price,
        unit: product.unit
      }],
      subtotal: product.price * 2,
      deliveryFee: 50,
      tax: 10,
      totalAmount: (product.price * 2) + 50 + 10,
      deliveryAddress: {
        name: 'Test Consumer',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      paymentMethod: 'card'
    };

    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${consumerToken}` }
    });

    testOrderId = response.data.data._id;
    logTest('Create test order', true, `Order ID: ${testOrderId}`);
  } catch (error) {
    logTest('Create test order', false, error.response?.data?.message || error.message);
  }
};

// Test 2: Update order status with tracking info
const updateOrderWithTracking = async () => {
  console.log('📝 Test 2: Update order status with tracking info');
  try {
    const updateData = {
      status: 'confirmed',
      trackingInfo: {
        status: 'confirmed',
        location: 'Farm warehouse',
      }
    };

    const response = await axios.put(
      `${API_URL}/orders/${testOrderId}/status`,
      updateData,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    const hasTracking = response.data.data.trackingInfo && 
                        response.data.data.trackingInfo.length > 0;
    const correctStatus = response.data.data.status === 'confirmed';

    logTest(
      'Update order with tracking info',
      hasTracking && correctStatus,
      `Status: ${response.data.data.status}, Tracking entries: ${response.data.data.trackingInfo?.length || 0}`
    );
  } catch (error) {
    logTest('Update order with tracking info', false, error.response?.data?.message || error.message);
  }
};

// Test 3: Update order to shipped with delivery date
const updateOrderToShipped = async () => {
  console.log('📝 Test 3: Update order to shipped with delivery date');
  try {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

    const updateData = {
      status: 'shipped',
      trackingInfo: {
        status: 'shipped',
        location: 'In transit',
      },
      deliveryDate: deliveryDate.toISOString()
    };

    const response = await axios.put(
      `${API_URL}/orders/${testOrderId}/status`,
      updateData,
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    const hasDeliveryDate = !!response.data.data.deliveryDate;
    const correctStatus = response.data.data.status === 'shipped';

    logTest(
      'Update order to shipped with delivery date',
      hasDeliveryDate && correctStatus,
      `Status: ${response.data.data.status}, Delivery date: ${response.data.data.deliveryDate || 'Not set'}`
    );
  } catch (error) {
    logTest('Update order to shipped with delivery date', false, error.response?.data?.message || error.message);
  }
};

// Test 4: Get order tracking info
const getOrderTracking = async () => {
  console.log('📝 Test 4: Get order tracking info');
  try {
    const response = await axios.get(
      `${API_URL}/orders/${testOrderId}/tracking`,
      { headers: { Authorization: `Bearer ${consumerToken}` } }
    );

    const hasTracking = response.data.data.trackingInfo && 
                        response.data.data.trackingInfo.length > 0;
    const hasDeliveryDate = !!response.data.data.deliveryDate;

    logTest(
      'Get order tracking info',
      hasTracking && hasDeliveryDate,
      `Tracking entries: ${response.data.data.trackingInfo?.length || 0}, Has delivery date: ${hasDeliveryDate}`
    );
  } catch (error) {
    logTest('Get order tracking info', false, error.response?.data?.message || error.message);
  }
};

// Test 5: Check if notification was created
const checkNotification = async () => {
  console.log('📝 Test 5: Check if notification was created for status change');
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${consumerToken}` }
    });

    const orderNotifications = response.data.data.filter(
      n => n.type === 'order' && n.metadata?.orderId === testOrderId
    );

    logTest(
      'Notification created for status change',
      orderNotifications.length > 0,
      `Found ${orderNotifications.length} order notification(s)`
    );
  } catch (error) {
    logTest('Notification created for status change', false, error.response?.data?.message || error.message);
  }
};

// Test 6: Reorder functionality
const testReorder = async () => {
  console.log('📝 Test 6: Test reorder functionality');
  try {
    const response = await axios.post(
      `${API_URL}/orders/reorder/${testOrderId}`,
      {},
      { headers: { Authorization: `Bearer ${consumerToken}` } }
    );

    const newOrder = response.data.data;
    const hasItems = newOrder.items && newOrder.items.length > 0;
    const hasOrderNumber = !!newOrder.orderNumber;
    const differentOrderId = newOrder._id !== testOrderId;

    logTest(
      'Reorder functionality',
      hasItems && hasOrderNumber && differentOrderId,
      `New order ID: ${newOrder._id}, Order number: ${newOrder.orderNumber}`
    );
  } catch (error) {
    logTest('Reorder functionality', false, error.response?.data?.message || error.message);
  }
};

// Test 7: Unauthorized reorder attempt
const testUnauthorizedReorder = async () => {
  console.log('📝 Test 7: Test unauthorized reorder attempt');
  try {
    await axios.post(
      `${API_URL}/orders/reorder/${testOrderId}`,
      {},
      { headers: { Authorization: `Bearer ${farmerToken}` } }
    );

    logTest('Unauthorized reorder attempt', false, 'Should have been rejected');
  } catch (error) {
    const isUnauthorized = error.response?.status === 403;
    logTest(
      'Unauthorized reorder attempt',
      isUnauthorized,
      `Status: ${error.response?.status}, Message: ${error.response?.data?.message}`
    );
  }
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting Order API Enhancement Tests\n');
  console.log('=' .repeat(60));
  console.log('');

  try {
    // Login as consumer and farmer
    console.log('🔐 Logging in...\n');
    consumerToken = await login('consumer@test.com', 'password123');
    farmerToken = await login('farmer@test.com', 'password123');
    console.log('✅ Login successful\n');
    console.log('=' .repeat(60));
    console.log('');

    // Run tests in sequence
    await createTestOrder();
    await updateOrderWithTracking();
    await updateOrderToShipped();
    await getOrderTracking();
    await checkNotification();
    await testReorder();
    await testUnauthorizedReorder();

    console.log('=' .repeat(60));
    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
};

// Run tests
runTests();
