# Role-Based Authorization Implementation

## Overview

This document describes the role-based authorization implementation for the KisanMithra e-commerce platform. The implementation uses middleware functions to protect routes based on user roles (consumer, farmer, admin).

## Authorization Middleware

**Location**: `api/utils/authMiddleware.js`

### Available Middleware Functions

1. **verifyToken**: Validates JWT token and loads user data
2. **isAdmin**: Ensures user has admin role
3. **isFarmer**: Ensures user has farmer role
4. **isConsumer**: Ensures user has consumer role

### Middleware Implementation

```javascript
// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as an admin" });
  }
};

// Middleware to check if user is farmer
exports.isFarmer = (req, res, next) => {
  if (req.user && req.user.role === "farmer") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as a farmer" });
  }
};

// Middleware to check if user is consumer
exports.isConsumer = (req, res, next) => {
  if (req.user && req.user.role === "consumer") {
    next();
  } else {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized as a consumer" });
  }
};
```

## Route Protection by Module

### 1. Authentication Routes (`api/routes/authRoutes.js`)

**Public Routes** (No authentication required):
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/verify-token` - Verify token validity

**Protected Routes** (Authentication required):
- `GET /api/auth/me` - Get current user (verifyToken)
- `POST /api/auth/refresh-token` - Refresh JWT token (verifyToken)

### 2. User Routes (`api/routes/userRoutes.js`)

**Public Routes**:
- `GET /api/users/farmers` - Get all farmers
- `GET /api/users/farmers/:id` - Get farmer profile

**Protected Routes** (Any authenticated user):
- `PUT /api/users/profile` - Update user profile (verifyToken)

**Farmer-Only Routes**:
- `PUT /api/users/farmers/profile` - Update farmer profile (verifyToken + isFarmer)

**Admin-Only Routes**:
- `GET /api/users` - Get all users (verifyToken + isAdmin)
- `DELETE /api/users/:id` - Delete user (verifyToken + isAdmin)

### 3. Product Routes (`api/routes/productRoutes.js`)

**Public Routes**:
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID

**Farmer-Only Routes**:
- `POST /api/products` - Create product (verifyToken + isFarmer)
- `PUT /api/products/:id` - Update product (verifyToken + isFarmer)
- `DELETE /api/products/:id` - Delete product (verifyToken + isFarmer)
- `GET /api/products/farmer/me` - Get farmer's products (verifyToken + isFarmer)

### 4. Order Routes (`api/routes/orderRoutes.js`)

**Consumer-Only Routes**:
- `POST /api/orders` - Create order (verifyToken + isConsumer)
- `GET /api/orders/consumer` - Get consumer orders (verifyToken + isConsumer)

**Farmer-Only Routes**:
- `GET /api/orders/farmer` - Get farmer orders (verifyToken + isFarmer)

**Protected Routes** (Any authenticated user):
- `GET /api/orders/:id` - Get order by ID (verifyToken)
- `PUT /api/orders/:id` - Update order status (verifyToken)

**Admin-Only Routes**:
- `GET /api/orders` - Get all orders (verifyToken + isAdmin)

### 5. Category Routes (`api/routes/categoryRoutes.js`)

**Public Routes**:
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID

**Admin-Only Routes**:
- `POST /api/categories` - Create category (verifyToken + isAdmin)
- `PUT /api/categories/:id` - Update category (verifyToken + isAdmin)
- `DELETE /api/categories/:id` - Delete category (verifyToken + isAdmin)

### 6. Message Routes (`api/routes/messageRoutes.js`)

**Protected Routes** (Any authenticated user):
- `POST /api/messages` - Send message (verifyToken)
- `GET /api/messages` - Get conversations (verifyToken)
- `GET /api/messages/:userId` - Get conversation with user (verifyToken)
- `PUT /api/messages/read/:userId` - Mark messages as read (verifyToken)

## Authorization Flow

### 1. Request Flow with Role-Based Authorization

```
Client Request
    ↓
Express Router
    ↓
verifyToken Middleware
    ├─ Extract token from Authorization header
    ├─ Verify JWT signature and expiration
    ├─ Load user from database
    ├─ Check if user is active
    └─ Attach user to req.user
    ↓
Role-Based Middleware (if required)
    ├─ isAdmin: Check if req.user.role === "admin"
    ├─ isFarmer: Check if req.user.role === "farmer"
    └─ isConsumer: Check if req.user.role === "consumer"
    ↓
Controller Function
    └─ Execute business logic
```

### 2. Error Responses

#### Authentication Errors (401 Unauthorized)
- No token provided
- Invalid token
- Expired token
- User not found
- Account deactivated

#### Authorization Errors (403 Forbidden)
- User role does not match required role
- Insufficient permissions

## Usage Examples

### Frontend Implementation

#### 1. Making Authenticated Requests

```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  // Handle authorization errors
  if (response.status === 403) {
    console.error('Access denied:', data.message);
    // Show error message to user
  }
  
  return data;
};
```

#### 2. Role-Specific UI Components

```javascript
const RoleBasedComponent = ({ user }) => {
  return (
    <div>
      {/* Show to all authenticated users */}
      <button onClick={viewProfile}>View Profile</button>
      
      {/* Show only to farmers */}
      {user.role === 'farmer' && (
        <button onClick={addProduct}>Add Product</button>
      )}
      
      {/* Show only to consumers */}
      {user.role === 'consumer' && (
        <button onClick={placeOrder}>Place Order</button>
      )}
      
      {/* Show only to admins */}
      {user.role === 'admin' && (
        <button onClick={manageUsers}>Manage Users</button>
      )}
    </div>
  );
};
```

### Backend Implementation

#### 1. Protecting Routes

```javascript
const express = require('express');
const { verifyToken, isFarmer, isAdmin } = require('../utils/authMiddleware');
const router = express.Router();

