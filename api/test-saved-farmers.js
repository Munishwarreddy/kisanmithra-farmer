const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test credentials
let consumerToken = '';
let farmerId = '';

// Helper function to log test results
const logTest = (testName, passed, details = '') => {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details) console.log(`   ${details}`);
  console.log('');
};

// Helper function to handle errors
const handleError = (error, testName) => {
  if (error.response) {
    logTest(testName, false, `Status: ${error.response.status}, Message: ${error.response.data.message}`);
  } else {
    logTest(testName, false, error.message);
  }
};

async function runTests() {
  console.log('🧪 Starting Saved Farmers API Tests\n');
  console.log('=' .repeat(60));
  console.log('\n');

  try {
    // Test 1: Login as consumer
    console.log('📝 Test 1: Login as consumer');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'consumer1@kisanmithra.com',
        password: 'farmer123'
      });
      
      consumerToken = loginResponse.data.token;
      logTest('Consumer login', true, `Token received: ${consumerToken.substring(0, 20)}...`);
    } catch (error) {
      handleError(error, 'Consumer login');
      console.log('⚠️  Please ensure a consumer account exists with email: consumer1@kisanmithra.com, password: farmer123');
      return;
    }

    // Test 2: Get a farmer ID (we'll need to fetch farmers or use a known ID)
    console.log('📝 Test 2: Get farmer ID');
    try {
      // Login as a farmer to get a farmer ID
      const farmerLoginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'farmer1@kisanmithra.com',
        password: 'farmer123'
      });
      
      // Decode the token or use the response to get farmer ID
      // For simplicity, we'll make a request to get the current user
      const farmerProfileResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${farmerLoginResponse.data.token}` }
      });
      
      farmerId = farmerProfileResponse.data.user._id;
      logTest('Get farmer ID', true, `Farmer ID: ${farmerId}`);
    } catch (error) {
      handleError(error, 'Get farmer ID');
      console.log('⚠️  Please ensure at least one farmer account exists');
      return;
    }

    // Test 3: Save a farmer (POST /api/farmers/:id/save)
    console.log('📝 Test 3: Save a farmer');
    try {
      const saveResponse = await axios.post(
        `${BASE_URL}/farmers/${farmerId}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      const passed = saveResponse.status === 200 && 
                     saveResponse.data.success === true &&
                     saveResponse.data.message === 'Farmer saved successfully';
      
      logTest('Save farmer', passed, 
        `Status: ${saveResponse.status}, Farmers count: ${saveResponse.data.data?.farmers?.length || 0}`);
    } catch (error) {
      handleError(error, 'Save farmer');
    }

    // Test 4: Try to save the same farmer again (should fail)
    console.log('📝 Test 4: Try to save the same farmer again (should fail)');
    try {
      const duplicateResponse = await axios.post(
        `${BASE_URL}/farmers/${farmerId}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      logTest('Duplicate save prevention', false, 'Should have returned 400 error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        logTest('Duplicate save prevention', true, 
          `Correctly rejected: ${error.response.data.message}`);
      } else {
        handleError(error, 'Duplicate save prevention');
      }
    }

    // Test 5: Get saved farmers (GET /api/farmers/saved)
    console.log('📝 Test 5: Get saved farmers');
    try {
      const getSavedResponse = await axios.get(
        `${BASE_URL}/farmers/saved`,
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      const passed = getSavedResponse.status === 200 && 
                     getSavedResponse.data.success === true &&
                     getSavedResponse.data.data?.farmers?.length > 0;
      
      logTest('Get saved farmers', passed, 
        `Status: ${getSavedResponse.status}, Count: ${getSavedResponse.data.count}`);
      
      if (getSavedResponse.data.data?.farmers?.length > 0) {
        const savedFarmer = getSavedResponse.data.data.farmers[0];
        console.log(`   First saved farmer: ${savedFarmer.farmer?.name || 'N/A'}`);
        console.log('');
      }
    } catch (error) {
      handleError(error, 'Get saved farmers');
    }

    // Test 6: Unsave a farmer (DELETE /api/farmers/:id/save)
    console.log('📝 Test 6: Unsave a farmer');
    try {
      const unsaveResponse = await axios.delete(
        `${BASE_URL}/farmers/${farmerId}/save`,
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      const passed = unsaveResponse.status === 200 && 
                     unsaveResponse.data.success === true &&
                     unsaveResponse.data.message === 'Farmer removed from saved list successfully';
      
      logTest('Unsave farmer', passed, 
        `Status: ${unsaveResponse.status}, Remaining farmers: ${unsaveResponse.data.data?.farmers?.length || 0}`);
    } catch (error) {
      handleError(error, 'Unsave farmer');
    }

    // Test 7: Try to unsave a farmer that's not saved (should fail)
    console.log('📝 Test 7: Try to unsave a farmer that\'s not saved (should fail)');
    try {
      const notFoundResponse = await axios.delete(
        `${BASE_URL}/farmers/${farmerId}/save`,
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      logTest('Unsave non-existent farmer', false, 'Should have returned 404 error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logTest('Unsave non-existent farmer', true, 
          `Correctly rejected: ${error.response.data.message}`);
      } else {
        handleError(error, 'Unsave non-existent farmer');
      }
    }

    // Test 8: Get saved farmers after unsaving (should be empty)
    console.log('📝 Test 8: Get saved farmers after unsaving (should be empty)');
    try {
      const emptyResponse = await axios.get(
        `${BASE_URL}/farmers/saved`,
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      const passed = emptyResponse.status === 200 && 
                     emptyResponse.data.success === true &&
                     emptyResponse.data.data?.farmers?.length === 0;
      
      logTest('Get empty saved farmers list', passed, 
        `Status: ${emptyResponse.status}, Count: ${emptyResponse.data.count || 0}`);
    } catch (error) {
      handleError(error, 'Get empty saved farmers list');
    }

    // Test 9: Try to save a non-existent farmer (should fail)
    console.log('📝 Test 9: Try to save a non-existent farmer (should fail)');
    try {
      const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
      const notFoundResponse = await axios.post(
        `${BASE_URL}/farmers/${invalidId}/save`,
        {},
        {
          headers: { Authorization: `Bearer ${consumerToken}` }
        }
      );
      
      logTest('Save non-existent farmer', false, 'Should have returned 404 error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        logTest('Save non-existent farmer', true, 
          `Correctly rejected: ${error.response.data.message}`);
      } else {
        handleError(error, 'Save non-existent farmer');
      }
    }

    // Test 10: Test authentication requirement
    console.log('📝 Test 10: Test authentication requirement (no token)');
    try {
      const noAuthResponse = await axios.get(`${BASE_URL}/farmers/saved`);
      logTest('Authentication requirement', false, 'Should have returned 401 error');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logTest('Authentication requirement', true, 
          `Correctly rejected: ${error.response.data.message}`);
      } else {
        handleError(error, 'Authentication requirement');
      }
    }

    console.log('=' .repeat(60));
    console.log('\n✅ All Saved Farmers API tests completed!\n');

  } catch (error) {
    console.error('❌ Unexpected error during tests:', error.message);
  }
}

// Run the tests
runTests();
