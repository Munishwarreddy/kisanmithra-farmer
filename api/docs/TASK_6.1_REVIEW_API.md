# Task 6.1: Review API Endpoints Implementation

## Overview
This document describes the implementation of the review API endpoints for the KisanMithra platform, allowing consumers to submit reviews for products they have purchased and enabling public access to view reviews.

## Implementation Date
January 2025

## Requirements Addressed
- Requirement 10.1: Allow consumers to submit reviews for received orders
- Requirement 10.2: Require rating (1-5 stars) and allow optional written feedback
- Requirement 10.3: Associate reviews with products and farmers
- Requirement 10.4: Display all reviews on product and farmer profiles
- Requirement 10.5: Calculate and display average ratings
- Requirement 10.6: Show rating, review text, consumer name, and date
- Requirement 10.7: Display all reviews received by farmers
- Requirement 10.8: Allow administrators to moderate/remove reviews

## Files Created/Modified

### 1. Review Controller (`api/controllers/reviewController.js`)
Created a new controller with the following endpoints:

#### `submitProductReview()`
- **Route**: `POST /api/products/:id/reviews`
- **Access**: Private (Consumer only)
- **Functionality**:
  - Validates rating (1-5 required)
  - Verifies product exists
  - Checks consumer has purchased and received the product (delivered order)
  - Prevents duplicate reviews (one review per consumer per product)
  - Creates review with consumer, product, farmer, and order associations
  - Updates product and farmer ratings automatically
  - Returns created review with populated consumer details

#### `getProductReviews()`
- **Route**: `GET /api/products/:id/reviews`
- **Access**: Public
- **Functionality**:
  - Retrieves all reviews for a specific product
  - Populates consumer details (name, photo)
  - Sorts by creation date (newest first)
  - Returns review count and data

#### `getFarmerReviews()`
- **Route**: `GET /api/farmers/:id/reviews`
- **Access**: Public
- **Functionality**:
  - Retrieves all reviews for a specific farmer
  - Populates consumer details (name, photo)
  - Populates product details (name, images)
  - Sorts by creation date (newest first)
  - Returns review count and data

#### `deleteReview()`
- **Route**: `DELETE /api/admin/reviews/:id`
- **Access**: Private (Admin only)
- **Functionality**:
  - Finds and deletes the specified review
  - Updates product and farmer ratings after deletion
  - Returns success message

#### Helper Functions

##### `updateProductRating(productId)`
- Calculates average rating from all product reviews
- Updates Product model with new rating and review count
- Rounds rating to 1 decimal place
- Sets rating to 0 if no reviews exist

##### `updateFarmerRating(farmerId)`
- Calculates average rating from all farmer reviews
- Updates FarmerProfile model with new rating and review count
- Rounds rating to 1 decimal place
- Sets rating to 0 if no reviews exist

### 2. Review Routes (`api/routes/reviewRoutes.js`)
Created a new routes file with the following endpoints:

```javascript
// Product review routes
POST   /api/products/:id/reviews      - Submit review (Consumer only)
GET    /api/products/:id/reviews      - Get product reviews (Public)

// Farmer review routes
GET    /api/farmers/:id/reviews       - Get farmer reviews (Public)

// Admin routes
DELETE /api/admin/reviews/:id         - Delete review (Admin only)
```

### 3. Server Configuration (`api/server.js`)
Updated to register the review routes:
- Imported `reviewRoutes`
- Registered routes with `app.use('/api', reviewRoutes)`

## Authorization & Security

### Consumer Authorization
- `submitProductReview()` requires:
  - Valid JWT token (`verifyToken` middleware)
  - Consumer role (`isConsumer` middleware)
  - Verified purchase (delivered order containing the product)

### Admin Authorization
- `deleteReview()` requires:
  - Valid JWT token (`verifyToken` middleware)
  - Admin role (`isAdmin` middleware)

### Public Access
- `getProductReviews()` and `getFarmerReviews()` are publicly accessible
- No authentication required for viewing reviews

## Validation Rules

### Review Submission
1. **Rating**: Required, must be between 1 and 5
2. **Comment**: Optional text field
3. **Images**: Optional array of image URLs
4. **Purchase Verification**: Consumer must have a delivered order containing the product
5. **Duplicate Prevention**: One review per consumer per product (enforced by unique index)

