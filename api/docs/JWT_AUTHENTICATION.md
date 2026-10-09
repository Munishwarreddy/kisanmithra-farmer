# JWT Authentication Implementation

## Overview

This document describes the JWT (JSON Web Token) authentication implementation for the KisanMithra e-commerce platform. The implementation provides secure token-based authentication with proper expiration handling and role-based authorization.

## Features

### 1. Token Generation
- **Location**: `api/controllers/authController.js` - `generateToken(id, role)`
- **Purpose**: Generates JWT tokens upon successful login or registration
- **Token Payload**:
  - `id`: User's MongoDB ObjectId
  - `role`: User's role (consumer, farmer, admin)
  - `iat`: Issued at timestamp
- **Expiration**: Configurable via `JWT_EXPIRE` environment variable (default: 90 days)

### 2. Token Verification
- **Location**: `api/utils/authMiddleware.js` - `verifyToken` middleware
- **Purpose**: Validates JWT tokens on protected routes
- **Features**:
  - Extracts token from Authorization header (Bearer token)
  - Verifies token signature and expiration
  - Loads user data from database
  - Checks if user account is active
  - Handles specific JWT errors (expired, invalid, not before)

### 3. Token Expiration Handling
- **Automatic Expiration**: Tokens expire after the configured duration
- **Error Codes**:
  - `TOKEN_EXPIRED`: Token has expired
  - `INVALID_TOKEN`: Token signature is invalid
  - `TOKEN_NOT_ACTIVE`: Token is not yet valid (nbf claim)

### 4. Enhanced Security Features
- **Active Account Check**: Verifies user account is active before granting access
- **Configuration Validation**: Ensures JWT_SECRET is properly configured
- **Detailed Error Messages**: Provides specific error codes for different failure scenarios
- **Role-Based Tokens**: Includes user role in token payload for authorization

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
```
**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "consumer",
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "pincode": "12345"
  }
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer",
    "phone": "1234567890",
    "address": { ... }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login User
```
POST /api/auth/login
```
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer",
    "phone": "1234567890",
    "address": { ... }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer",
    "phone": "1234567890",
    "address": { ... }
  }
}
```

#### 4. Refresh Token
```
POST /api/auth/refresh-token
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer"
  }
}
```

#### 5. Verify Token
```
POST /api/auth/verify-token
```

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Valid Token)**:
```json
{
  "success": true,
  "valid": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "consumer"
  },
  "expiresAt": "2026-05-10T10:41:59.000Z"
}
```

**Response (Expired Token)**:
```json
{
  "success": false,
  "valid": false,
  "message": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```

## Error Handling

### Token Verification Errors

#### 1. Token Expired
```json
{
  "success": false,
  "message": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```
**HTTP Status**: 401 Unauthorized

#### 2. Invalid Token
```json
{
  "success": false,
  "message": "Invalid token",
  "code": "INVALID_TOKEN"
}
```
**HTTP Status**: 401 Unauthorized

#### 3. Token Not Active
```json
{
  "success": false,
  "message": "Token not yet valid",
  "code": "TOKEN_NOT_ACTIVE"
}
```
**HTTP Status**: 401 Unauthorized

#### 4. No Token Provided
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```
**HTTP Status**: 401 Unauthorized

#### 5. User Not Found
```json
{
  "success": false,
  "message": "User not found or token invalid"
}
```
**HTTP Status**: 401 Unauthorized

#### 6. Account Deactivated
```json
{
  "success": false,
  "message": "User account is deactivated"
}
```
**HTTP Status**: 401 Unauthorized

## Usage Examples

### Frontend Integration

#### 1. Login and Store Token
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage or secure storage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};
```

#### 2. Make Authenticated Requests
```javascript
const fetchProtectedData = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/protected-endpoint', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  return response.json();
};
```

#### 3. Handle Token Expiration
```javascript
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  // Handle token expiration
  if (data.code === 'TOKEN_EXPIRED') {
    // Redirect to login or refresh token
    window.location.href = '/login';
  }
  
  return data;
};
```

#### 4. Refresh Token Before Expiration
```javascript
const refreshToken = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
  }
  
  return data;
};

// Refresh token every 80 days (before 90-day expiration)
setInterval(refreshToken, 80 * 24 * 60 * 60 * 1000);
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
JWT_SECRET=your_secure_secret_key_here_change_in_production
JWT_EXPIRE=90d
```

**Important**: 
- Use a strong, random secret key in production
- Never commit the `.env` file to version control
- Rotate the secret key periodically for enhanced security

### Recommended JWT_EXPIRE Values
- Development: `90d` (90 days)
- Production: `7d` to `30d` (7 to 30 days)
- High-security applications: `1h` to `24h` (1 to 24 hours)

## Security Best Practices

1. **Strong Secret Key**: Use a cryptographically secure random string for JWT_SECRET
2. **HTTPS Only**: Always use HTTPS in production to prevent token interception
3. **Token Storage**: Store tokens securely (HttpOnly cookies or secure storage)
4. **Token Expiration**: Use reasonable expiration times based on security requirements
5. **Refresh Tokens**: Implement token refresh to avoid frequent re-authentication
6. **Account Status**: Always verify user account is active before granting access
7. **Role Validation**: Include and validate user roles in tokens for authorization
8. **Error Handling**: Provide specific error codes without exposing sensitive information

## Testing

Run the test scripts to verify the implementation:

```bash
# Test JWT token generation and verification
node test-jwt.js

# Test authentication integration
node test-auth-integration.js
```

## Requirements Validation

This implementation satisfies the following requirements:

- **Requirement 20.2**: "WHEN a user logs in, THE System SHALL verify credentials securely and issue a session token"
  - ✓ Implemented in `login` endpoint with secure password verification and JWT token issuance

- **Requirement 20.5**: "WHEN a user accesses their account, THE System SHALL require authentication and validate the session token"
  - ✓ Implemented in `verifyToken` middleware with comprehensive token validation

## Future Enhancements

1. **Refresh Token Rotation**: Implement refresh token rotation for enhanced security
2. **Token Blacklisting**: Add token blacklist for logout functionality
3. **Multi-Device Support**: Track active sessions per user
4. **Rate Limiting**: Add rate limiting to authentication endpoints
5. **Two-Factor Authentication**: Implement 2FA for additional security
6. **Audit Logging**: Log all authentication attempts and token usage
