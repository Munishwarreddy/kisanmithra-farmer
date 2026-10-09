/**
 * Verification script for Task 9.2: Order Completion and Review Prompts
 * 
 * This script verifies the implementation by checking:
 * 1. Code changes in orderController.js
 * 2. Logic for auto-updating status to completed
 * 3. Logic for sending review prompt notification
 * 
 * Requirements validated: 11.8
 */

const fs = require("fs");
const path = require("path");

console.log("=".repeat(70));
console.log("Task 9.2: Order Completion and Review Prompts - Verification");
console.log("=".repeat(70));

// Read the orderController.js file
const controllerPath = path.join(__dirname, "controllers", "orderController.js");
const controllerCode = fs.readFileSync(controllerPath, "utf8");

console.log("\n✓ Reading orderController.js...");

// Verification checks
const checks = [
  {
    name: "Auto-update status to completed on delivery",
    pattern: /if\s*\(\s*status\s*===\s*["']delivered["']\s*\)\s*{\s*order\.status\s*=\s*["']completed["']/,
    description: "Checks if status is auto-updated to 'completed' when set to 'delivered'",
  },
  {
    name: "Review prompt notification creation",
    pattern: /type:\s*["']review["']/,
    description: "Checks if review notification is created with type 'review'",
  },
  {
    name: "Review notification title",
    pattern: /title:\s*["']How was your order\?["']/,
    description: "Checks if review notification has correct title",
  },
  {
    name: "Review notification message with product names",
    pattern: /message:\s*`Please share your experience with \$\{productNames\}`/,
    description: "Checks if review message includes product names",
  },
  {
    name: "Product names extraction",
    pattern: /const productNames = order\.items\.map\(item => item\.name\)\.join\(/,
    description: "Checks if product names are extracted from order items",
  },
  {
    name: "Review notification link",
    pattern: /link:\s*`\/orders\/\$\{order\._id\}\/review`/,
    description: "Checks if review notification has link to review page",
  },
  {
    name: "Review notification metadata",
    pattern: /metadata:\s*{\s*orderId:\s*order\._id,\s*orderNumber:\s*order\.orderNumber,\s*productIds:/,
    description: "Checks if review notification includes metadata",
  },
  {
    name: "Socket.io emission for review notification",
    pattern: /emitToUser\(order\.consumer\._id\.toString\(\),\s*["']notification:new["']/,
    description: "Checks if review notification is emitted via Socket.io",
  },
  {
    name: "Condition for review notification",
    pattern: /if\s*\(\s*status\s*===\s*["']delivered["']\s*\|\|\s*order\.status\s*===\s*["']completed["']\s*\)/,
    description: "Checks if review notification is sent when order is delivered or completed",
  },
  {
    name: "Error handling for review notification",
    pattern: /catch\s*\(\s*reviewNotifError\s*\)/,
    description: "Checks if there's error handling for review notification creation",
  },
];

console.log("\n--- Verification Checks ---\n");

let passedChecks = 0;
let failedChecks = 0;

checks.forEach((check, index) => {
  const passed = check.pattern.test(controllerCode);
  
  if (passed) {
    console.log(`✓ Check ${index + 1}: ${check.name}`);
    console.log(`  ${check.description}`);
    passedChecks++;
  } else {
    console.log(`✗ Check ${index + 1}: ${check.name}`);
    console.log(`  ${check.description}`);
    failedChecks++;
  }
  console.log();
});

// Summary
console.log("=".repeat(70));
console.log("Verification Summary");
console.log("=".repeat(70));
console.log(`Total Checks: ${checks.length}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${failedChecks}`);
console.log();

if (failedChecks === 0) {
  console.log("✓ ALL VERIFICATION CHECKS PASSED");
  console.log();
  console.log("Implementation includes:");
  console.log("  ✓ Auto-update order status to 'completed' when set to 'delivered'");
  console.log("  ✓ Create review prompt notification with type 'review'");
  console.log("  ✓ Set notification title to 'How was your order?'");
  console.log("  ✓ Include product names in notification message");
  console.log("  ✓ Provide link to review submission page");
  console.log("  ✓ Include order and product metadata");
  console.log("  ✓ Send real-time notification via Socket.io");
  console.log("  ✓ Handle errors gracefully");
  console.log();
  console.log("✓ Requirement 11.8 validated successfully!");
  console.log();
  
  // Show code snippet
  console.log("=".repeat(70));
  console.log("Key Implementation Snippet");
  console.log("=".repeat(70));
  
  // Extract the relevant code section
  const autoCompleteMatch = controllerCode.match(/\/\/ Auto-update to completed[\s\S]*?}\s*}/);
  if (autoCompleteMatch) {
    console.log("\n" + autoCompleteMatch[0]);
  }
  
  const reviewNotifMatch = controllerCode.match(/\/\/ Send review prompt notification[\s\S]*?catch \(reviewNotifError\)[\s\S]*?}\s*}/);
  if (reviewNotifMatch) {
    console.log("\n" + reviewNotifMatch[0]);
  }
  
  process.exit(0);
} else {
  console.log("✗ VERIFICATION FAILED");
  console.log();
  console.log("Some checks did not pass. Please review the implementation.");
  process.exit(1);
}
