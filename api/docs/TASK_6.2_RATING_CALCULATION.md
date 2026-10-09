# Task 6.2: Rating Calculation and Aggregation Implementation

## Overview

This document describes the implementation of rating calculation and aggregation for products and farmers in the KisanMithra e-commerce platform.

## Requirements

**Requirement 10.5**: Calculate average ratings for products and farmers, update rating fields on new reviews.

## Implementation Details

### Location

The rating calculation logic is implemented in `api/controllers/reviewController.js`.

### Core Functions

#### 1. `updateProductRating(productId)`

**Purpose**: Calculate and update the average rating for a product based on all its reviews.

**Algorithm**:
1. Fetch all reviews for the given product
2. If no reviews exist:
   - Set product rating to 0
   - Set totalReviews to 0
3. If reviews exist:
   - Calculate sum of all review ratings
   - Calculate average: `totalRating / numberOfReviews`
   - Round to 1 decimal place: `Math.round(average * 10) / 10`
   - Update product with new rating and review count

**Code**:
```javascript
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });

    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        totalReviews: 0,
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Update product rating error:", error);
  }
}
```

#### 2. `updateFarmerRating(farmerId)`

**Purpose**: Calculate and update the average rating for a farmer based on all reviews of their products.

**Algorithm**:
1. Fetch all reviews for products owned by the farmer
2. If no reviews exist:
   - Set farmer rating to 0
   - Set totalReviews to 0
3. If reviews exist:
   - Calculate sum of all review ratings
   - Calculate average: `totalRating / numberOfReviews`
   - Round to 1 decimal place: `Math.round(average * 10) / 10`
   - Update farmer profile with new rating and review count

**Code**:
```javascript
async function updateFarmerRating(farmerId) {
  try {
    const reviews = await Review.find({ farmer: farmerId });

    if (reviews.length === 0) {
      await FarmerProfile.findOneAndUpdate(
        { user: farmerId },
        {
          rating: 0,
          totalReviews: 0,
        }
      );
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await FarmerProfile.findOneAndUpdate(
      { user: farmerId },
      {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length,
      }
    );
  } catch (error) {
    console.error("Update farmer rating error:", error);
  }
}
```

### Integration Points

The rating calculation functions are automatically called in the following scenarios:

#### 1. New Review Submission

When a consumer submits a review (`submitProductReview`):
```javascript
// Create review
const review = await Review.create({
  consumer: consumerId,
  product: productId,
  farmer: product.farmer,
  order: order._id,
  rating,
  comment,
  images: images || [],
  isVerified: true,
});

// Update product rating and review count
await updateProductRating(productId);

// Update farmer rating and review count
await updateFarmerRating(product.farmer);
```

#### 2. Review Deletion

When an admin deletes a review (`deleteReview`):
```javascript
// Store product and farmer IDs before deletion
const productId = review.product;
const farmerId = review.farmer;

// Delete the review
await Review.findByIdAndDelete(reviewId);

// Update product rating and review count
await updateProductRating(productId);

// Update farmer rating and review count
await updateFarmerRating(farmerId);
```

## Rating Calculation Properties

### Property 27: Average Rating Calculation

**Validates: Requirements 10.5**

*For any* product or farmer with multiple reviews, the displayed average rating should equal the sum of all review ratings divided by the number of reviews, rounded to one decimal place.

**Implementation**:
- ✅ Calculates sum of all ratings
- ✅ Divides by number of reviews
- ✅ Rounds to 1 decimal place using `Math.round(average * 10) / 10`
- ✅ Updates both product and farmer ratings
- ✅ Handles edge case of zero reviews (sets rating to 0)

## Test Coverage

A comprehensive test suite has been created in `api/test-rating-calculation.js` that verifies:

### Test Cases

1. **Initial Rating**: Verifies new products start with rating 0 and totalReviews 0
2. **Single Review**: Verifies rating equals the single review's rating
3. **Multiple Reviews**: Verifies average calculation with multiple reviews
4. **Farmer Rating**: Verifies farmer rating aggregates all product reviews
5. **Rating After Deletion**: Verifies rating recalculates when a review is deleted
6. **Farmer Rating After Deletion**: Verifies farmer rating updates after deletion
7. **All Reviews Deleted**: Verifies rating resets to 0 when all reviews are deleted
8. **Rounding Precision**: Verifies ratings are rounded to exactly 1 decimal place

### Example Test Scenarios

#### Scenario 1: Multiple Reviews
- Reviews: 5, 4, 3, 5
- Sum: 17
- Average: 17 / 4 = 4.25
- Rounded: 4.3 (to 1 decimal place)
- ✅ Expected: rating = 4.3, totalReviews = 4

#### Scenario 2: After Deletion
- Original reviews: 5, 4, 3, 5
- Delete first review (5)
- Remaining: 4, 3, 5
- Sum: 12
- Average: 12 / 3 = 4.0
- ✅ Expected: rating = 4.0, totalReviews = 3

#### Scenario 3: Rounding Precision
- Reviews: 3, 4, 5, 5, 5
- Sum: 22
- Average: 22 / 5 = 4.4
- Rounded: 4.4 (already 1 decimal)
- ✅ Expected: rating = 4.4, totalReviews = 5

## Data Models

### Product Model Fields
```javascript
{
  rating: Number,        // Average rating (0-5, 1 decimal place)
  totalReviews: Number,  // Count of reviews
  // ... other fields
}
```