### Error Responses
- `400`: Invalid rating, duplicate review, or validation errors
- `403`: Unauthorized (no purchase or wrong role)
- `404`: Product, farmer, or review not found
- `500`: Server errors

## Database Integration

### Review Model
The implementation uses the existing `ReviewModel` with the following schema:
- `consumer`: Reference to User (required)
- `product`: Reference to Product (required)
- `farmer`: Reference to User (required)
- `order`: Reference to Order (required)
- `rating`: Number (1-5, required)
- `comment`: String (optional)
- `images`: Array of strings (optional)
- `isVerified`: Boolean (default: true)
- `farmerResponse`: Object with comment and respondedAt
- `timestamps`: createdAt, updatedAt

### Indexes
- Unique compound index on `consumer` and `product`
- Indexes on `product`, `farmer`, `consumer`, `rating`, `createdAt`

## Rating Calculation

### Algorithm
1. Fetch all reviews for the entity (product or farmer)
2. Sum all rating values
3. Divide by number of reviews
4. Round to 1 decimal place
5. Update entity's rating and totalReviews fields

### Automatic Updates
Ratings are automatically recalculated when:
- A new review is submitted
- A review is deleted by an admin

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "_id": "review_id",
    "consumer": {
      "_id": "consumer_id",
      "name": "Consumer Name",
      "photo": "photo_url"
    },
    "product": "product_id",
    "farmer": "farmer_id",
    "order": "order_id",
    "rating": 5,
    "comment": "Excellent product!",
    "images": ["image_url"],
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Testing

### Test File
Created `api/test-review.js` with comprehensive test suite covering:

1. **Setup**: Create test users (consumer, farmer, admin)
2. **Product Creation**: Create test product
3. **Order Creation**: Create delivered order
4. **Review Submission**: Submit valid review
5. **Duplicate Prevention**: Verify duplicate reviews are rejected
6. **Get Product Reviews**: Retrieve all product reviews
7. **Get Farmer Reviews**: Retrieve all farmer reviews
8. **Purchase Verification**: Verify reviews without purchase are rejected
9. **Rating Validation**: Verify invalid ratings are rejected
10. **Admin Deletion**: Delete review as admin
11. **Deletion Verification**: Verify review is deleted

### Test Execution
```bash
# Start the server
npm run dev

# In another terminal, run tests
node test-review.js
```

## Integration with Existing System

### Product Model
- Reviews update `rating` and `totalReviews` fields
- Ratings displayed on product cards and detail pages

### Farmer Profile Model
- Reviews update `rating` and `totalReviews` fields
- Ratings displayed on farmer profiles

### Order Model
- Used to verify purchase before allowing reviews
- Only delivered orders qualify for reviews

### Notification System (Future Enhancement)
- Can be extended to notify farmers of new reviews
- Can notify consumers when farmers respond to reviews

## Future Enhancements

1. **Farmer Responses**: Allow farmers to respond to reviews
2. **Review Moderation**: Add approval workflow for reviews
3. **Helpful Votes**: Allow users to mark reviews as helpful
4. **Review Filtering**: Filter reviews by rating, date, verified purchase
5. **Review Images**: Support image uploads with reviews
6. **Review Editing**: Allow consumers to edit their reviews within a time window
7. **Review Reports**: Allow users to report inappropriate reviews

## Compliance with Design Document

### Property 24: Review Submission Authorization
✅ Implemented: Consumers can only review products from delivered orders

### Property 25: Review Rating Requirement
✅ Implemented: Rating validation (1-5) with appropriate error messages

### Property 26: Review Association
✅ Implemented: Reviews associated with correct product and farmer IDs

### Property 27: Average Rating Calculation
✅ Implemented: Average rating calculated and rounded to 1 decimal place

### Property 28: Review Display Completeness
✅ Implemented: All required fields displayed (rating, text, consumer, date)

### Property 29: Admin Review Moderation
✅ Implemented: Admins can delete reviews

## Conclusion

The review API endpoints have been successfully implemented with:
- ✅ All 4 required endpoints created
- ✅ Proper authorization and role-based access control
- ✅ Purchase verification before allowing reviews
- ✅ Automatic rating calculation and updates
- ✅ Duplicate review prevention
- ✅ Comprehensive error handling
- ✅ Public access to view reviews
- ✅ Admin moderation capabilities

The implementation follows the design document specifications and integrates seamlessly with the existing KisanMithra platform architecture.
