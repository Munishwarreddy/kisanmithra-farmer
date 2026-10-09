# 🚀 AI Features Quick Setup Guide

## What You Get

Your farmer-consumer platform now has 5 powerful AI features:

1. **🌐 Auto Language Translation** - Telugu/Hindi ↔ English
2. **😊 Sentiment Detection** - Detect buyer mood (😊😐⚠️🔴)
3. **💬 Smart Reply Suggestions** - AI-generated responses for farmers
4. **📋 Deal Summary Generator** - Extract transaction details automatically
5. **💰 Price Prediction System** - Market trends and recommendations

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd api
npm install
```

This installs:
- `openai` - For AI features
- `@google-cloud/translate` - For translation (optional)
- `redis` - For caching (optional)

### Step 2: Your API Key is Already Configured! ✅
Your OpenAI API key is already in `api/.env`:
```
OPENAI_API_KEY=[REDACTED_OPENAI_API_KEY]
```

### Step 3: Start the Server
```bash
npm run dev
```

That's it! All AI features are now active. 🎉

## Optional: Install Redis for Caching

Redis improves performance and reduces API costs by caching AI responses.

**Windows:**
```bash
# Option 1: Download installer
# https://github.com/microsoftarchive/redis/releases

# Option 2: Use Docker
docker run -d -p 6379:6379 redis
```

**Note:** The app works fine without Redis - it just won't cache AI responses.

## Test the Features

Run the test suite:
```bash
node test-ai-features.js
```

This will test all 5 AI features end-to-end.

## How to Use Each Feature

### 1. Auto Language Translation

**Set user language:**
```javascript
PUT /api/users/preferences
Authorization: Bearer <token>

{
  "language": "te"  // en, te, or hi
}
```

**Send message (auto-translates):**
```javascript
POST /api/messages
Authorization: Bearer <token>

{
  "recipient": "farmerId",
  "content": "నమస్కారం, టమోటాలు ఎంత?"
}
```

The farmer will see it in their preferred language!

### 2. Sentiment Detection

Automatic! When a buyer messages a farmer:
- Message is analyzed for sentiment
- Farmer sees emoji indicator (😊😐⚠️🔴)
- Helps farmer respond appropriately

### 3. Smart Reply Suggestions

**Get suggestions:**
```javascript
POST /api/ai/smart-replies
Authorization: Bearer <token>

{
  "messageId": "messageId",
  "productId": "productId"  // optional
}
```

**Response:**
```json
[
  {
    "text": "Yes, for 100kg I can offer ₹20 per kg",
    "category": "pricing"
  },
  {
    "text": "Let me check availability and get back to you",
    "category": "general"
  }
]
```

### 4. Deal Summary Generator

**Generate summary:**
```javascript
POST /api/ai/deal-summary
Authorization: Bearer <token>

{
  "conversationId": "conversationId"
}
```

**Response:**
```json
{
  "title": "📋 Deal Summary",
  "fields": [
    { "label": "📦 Product", "value": "Tomatoes" },
    { "label": "📊 Quantity", "value": "100kg" },
    { "label": "💰 Agreed Price", "value": "₹20/kg" },
    { "label": "📅 Delivery Date", "value": "18 Feb" }
  ]
}
```

### 5. Price Prediction

**Get prediction:**
```javascript
POST /api/ai/price-prediction
Authorization: Bearer <token>

{
  "productName": "Tomato",
  "region": "Hyderabad"
}
```

**Response:**
```json
{
  "marketAverage": 22,
  "predictedTrend": {
    "direction": "up",
    "percentage": 5.2,
    "nextWeekPrice": 25
  },
  "demandLevel": "high",
  "recommendedPrice": {
    "min": 23,
    "max": 24
  }
}
```

## Architecture

```
Buyer sends message
    ↓
Auto-translate to farmer's language
    ↓
Store message with translations
    ↓
[Asynchronously - doesn't block]
    ├─→ Analyze sentiment (😊😐⚠️🔴)
    ├─→ Generate smart replies
    └─→ Emit via Socket.IO to farmer
```

## Features That Work Automatically

These features activate automatically when users send messages:

✅ **Language Translation** - Every message
✅ **Sentiment Analysis** - Buyer → Farmer messages
✅ **Smart Replies** - Buyer → Farmer messages

These features require API calls:

📞 **Deal Summary** - Call `/api/ai/deal-summary`
📞 **Price Prediction** - Call `/api/ai/price-prediction`

## Performance & Cost

### Caching Strategy
- **Translations**: 24 hours
- **Sentiment**: 1 hour
- **Smart Replies**: 1 hour
- **Price Predictions**: 24 hours

### API Usage
With caching, typical usage:
- 100 messages/day ≈ 20-30 API calls (80% cache hit rate)
- Cost: ~$0.50-1.00/day with OpenAI

### Without Redis
- Every request hits OpenAI API
- Cost: ~$2-5/day with OpenAI

## Monitoring

**Check AI health:**
```bash
GET /api/ai/health
```

**View logs:**
```bash
tail -f api/logs/ai-services.log
```

## Troubleshooting

### "Circuit breaker is OPEN"
- AI service failed multiple times
- System using fallback responses
- Wait 1 minute for auto-recovery
- Check logs for errors

### "Translation failed"
- Shows original message
- Check API key is valid
- Check internet connection

### "No smart replies generated"
- Using fallback generic replies
- Check OpenAI API key
- Check API quota

## What's Next?

All backend features are complete! To finish the user experience:

1. **Frontend UI** - Add language selector, sentiment indicators, smart reply buttons
2. **Socket.IO Integration** - Listen for real-time AI events
3. **Deal Summary UI** - Display deal cards in chat
4. **Price Prediction UI** - Show predictions in product listing form

The APIs are ready - just connect your frontend!

## Support

- Check logs: `api/logs/ai-services.log`
- Test features: `node test-ai-features.js`
- API health: `GET /api/ai/health`

## Summary

✅ All 5 AI features implemented
✅ OpenAI API key configured
✅ Auto-translation working
✅ Sentiment analysis active
✅ Smart replies generating
✅ Deal summaries extracting
✅ Price predictions calculating

Your platform is now AI-powered! 🚀
