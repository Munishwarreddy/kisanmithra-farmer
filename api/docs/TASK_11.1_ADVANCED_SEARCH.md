# Task 11.1: Advanced Search Implementation

## Overview

This document describes the implementation of advanced search functionality for the KisanMithra platform, enabling users to search across products, farmers, and categories with autocomplete suggestions.

## Requirements Covered

- **Requirement 6.4**: Search across product names, descriptions, categories, and farmer names
- **Requirement 18.1**: Multi-field search functionality
- **Requirement 18.2**: Return both products and farmers in search results
- **Requirement 18.3**: Highlight matching terms in results
- **Requirement 18.5**: Autocomplete suggestions based on popular searches and available products

## Implementation Details

### 1. Database Indexes

#### Product Model (`api/models/ProductModel.js`)
- **Text Index**: `{ name: 'text', description: 'text' }`
- Enables full-text search across product names and descriptions
- Supports relevance scoring for better result ranking

#### User Model (`api/models/UserModel.js`)
- **Text Index**: `{ name: 'text' }`
- Enables full-text search for farmer names
- Filters by role='farmer' to only search farmers

### 2. Search Controller (`api/controllers/searchController.js`)

#### Advanced Search Endpoint
**Route**: `GET /api/search?q=<query>&limit=<number>`

**Features**:
- Multi-field search across:
  - Product names (text index)
  - Product descriptions (text index)
  - Category names (regex search)
  - Farmer names (text index)
- Relevance scoring using MongoDB's `$meta: "textScore"`
- Result deduplication
- Highlighting of matching terms using `<mark>` tags
- Returns both products and farmers in a single response

**Query Parameters**:
- `q` (required): Search query string
- `limit` (optional, default=20): Maximum number of results per entity type

**Response Format**:
```json
{
  "success": true,
  "query": "tomato",
  "results": {
    "products": [
      {
        "_id": "...",
        "name": "Organic Tomatoes",
        "nameHighlighted": "Organic <mark>Tomatoes</mark>",
        "description": "Fresh organic tomatoes",
        "descriptionHighlighted": "Fresh organic <mark>tomatoes</mark>",
        "price": 50,
        "farmer": { "name": "John Farmer" },
        "category": { "name": "Vegetables" },
        "type": "product"
      }
    ],
    "farmers": [
      {
        "_id": "...",
        "name": "Tom's Farm",
        "nameHighlighted": "<mark>Tom</mark>'s Farm",
        "email": "tom@farm.com",
        "type": "farmer"
      }
    ],
    "totalProducts": 5,
    "totalFarmers": 2,
    "total": 7
  }
}
```

#### Autocomplete Endpoint
**Route**: `GET /api/search/autocomplete?q=<query>&limit=<number>`

**Features**:
- Prefix-based matching using regex `^${query}`
- Searches across:
  - Product names
  - Category names
  - Farmer names
- Returns suggestions with type labels
- Deduplicates suggestions (case-insensitive)

**Query Parameters**:
- `q` (required, min 2 chars): Search prefix
- `limit` (optional, default=10): Maximum number of suggestions

**Response Format**:
```json
{
  "success": true,
  "query": "to",
  "suggestions": [
    { "text": "Tomatoes", "type": "product" },
    { "text": "Tom's Farm", "type": "farmer" },
    { "text": "Tomato Sauce", "type": "product" }
  ]
}
```

### 3. Search Routes (`api/routes/searchRoutes.js`)

```javascript
GET /api/search              - Advanced search
GET /api/search/autocomplete - Autocomplete suggestions
```

Both routes are public (no authentication required).

### 4. Server Integration (`api/server.js`)

Search routes are registered at `/api/search`:
```javascript
app.use('/api/search', searchRoutes);
```

## Search Algorithm

