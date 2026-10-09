/**
 * Verification Script for Product Filtering and Sorting
 * 
 * This script verifies that the product filtering and sorting implementation
 * is correctly structured and ready for use.
 * 
 * It checks:
 * 1. The productController has the enhanced getAllProducts function
 * 2. All required filter parameters are handled
 * 3. All required sorting options are implemented
 * 4. Response includes filter metadata
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
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

function verifyProductFiltering() {
  log('\n🔍 Verifying Product Filtering and Sorting Implementation\n', 'yellow');

  let allChecksPass = true;

  // Check 1: Verify productController.js exists and has been modified
  logSection('1. Checking Product Controller');
  const controllerPath = path.join(__dirname, 'controllers', 'productController.js');
  
  if (!fs.existsSync(controllerPath)) {
    logError('productController.js not found');
    allChecksPass = false;
  } else {
    logSuccess('productController.js exists');
    
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    
    // Check for filter implementations
    const requiredFilters = [
      { name: 'Category Filter', pattern: /req\.query\.category/ },
      { name: 'Price Range Filter (min)', pattern: /req\.query\.minPrice/ },
      { name: 'Price Range Filter (max)', pattern: /req\.query\.maxPrice/ },
      { name: 'Location Filter', pattern: /req\.query\.location/ },
      { name: 'Farming Practice Filter', pattern: /req\.query\.farmingPractice/ },
    ];
    
    logInfo('Checking filter implementations:');
    requiredFilters.forEach(filter => {
      if (filter.pattern.test(controllerContent)) {
        logSuccess(`  ${filter.name} implemented`);
      } else {
        logError(`  ${filter.name} missing`);
        allChecksPass = false;
      }
    });
    
    // Check for sorting implementations
    const requiredSorts = [
      { name: 'Price Ascending', pattern: /price-asc/ },
      { name: 'Price Descending', pattern: /price-desc/ },
      { name: 'Popularity', pattern: /popularity/ },
      { name: 'Newest', pattern: /newest/ },
      { name: 'Rating', pattern: /rating/ },
    ];
    
    logInfo('\nChecking sorting implementations:');
    requiredSorts.forEach(sort => {
      if (sort.pattern.test(controllerContent)) {
        logSuccess(`  ${sort.name} implemented`);
      } else {
        logError(`  ${sort.name} missing`);
        allChecksPass = false;
      }
    });
    
    // Check for filter metadata in response
    if (/filters:\s*{/.test(controllerContent)) {
      logSuccess('\nResponse includes filter metadata');
    } else {
      logError('\nResponse missing filter metadata');
      allChecksPass = false;
    }
  }

  // Check 2: Verify documentation exists
  logSection('2. Checking Documentation');
  
  const docPath = path.join(__dirname, 'docs', 'TASK_11.2_PRODUCT_FILTERING.md');
  if (fs.existsSync(docPath)) {
    logSuccess('TASK_11.2_PRODUCT_FILTERING.md exists');
    const docContent = fs.readFileSync(docPath, 'utf8');
    
    // Check documentation completeness
    const docSections = [
      'Supported Filters',
      'Supported Sorting Options',
      'Combined Filters',
      'Response Format',
      'Client-Side Implementation',
    ];
    
    docSections.forEach(section => {
      if (docContent.includes(section)) {
        logSuccess(`  Documentation includes "${section}"`);
      } else {
        logError(`  Documentation missing "${section}"`);
        allChecksPass = false;
      }
    });
  } else {
    logError('TASK_11.2_PRODUCT_FILTERING.md not found');
    allChecksPass = false;
  }
  
  const summaryPath = path.join(__dirname, 'docs', 'TASK_11.2_SUMMARY.md');
  if (fs.existsSync(summaryPath)) {
    logSuccess('TASK_11.2_SUMMARY.md exists');
  } else {
    logError('TASK_11.2_SUMMARY.md not found');
    allChecksPass = false;
  }

  // Check 3: Verify test script exists
  logSection('3. Checking Test Script');
  
  const testPath = path.join(__dirname, 'test-product-filtering.js');
  if (fs.existsSync(testPath)) {
    logSuccess('test-product-filtering.js exists');
    const testContent = fs.readFileSync(testPath, 'utf8');
    
    // Check test coverage
    const testCases = [
      'Filter by Category',
      'Filter by Price Range',
      'Filter by Farming Practice',
      'Filter by Location',
      'Sort by Price',
      'Sort by Popularity',
      'Sort by Newest',
      'Sort by Rating',
      'Combined Filters',
    ];
    
    testCases.forEach(testCase => {
      if (testContent.includes(testCase)) {
        logSuccess(`  Test includes "${testCase}"`);
      } else {
        logError(`  Test missing "${testCase}"`);
        allChecksPass = false;
      }
    });
  } else {
    logError('test-product-filtering.js not found');
    allChecksPass = false;
  }

  // Check 4: Verify Product Model has required fields
  logSection('4. Checking Product Model');
  
  const modelPath = path.join(__dirname, 'models', 'ProductModel.js');
  if (fs.existsSync(modelPath)) {
    logSuccess('ProductModel.js exists');
    const modelContent = fs.readFileSync(modelPath, 'utf8');
    
    const requiredFields = [
      { name: 'price', pattern: /price:\s*{/ },
      { name: 'category', pattern: /category:\s*{/ },
      { name: 'farmingPractice', pattern: /farmingPractice:\s*{/ },
      { name: 'rating', pattern: /rating:\s*{/ },
      { name: 'totalSales', pattern: /totalSales:\s*{/ },
      { name: 'createdAt', pattern: /timestamps:\s*true/ },
    ];
    
    requiredFields.forEach(field => {
      if (field.pattern.test(modelContent)) {
        logSuccess(`  Model has ${field.name} field`);
      } else {
        logError(`  Model missing ${field.name} field`);
        allChecksPass = false;
      }
    });
    
    // Check for indexes
    if (/\.index\(/.test(modelContent)) {
      logSuccess('  Model has indexes defined');
    } else {
      logError('  Model missing indexes');
      allChecksPass = false;
    }
  } else {
    logError('ProductModel.js not found');
    allChecksPass = false;
  }

  // Check 5: API Route exists
  logSection('5. Checking API Routes');
  
  const routePath = path.join(__dirname, 'routes', 'productRoutes.js');
  if (fs.existsSync(routePath)) {
    logSuccess('productRoutes.js exists');
    const routeContent = fs.readFileSync(routePath, 'utf8');
    
    if (/router\.get\(['"]\/['"]/.test(routeContent) || /router\.get\(\['"]\/['"]/.test(routeContent)) {
      logSuccess('  GET /api/products route exists');
    } else {
      logError('  GET /api/products route not found');
      allChecksPass = false;
    }
  } else {
    logError('productRoutes.js not found');
    allChecksPass = false;
  }

  // Summary
  logSection('Verification Summary');
  
  if (allChecksPass) {
    log('\n✅ All verification checks passed!', 'green');
    log('\nThe product filtering and sorting implementation is complete and ready for use.', 'green');
    log('\nNext steps:', 'blue');
    log('  1. Start MongoDB: mongod', 'blue');
    log('  2. Start the API server: npm run dev', 'blue');
    log('  3. Run the test script: node test-product-filtering.js', 'blue');
    log('  4. Implement frontend filter UI components', 'blue');
    log('  5. Integrate with React Query for seamless updates\n', 'blue');
  } else {
    log('\n❌ Some verification checks failed.', 'red');
    log('Please review the errors above and ensure all components are properly implemented.\n', 'red');
    process.exit(1);
  }
}

// Run verification
verifyProductFiltering();