### FarmerProfile Model Fields
```javascript
{
  rating: Number,        // Average rating (0-5, 1 decimal place)
  totalReviews: Number,  // Count of reviews
  // ... other fields
}
```

### Review Model Fields
```javascript
{
  consumer: ObjectId,    // ref: User
  product: ObjectId,     // ref: Product
  farmer: ObjectId,      // ref: User
  rating: Number,        // 1-5 stars
  comment: String,       // Optional review text
  // ... other fields
}
```

## API Endpoints

### Submit Review
```
POST /api/products/:id/reviews
```
- Validates rating (1-5)
- Verifies purchase
- Creates review
- **Automatically updates product and farmer ratings**

### Delete Review
```
DELETE /api/admin/reviews/:id
```
- Admin only
- Deletes review
- **Automatically recalculates product and farmer ratings**

### Get Product Reviews
```
GET /api/products/:id/reviews
```
- Returns all reviews for a product
- Product rating is already calculated and stored

### Get Farmer Reviews
```
GET /api/farmers/:id/reviews
```
- Returns all reviews for a farmer's products
- Farmer rating is already calculated and stored

## Edge Cases Handled

1. **No Reviews**: Rating set to 0, totalReviews set to 0
2. **Single Review**: Rating equals the review's rating
3. **Review Deletion**: Rating recalculated from remaining reviews
4. **All Reviews Deleted**: Rating reset to 0
5. **Rounding**: Always rounds to exactly 1 decimal place
6. **Error Handling**: Errors logged but don't crash the application

## Performance Considerations

### Current Implementation
- Recalculates rating on every review submission/deletion
- Fetches all reviews for calculation
- Simple and reliable approach

### Optimization Opportunities (Future)
If performance becomes an issue with large numbers of reviews:
1. **Incremental Updates**: Update rating incrementally instead of recalculating
2. **Caching**: Cache rating calculations
3. **Background Jobs**: Move rating updates to background queue
4. **Aggregation Pipeline**: Use MongoDB aggregation for calculation

## Validation

### Rating Validation
- Rating must be between 1 and 5 (inclusive)
- Validated in `submitProductReview` controller
- Returns 400 error if invalid

### Authorization
- Only consumers who purchased the product can review
- Only one review per consumer per product
- Only admins can delete reviews

## Compliance with Design Document

### Property 27 Compliance
✅ **Average Rating Calculation**: Implemented correctly
- Sum of all ratings divided by count
- Rounded to 1 decimal place
- Applied to both products and farmers
- Updated on review creation and deletion

### Requirement 10.5 Compliance
✅ **Calculate average ratings for products and farmers**
- Product rating calculated from product reviews
- Farmer rating calculated from all reviews of farmer's products

✅ **Update rating fields on new reviews**
- Ratings updated immediately after review submission
- Ratings updated immediately after review deletion

## Testing Instructions

### Prerequisites
1. MongoDB must be running on localhost:27017
2. API server must be running on localhost:5000

### Run Tests
```bash
cd api
node test-rating-calculation.js
```

### Expected Output
```
╔════════════════════════════════════════════════════╗
║   Task 6.2: Rating Calculation Test Suite         ║
║   Testing average rating calculation and          ║
║   aggregation for products and farmers            ║
╚════════════════════════════════════════════════════╝

=== Setting Up Test Data ===
✓ Farmer registered
✓ Product created
✓ Admin registered

=== Test 1: Verify Initial Rating ===
✓ Initial rating is 0 and totalReviews is 0

=== Test 2: Single Review Rating Calculation ===
✓ Rating correctly calculated: 5.0 with 1 review

=== Test 3: Multiple Reviews Average Rating Calculation ===
✓ Average rating correctly calculated: 4.3 with 4 reviews

=== Test 4: Farmer Rating Calculation ===
✓ Farmer rating correctly calculated: 4.3 with 4 reviews

=== Test 5: Rating Recalculation After Review Deletion ===
✓ Review deleted
✓ Rating correctly recalculated after deletion: 4.0 with 3 reviews

=== Test 6: Farmer Rating After Review Deletion ===
✓ Farmer rating correctly recalculated: 4.0 with 3 reviews

=== Test 7: Rating After All Reviews Deleted ===
✓ All reviews deleted
✓ Rating correctly reset to 0 after all reviews deleted

=== Test 8: Rating Rounding Precision ===
✓ Rating correctly rounded to 1 decimal place: 4.4

╔════════════════════════════════════════════════════╗
║                  Test Summary                      ║
╚════════════════════════════════════════════════════╝
Total Tests: 8
Passed: 8
Failed: 0

🎉 All rating calculation tests passed!

✅ Task 6.2 Implementation Verified:
   • Average ratings calculated correctly for products
   • Average ratings calculated correctly for farmers
   • Ratings updated on new review submission
   • Ratings recalculated on review deletion
   • Ratings rounded to 1 decimal place
   • Edge cases handled (no reviews, all deleted)
```

## Conclusion

The rating calculation and aggregation functionality is **fully implemented and working correctly**. The implementation:

1. ✅ Calculates average ratings for products
2. ✅ Calculates average ratings for farmers
3. ✅ Updates ratings on new review submission
4. ✅ Recalculates ratings on review deletion
5. ✅ Rounds ratings to 1 decimal place
6. ✅ Handles edge cases (no reviews, all deleted)
7. ✅ Complies with Requirement 10.5
8. ✅ Implements Property 27 from the design document

**Task 6.2 Status**: ✅ **COMPLETE**
