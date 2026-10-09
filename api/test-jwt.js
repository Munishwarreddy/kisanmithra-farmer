/**
 * Manual test script for JWT token generation and verification
 * Run with: node test-jwt.js
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();

console.log("=== JWT Token Generation and Verification Test ===\n");

// Test 1: Token Generation
console.log("Test 1: Token Generation");
try {
  const userId = "507f1f77bcf86cd799439011"; // Mock MongoDB ObjectId
  const userRole = "consumer";
  
  const token = jwt.sign(
    { 
      id: userId, 
      role: userRole,
      iat: Math.floor(Date.now() / 1000)
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || "90d",
    }
  );
  
  console.log("✓ Token generated successfully");
  console.log("Token:", token.substring(0, 50) + "...");
  console.log();
  
  // Test 2: Token Verification
  console.log("Test 2: Token Verification");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✓ Token verified successfully");
  console.log("Decoded payload:", {
    id: decoded.id,
    role: decoded.role,
    iat: new Date(decoded.iat * 1000).toISOString(),
    exp: new Date(decoded.exp * 1000).toISOString()
  });
  console.log();
  
  // Test 3: Token Expiration Check
  console.log("Test 3: Token Expiration Check");
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - now;
  const daysUntilExpiry = Math.floor(timeUntilExpiry / (60 * 60 * 24));
  console.log(`✓ Token expires in ${daysUntilExpiry} days`);
  console.log();
  
  // Test 4: Invalid Token
  console.log("Test 4: Invalid Token Handling");
  try {
    jwt.verify("invalid.token.here", process.env.JWT_SECRET);
    console.log("✗ Should have thrown an error");
  } catch (error) {
    console.log("✓ Invalid token correctly rejected");
    console.log("Error:", error.name, "-", error.message);
  }
  console.log();
  
  // Test 5: Expired Token
  console.log("Test 5: Expired Token Handling");
  const expiredToken = jwt.sign(
    { id: userId, role: userRole }, 
    process.env.JWT_SECRET, 
    { expiresIn: "0s" }
  );
  
  // Wait a moment to ensure token is expired
  setTimeout(() => {
    try {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
      console.log("✗ Should have thrown an error");
    } catch (error) {
      console.log("✓ Expired token correctly rejected");
      console.log("Error:", error.name, "-", error.message);
    }
    console.log();
    
    console.log("=== All Tests Completed ===");
  }, 100);
  
} catch (error) {
  console.error("✗ Test failed:", error.message);
  process.exit(1);
}