// Public route - no authentication
router.get('/public', publicController);

// Protected route - any authenticated user
router.get('/protected', verifyToken, protectedController);

// Farmer-only route
router.post('/farmer-only', verifyToken, isFarmer, farmerController);

// Admin-only route
router.delete('/admin-only', verifyToken, isAdmin, adminController);
```

#### 2. Checking Permissions in Controllers

```javascript
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    // Additional authorization check
    // Ensure farmer can only update their own products
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    // Update product logic...
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## Security Best Practices

1. **Always Use verifyToken First**: Role-based middleware should always come after verifyToken
   ```javascript
   // Correct
   router.post('/farmer-route', verifyToken, isFarmer, controller);
   
   // Incorrect - will fail because req.user is not set
   router.post('/farmer-route', isFarmer, controller);
   ```

2. **Resource Ownership Validation**: In addition to role checks, validate that users can only access their own resources
   ```javascript
   // Check if user owns the resource
   if (resource.userId.toString() !== req.user._id.toString()) {
     return res.status(403).json({ message: 'Access denied' });
   }
   ```

3. **Principle of Least Privilege**: Only grant the minimum permissions necessary
   - Consumers: Can create orders, view their own orders
   - Farmers: Can manage their own products, view their orders
   - Admins: Can manage all resources

4. **Consistent Error Messages**: Use consistent error messages for authorization failures
   - 401: Authentication required or failed
   - 403: Authenticated but not authorized

5. **Audit Logging**: Log all authorization failures for security monitoring
   ```javascript
   console.error(`Authorization failed: User ${req.user._id} attempted to access ${req.path}`);
   ```

## Testing Authorization

### Manual Testing

#### 1. Test Admin Routes
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Use admin token to access admin route
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <admin_token>"

# Try with non-admin token (should fail with 403)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <consumer_token>"
```

#### 2. Test Farmer Routes
```bash
# Login as farmer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@example.com","password":"password"}'

# Create product (should succeed)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <farmer_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tomatoes","price":50,"category":"vegetables"}'

# Try with consumer token (should fail with 403)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <consumer_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Tomatoes","price":50,"category":"vegetables"}'
```

#### 3. Test Consumer Routes
```bash
# Login as consumer
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer@example.com","password":"password"}'

# Create order (should succeed)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <consumer_token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product":"123","quantity":2}]}'

# Try with farmer token (should fail with 403)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <farmer_token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"product":"123","quantity":2}]}'
```

## Requirements Validation

This implementation satisfies **Requirement 20.6**:

**"WHEN sensitive API endpoints are accessed, THE System SHALL verify user authorization before returning data"**

✅ **Satisfied**:
- Role-based middleware functions (isAdmin, isFarmer, isConsumer) verify user roles
- Farmer-only routes protected with isFarmer middleware
- Admin-only routes protected with isAdmin middleware
- Consumer-only routes protected with isConsumer middleware
- Returns 403 Forbidden for unauthorized access attempts
- Returns 401 Unauthorized for unauthenticated requests

## Route Protection Summary

| Route Pattern | Public | Auth Required | Consumer | Farmer | Admin |
|--------------|--------|---------------|----------|--------|-------|
| POST /api/auth/register | ✓ | | | | |
| POST /api/auth/login | ✓ | | | | |
| GET /api/auth/me | | ✓ | | | |
| GET /api/products | ✓ | | | | |
| POST /api/products | | ✓ | | ✓ | |
| PUT /api/products/:id | | ✓ | | ✓ | |
| DELETE /api/products/:id | | ✓ | | ✓ | |
| POST /api/orders | | ✓ | ✓ | | |
| GET /api/orders/consumer | | ✓ | ✓ | | |
| GET /api/orders/farmer | | ✓ | | ✓ | |
| GET /api/orders | | ✓ | | | ✓ |
| POST /api/categories | | ✓ | | | ✓ |
| PUT /api/categories/:id | | ✓ | | | ✓ |
| DELETE /api/categories/:id | | ✓ | | | ✓ |
| GET /api/users | | ✓ | | | ✓ |
| DELETE /api/users/:id | | ✓ | | | ✓ |
| POST /api/messages | | ✓ | ✓ | ✓ | ✓ |
| GET /api/messages | | ✓ | ✓ | ✓ | ✓ |

## Conclusion

The role-based authorization system is fully implemented and protects all sensitive routes according to the design specifications. The middleware functions provide clear separation of concerns and make it easy to protect routes based on user roles.

Key features:
- ✅ Middleware functions for each role (admin, farmer, consumer)
- ✅ Proper error codes (401 for authentication, 403 for authorization)
- ✅ All farmer-only routes protected
- ✅ All admin-only routes protected
- ✅ All consumer-only routes protected
- ✅ Comprehensive documentation and testing examples