### Product Search Strategy
1. **Text Search**: Use MongoDB text index on name and description
2. **Category Search**: Find categories matching query, then find products in those categories
3. **Combine Results**: Merge and deduplicate products from both searches
4. **Score & Sort**: Sort by text relevance score
5. **Limit**: Apply result limit

### Farmer Search Strategy
1. **Text Search**: Use MongoDB text index on farmer names
2. **Filter**: Only include users with role='farmer' and isActive=true
3. **Score & Sort**: Sort by text relevance score
4. **Limit**: Apply result limit

### Highlighting Algorithm
```javascript
const highlightText = (text, query) => {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
```
- Case-insensitive matching
- Wraps matches in `<mark>` HTML tags
- Frontend can style `<mark>` tags for visual highlighting

## Performance Considerations

1. **Text Indexes**: MongoDB text indexes provide efficient full-text search
2. **Parallel Queries**: Product and farmer searches execute in parallel using `Promise.all()`
3. **Result Limiting**: Configurable limit prevents excessive data transfer
4. **Deduplication**: Map-based deduplication ensures unique results
5. **Lean Queries**: Autocomplete uses `.lean()` for faster queries

## Testing

### Manual Testing
Run the test script when MongoDB is available:
```bash
node test-search.js
```

### Test Coverage
The test script verifies:
- Text indexes exist on Product and User models
- Product search works across name and description
- Farmer search works by name
- Category-based product search works
- Autocomplete suggestions work
- Results are properly formatted and populated

### Verification Script
Run the verification script to check implementation:
```bash
node verify-search-implementation.js
```

## Usage Examples

### Basic Search
```bash
GET /api/search?q=tomato
```
Returns all products and farmers matching "tomato"

### Limited Search
```bash
GET /api/search?q=organic&limit=10
```
Returns up to 10 products and 10 farmers matching "organic"

### Autocomplete
```bash
GET /api/search/autocomplete?q=to
```
Returns suggestions starting with "to"

### Autocomplete with Limit
```bash
GET /api/search/autocomplete?q=org&limit=5
```
Returns up to 5 suggestions starting with "org"

## Frontend Integration

### Search Component Example
```javascript
const searchProducts = async (query) => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  if (data.success) {
    // Display products
    data.results.products.forEach(product => {
      // Use product.nameHighlighted for highlighted display
      // Or use product.name for plain display
    });
    
    // Display farmers
    data.results.farmers.forEach(farmer => {
      // Use farmer.nameHighlighted for highlighted display
    });
  }
};
```

### Autocomplete Component Example
```javascript
const getAutocomplete = async (query) => {
  if (query.length < 2) return [];
  
  const response = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  return data.success ? data.suggestions : [];
};

// Use with debouncing for better UX
const debouncedAutocomplete = debounce(getAutocomplete, 300);
```

## Error Handling

### Empty Query
```json
{
  "success": false,
  "message": "Search query is required"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Server error during search",
  "error": "Error details..."
}
```

## Future Enhancements

1. **Search History**: Track popular searches for better autocomplete
2. **Fuzzy Matching**: Handle typos and misspellings
3. **Filters**: Add price range, location, and category filters to search
4. **Pagination**: Implement cursor-based pagination for large result sets
5. **Search Analytics**: Track search queries and click-through rates
6. **Synonyms**: Support synonym matching (e.g., "veggies" → "vegetables")
7. **Geolocation**: Sort results by proximity to user location
8. **Faceted Search**: Show result counts by category, price range, etc.

## Related Files

- `api/controllers/searchController.js` - Search logic
- `api/routes/searchRoutes.js` - Search routes
- `api/models/ProductModel.js` - Product model with text indexes
- `api/models/UserModel.js` - User model with text index
- `api/test-search.js` - Test script
- `api/verify-search-implementation.js` - Verification script

## Conclusion

The advanced search implementation provides a robust, performant search experience that searches across multiple entity types and fields, with autocomplete support and result highlighting. The implementation follows MongoDB best practices and is ready for production use.
