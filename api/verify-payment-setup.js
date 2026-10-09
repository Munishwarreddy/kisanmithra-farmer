/**
 * Payment Setup Verification Script
 * 
 * This script verifies that the payment integration is properly set up
 * without requiring database or Stripe API connections.
 */

const fs = require('fs');
const path = require('path');

// Color codes for console output
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

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkFileContains(filePath, searchString, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes(searchString)) {
      log(`✓ ${description}`, 'green');
      return true;
    } else {
      log(`✗ ${description} - String not found: ${searchString}`, 'red');
      return false;
    }
  } else {
    log(`✗ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
}

function checkPackageInstalled(packageName) {
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.dependencies && packageJson.dependencies[packageName]) {
      log(`✓ Package '${packageName}' installed (v${packageJson.dependencies[packageName]})`, 'green');
      return true;
    } else {
      log(`✗ Package '${packageName}' not installed`, 'red');
      return false;
    }
  } else {
    log(`✗ package.json not found`, 'red');
    return false;
  }
}

function verifyPaymentSetup() {
  log('\n╔════════════════════════════════════════════════╗', 'cyan');
  log('║   Payment Integration Setup Verification      ║', 'cyan');
  log('╚════════════════════════════════════════════════╝\n', 'cyan');

  let allChecks = true;

  // Check 1: Stripe package installed
  log('=== Check 1: Dependencies ===', 'yellow');
  allChecks = checkPackageInstalled('stripe') && allChecks;
  console.log();

  // Check 2: Payment service file
  log('=== Check 2: Payment Service ===', 'yellow');
  allChecks = checkFileExists('services/paymentService.js', 'Payment service file exists') && allChecks;
  allChecks = checkFileContains('services/paymentService.js', 'createPaymentIntent', 'createPaymentIntent function exists') && allChecks;
  allChecks = checkFileContains('services/paymentService.js', 'handlePaymentSuccess', 'handlePaymentSuccess function exists') && allChecks;
  allChecks = checkFileContains('services/paymentService.js', 'handlePaymentFailure', 'handlePaymentFailure function exists') && allChecks;
  allChecks = checkFileContains('services/paymentService.js', 'processRefund', 'processRefund function exists') && allChecks;
  allChecks = checkFileContains('services/paymentService.js', 'verifyWebhookSignature', 'verifyWebhookSignature function exists') && allChecks;
  console.log();

  // Check 3: Payment controller file
  log('=== Check 3: Payment Controller ===', 'yellow');
  allChecks = checkFileExists('controllers/paymentController.js', 'Payment controller file exists') && allChecks;
  allChecks = checkFileContains('controllers/paymentController.js', 'createPaymentIntent', 'createPaymentIntent endpoint exists') && allChecks;
  allChecks = checkFileContains('controllers/paymentController.js', 'handlePaymentSuccess', 'handlePaymentSuccess endpoint exists') && allChecks;
  allChecks = checkFileContains('controllers/paymentController.js', 'handlePaymentFailure', 'handlePaymentFailure endpoint exists') && allChecks;
  allChecks = checkFileContains('controllers/paymentController.js', 'processRefund', 'processRefund endpoint exists') && allChecks;
  allChecks = checkFileContains('controllers/paymentController.js', 'handleWebhook', 'handleWebhook endpoint exists') && allChecks;
  console.log();

  // Check 4: Payment routes file
  log('=== Check 4: Payment Routes ===', 'yellow');
  allChecks = checkFileExists('routes/paymentRoutes.js', 'Payment routes file exists') && allChecks;
  allChecks = checkFileContains('routes/paymentRoutes.js', '/create-intent', 'Create intent route exists') && allChecks;
  allChecks = checkFileContains('routes/paymentRoutes.js', '/success', 'Success route exists') && allChecks;
  allChecks = checkFileContains('routes/paymentRoutes.js', '/failure', 'Failure route exists') && allChecks;
  allChecks = checkFileContains('routes/paymentRoutes.js', '/refund', 'Refund route exists') && allChecks;
  allChecks = checkFileContains('routes/paymentRoutes.js', '/webhook', 'Webhook route exists') && allChecks;
  console.log();

  // Check 5: Server integration
  log('=== Check 5: Server Integration ===', 'yellow');
  allChecks = checkFileContains('server.js', 'paymentRoutes', 'Payment routes imported in server.js') && allChecks;
  allChecks = checkFileContains('server.js', '/api/payments', 'Payment routes registered in server.js') && allChecks;
  console.log();

  // Check 6: Order model updates
  log('=== Check 6: Order Model Updates ===', 'yellow');
  allChecks = checkFileContains('models/OrderModel.js', 'online', 'Online payment method added to Order model') && allChecks;
  allChecks = checkFileContains('models/OrderModel.js', 'paymentId', 'paymentId field exists in Order model') && allChecks;
  allChecks = checkFileContains('models/OrderModel.js', 'paymentStatus', 'paymentStatus field exists in Order model') && allChecks;
  console.log();

  // Check 7: Environment configuration
  log('=== Check 7: Environment Configuration ===', 'yellow');
  allChecks = checkFileContains('.env', 'STRIPE_SECRET_KEY', 'STRIPE_SECRET_KEY configured in .env') && allChecks;
  allChecks = checkFileContains('.env', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_PUBLISHABLE_KEY configured in .env') && allChecks;
  allChecks = checkFileContains('.env', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_SECRET configured in .env') && allChecks;
  console.log();

  // Check 8: Documentation
  log('=== Check 8: Documentation ===', 'yellow');
  allChecks = checkFileExists('docs/TASK_12.1_PAYMENT_INTEGRATION.md', 'Payment integration documentation exists') && allChecks;
  allChecks = checkFileExists('docs/TASK_12.1_SUMMARY.md', 'Payment integration summary exists') && allChecks;
  console.log();

  // Check 9: Test files
  log('=== Check 9: Test Files ===', 'yellow');
  allChecks = checkFileExists('test-payment-integration.js', 'Payment integration test file exists') && allChecks;
  console.log();

  // Final result
  if (allChecks) {
    log('\n╔════════════════════════════════════════════════╗', 'green');
    log('║   All Checks Passed! ✓                         ║', 'green');
    log('╚════════════════════════════════════════════════╝\n', 'green');
    log('Payment integration is properly set up.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Configure Stripe API keys in .env file', 'blue');
    log('2. Start MongoDB server', 'blue');
    log('3. Run: node test-payment-integration.js', 'blue');
    log('4. Implement frontend payment UI', 'blue');
    return true;
  } else {
    log('\n╔════════════════════════════════════════════════╗', 'red');
    log('║   Some Checks Failed ✗                         ║', 'red');
    log('╚════════════════════════════════════════════════╝\n', 'red');
    log('Please fix the issues above before proceeding.', 'red');
    return false;
  }
}

// Run verification
const success = verifyPaymentSetup();
process.exit(success ? 0 : 1);
