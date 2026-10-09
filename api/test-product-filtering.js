/**
 * Test Product Filtering and Sorting
 * 
 * This script tests the enhanced product filtering and sorting functionality
 * for task 11.2 of the enhanced-ecommerce-platform spec.
 * 
 * Tests:
 * 1. Filter by category
 * 2. Filter by price range
 * 3. Filter by location (city/state)
 * 4. Filter by farming practice
 * 5. Sort by price (ascending/descending)
 * 6. Sort by popularity (totalSales)
 * 7. Sort by newest (createdAt)
 * 8. Sort by rating
 * 9. Combined filters
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log('\n' + '='.repeat(60));
  log(`TEST: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

async function testProductFiltering() {
  try {
    log('\n🚀 Starting Product Filtering and Sorting Tests\n', 'yellow');

    // Test 1: Get all products (baseline)
    logTest('Get All Products (Baseline)');
    const allProductsRes = await axios.get(`${BASE_URL}/products`);
    if (allProductsRes.data.success) {
      logSuccess(`Retrieved ${allProductsRes.data.count} products`);
      logInfo(`Sample product: ${allProductsRes.data.data[0]?.name || 'N/A'}`);
    } else {
      logError('Failed to retrieve products');
    }

    // Test 2: Filter by category
    logTest('Filter by Category');
    if (allProductsRes.data.data.length > 0) {
      const sampleCategory = allProductsRes.data.data[0].category?._id;
      if (sampleCategory) {
        const categoryRes = await axios.get(`${BASE_URL}/products?category=${sampleCategory}`);
        if (categoryRes.data.success) {
          logSuccess(`Filtered by category: ${categoryRes.data.count} products`);
          const allMatchCategory = categoryRes.data.data.every(p => 
            p.category._id.toString() === sampleCategory.toString()
          );
          if (allMatchCategory) {
            logSuccess('All products match the category filter');
          } else {
            logError('Some products do not match the category filter');
          }
        }
      } else {
        logInfo('No category available for testing');
      }
    }

    // Test 3: Filter by price range
    logTest('Filter by Price Range');
    const priceRes = await axios.get(`${BASE_URL}/products?minPrice=10&maxPrice=50`);
    if (priceRes.data.success) {
      logSuccess(`Filtered by price range (10-50): ${priceRes.data.count} products`);
      const allInRange = priceRes.data.data.every(p => p.price >= 10 && p.price <= 50);
      if (allInRange) {
        logSuccess('All products are within the price range');
      } else {
        logError('Some products are outside the price range');
        const outOfRange = priceRes.data.data.filter(p => p.price < 10 || p.price > 50);
        logInfo(`Out of range products: ${outOfRange.map(p => `${p.name} ($${p.price})`).join(', ')}`);
      }
    }

    // Test 4: Filter by farming practice
    logTest('Filter by Farming Practice');
    const practices = ['organic', 'sustainable', 'traditional'];
    for (const practice of practices) {
      const practiceRes = await axios.get(`${BASE_URL}/products?farmingPractice=${practice}`);
      if (practiceRes.data.success) {
        logSuccess(`Filtered by ${practice}: ${practiceRes.data.count} products`);
        const allMatch = practiceRes.data.data.every(p => p.farmingPractice === practice);
        if (allMatch) {
          logSuccess(`All products match the ${practice} filter`);
        } else {
          logError(`Some products do not match the ${practice} filter`);
        }
      }
    }

    // Test 5: Filter by location
    logTest('Filter by Location');
    if (allProductsRes.data.data.length > 0) {
      const sampleCity = allProductsRes.data.data[0].farmer?.address?.city;
      if (sampleCity) {
        const locationRes = await axios.get(`${BASE_URL}/products?location=${sampleCity}`);
        if (locationRes.data.success) {
          logSuccess(`Filtered by location (${sampleCity}): ${locationRes.data.count} products`);
          logInfo(`Sample farmer location: ${locationRes.data.data[0]?.farmer?.address?.city || 'N/A'}`);
        }
      } else {
        logInfo('No location data available for testing');
      }
    }

    // Test 6: Sort by price (ascending)
    logTest('Sort by Price (Ascending)');
    const priceAscRes = await axios.get(`${BASE_URL}/products?sortBy=price-asc`);
    if (priceAscRes.data.success && priceAscRes.data.data.length > 1) {
      const prices = priceAscRes.data.data.map(p => p.price);
      const isSorted = prices.every((price, i) => i === 0 || price >= prices[i - 1]);
      if (isSorted) {
        logSuccess('Products sorted by price (ascending)');
        logInfo(`Price range: $${prices[0]} - $${prices[prices.length - 1]}`);
      } else {
        logError('Products not properly sorted by price (ascending)');
      }
    }

    // Test 7: Sort by price (descending)
    logTest('Sort by Price (Descending)');
    const priceDescRes = await axios.get(`${BASE_URL}/products?sortBy=price-desc`);
    if (priceDescRes.data.success && priceDescRes.data.data.length > 1) {
      const prices = priceDescRes.data.data.map(p => p.price);
      const isSorted = prices.every((price, i) => i === 0 || price <= prices[i - 1]);
      if (isSorted) {
        logSuccess('Products sorted by price (descending)');
        logInfo(`Price range: $${prices[0]} - $${prices[prices.length - 1]}`);
      } else {
        logError('Products not properly sorted by price (descending)');
      }
    }

    // Test 8: Sort by popularity (totalSales)
    logTest('Sort by Popularity');
    const popularityRes = await axios.get(`${BASE_URL}/products?sortBy=popularity`);
    if (popularityRes.data.success && popularityRes.data.data.length > 1) {
      const sales = popularityRes.data.data.map(p => p.totalSales);
      const isSorted = sales.every((sale, i) => i === 0 || sale <= sales[i - 1]);
      if (isSorted) {
        logSuccess('Products sorted by popularity (totalSales)');
        logInfo(`Sales range: ${sales[0]} - ${sales[sales.length - 1]}`);
      } else {
        logError('Products not properly sorted by popularity');
      }
    }

    // Test 9: Sort by newest
    logTest('Sort by Newest');
    const newestRes = await axios.get(`${BASE_URL}/products?sortBy=newest`);
    if (newestRes.data.success && newestRes.data.data.length > 1) {
      const dates = newestRes.data.data.map(p => new Date(p.createdAt).getTime());
      const isSorted = dates.every((date, i) => i === 0 || date <= dates[i - 1]);
      if (isSorted) {
        logSuccess('Products sorted by newest');
      } else {
        logError('Products not properly sorted by newest');
      }
    }

    // Test 10: Sort by rating
    logTest('Sort by Rating');
    const ratingRes = await axios.get(`${BASE_URL}/products?sortBy=rating`);
    if (ratingRes.data.success && ratingRes.data.data.length > 1) {
      const ratings = ratingRes.data.data.map(p => p.rating);
      const isSorted = ratings.every((rating, i) => i === 0 || rating <= ratings[i - 1]);
      if (isSorted) {
        logSuccess('Products sorted by rating');
        logInfo(`Rating range: ${ratings[0]} - ${ratings[ratings.length - 1]}`);
      } else {
        logError('Products not properly sorted by rating');
      }
    }

    // Test 11: Combined filters
    logTest('Combined Filters (Price + Farming Practice + Sort)');
    const combinedRes = await axios.get(
      `${BASE_URL}/products?minPrice=5&maxPrice=100&farmingPractice=organic&sortBy=price-asc`
    );
    if (combinedRes.data.success) {
      logSuccess(`Combined filters: ${combinedRes.data.count} products`);
      
      // Verify price range
      const allInRange = combinedRes.data.data.every(p => p.price >= 5 && p.price <= 100);
      if (allInRange) {
        logSuccess('All products within price range (5-100)');
      } else {
        logError('Some products outside price range');
      }
      
      // Verify farming practice
      const allOrganic = combinedRes.data.data.every(p => p.farmingPractice === 'organic');
      if (allOrganic) {
        logSuccess('All products are organic');
      } else {
        logError('Some products are not organic');
      }
      
      // Verify sorting
      if (combinedRes.data.data.length > 1) {
        const prices = combinedRes.data.data.map(p => p.price);
        const isSorted = prices.every((price, i) => i === 0 || price >= prices[i - 1]);
        if (isSorted) {
          logSuccess('Products sorted by price (ascending)');
        } else {
          logError('Products not properly sorted');
        }
      }
    }

    // Test 12: Response includes filter metadata
    logTest('Response Includes Filter Metadata');
    const metadataRes = await axios.get(
      `${BASE_URL}/products?category=test&minPrice=10&maxPrice=50&sortBy=price-asc`
    );
    if (metadataRes.data.filters) {
      logSuccess('Response includes filter metadata');
      logInfo(`Filters: ${JSON.stringify(metadataRes.data.filters, null, 2)}`);
    } else {
      logError('Response missing filter metadata');
    }

    log('\n✅ All Product Filtering and Sorting Tests Completed!\n', 'green');

  } catch (error) {
    logError(`Test failed with error: ${error.message}`);
    if (error.response) {
      logError(`Response status: ${error.response.status}`);
      logError(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run tests
testProductFiltering();
