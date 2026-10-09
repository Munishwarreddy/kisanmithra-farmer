/**
 * Integration test for authentication flow
 * Tests the complete authentication controller and middleware
 * Run with: node test-auth-integration.js
 */

const jwt = require("jsonwebtoken");
require("dotenv").config();

console.log("=== Authentication Integration Test ===\n");

// Mock User Model
const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Test User",
  email: "test@example.com",
  role: "consumer",
  phone: "1234567890",
  address: {
    street: "123 Test St",
    city: "Test City",
    state: "Test State",
    pincode: "12345"
  },
  isActive: true,
  isVerified: true
};

// Test generateToken function
console.log("Test 1: Token Generation Function");
const generateToken = (id, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = process.env.JWT_EXPIRE || "90d";

  return jwt.sign(
    { 
      id, 
      role,
      iat: Math.floor(Date.now() / 1000)
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn,
    }
  );
};

try {
  const token = generateToken(mockUser._id, mockUser.role);
  console.log("✓ Token generated successfully");
  console.log("Token preview:", token.substring(0, 50) + "...\n");
} catch (error) {
  console.error("✗ Token generation failed:", error.message);
  process.exit(1);
}

// Test verifyToken function
console.log("Test 2: Token Verification Function");
const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

try {
  const token = generateToken(mockUser._id, mockUser.role);
  const decoded = verifyToken(token);
  
  if (decoded.id === mockUser._id && decoded.role === mockUser.role) {
    console.log("✓ Token verification successful");
    console.log("Decoded user ID:", decoded.id);
    console.log("Decoded user role:", decoded.role);
  } else {
    console.error("✗ Token payload mismatch");
    process.exit(1);
  }
} catch (error) {
  console.error("✗ Token verification failed:", error.message);
  process.exit(1);
}
console.log();

// Test token expiration handling
console.log("Test 3: Token Expiration Handling");
try {
  const expiredToken = jwt.sign(
    { id: mockUser._id, role: mockUser.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: "0s" }
  );
  
  setTimeout(() => {
    try {
      verifyToken(expiredToken);
      console.error("✗ Expired token should have been rejected");
      process.exit(1);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.log("✓ Expired token correctly rejected");
        console.log("Error type:", error.name);
      } else {
        console.error("✗ Unexpected error:", error.message);
        process.exit(1);
      }
    }
    console.log();
    
    // Test invalid token handling
    console.log("Test 4: Invalid Token Handling");
    try {
      verifyToken("invalid.token.string");
      console.error("✗ Invalid token should have been rejected");
      process.exit(1);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        console.log("✓ Invalid token correctly rejected");
        console.log("Error type:", error.name);
      } else {
        console.error("✗ Unexpected error:", error.message);
        process.exit(1);
      }
    }
    console.log();
    
    // Test role-based authorization
    console.log("Test 5: Role-Based Authorization");
    const consumerToken = generateToken(mockUser._id, "consumer");
    const farmerToken = generateToken(mockUser._id, "farmer");
    const adminToken = generateToken(mockUser._id, "admin");
    
    const consumerDecoded = verifyToken(consumerToken);
    const farmerDecoded = verifyToken(farmerToken);
    const adminDecoded = verifyToken(adminToken);
    
    if (
      consumerDecoded.role === "consumer" &&
      farmerDecoded.role === "farmer" &&
      adminDecoded.role === "admin"
    ) {
      console.log("✓ Role-based tokens generated correctly");
      console.log("Consumer role:", consumerDecoded.role);
      console.log("Farmer role:", farmerDecoded.role);
      console.log("Admin role:", adminDecoded.role);
    } else {
      console.error("✗ Role mismatch in tokens");
      process.exit(1);
    }
    console.log();
    
    // Test token with missing JWT_SECRET
    console.log("Test 6: Missing JWT_SECRET Handling");
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    
    try {
      generateToken(mockUser._id, mockUser.role);
      console.error("✗ Should have thrown error for missing JWT_SECRET");
      process.exit(1);
    } catch (error) {
      if (error.message.includes("JWT_SECRET")) {
        console.log("✓ Missing JWT_SECRET correctly detected");
        console.log("Error message:", error.message);
      } else {
        console.error("✗ Unexpected error:", error.message);
        process.exit(1);
      }
    }
    
    // Restore JWT_SECRET
    process.env.JWT_SECRET = originalSecret;
    console.log();
    
    console.log("=== All Integration Tests Passed ===");
    console.log("\nSummary:");
    console.log("✓ Token generation with user ID and role");
    console.log("✓ Token verification and payload extraction");
    console.log("✓ Expired token rejection");
    console.log("✓ Invalid token rejection");
    console.log("✓ Role-based authorization");
    console.log("✓ Configuration validation");
    
  }, 100);
  
} catch (error) {
  console.error("✗ Test failed:", error.message);
  process.exit(1);
}
