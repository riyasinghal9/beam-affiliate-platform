# Beam Affiliate Platform - Store Integration Guide

## Overview

The Beam Affiliate Platform has been updated to redirect customers to the official Beam Wallet store (https://shop.beamwallet.com) instead of processing payments internally. This integration maintains full tracking capabilities while leveraging the official store's secure payment processing.

## Key Changes

### 1. Payment Page Redirection
- **Before**: Internal payment processing with Stripe/Beam Wallet
- **After**: Automatic redirection to official Beam Wallet store
- **URL**: `https://shop.beamwallet.com/pt/product/for-online-stores`

### 2. Tracking System
- All affiliate links now include tracking parameters
- Webhook system receives purchase confirmations from the store
- Full commission tracking and payment processing maintained

## How It Works

### 1. Affiliate Link Generation
When a reseller generates an affiliate link, it now includes:
- `affiliate_id`: Reseller's unique ID
- `product_id`: Product identifier
- `product_price`: Product price
- `utm_source`, `utm_medium`, `utm_campaign`: UTM tracking parameters
- `ref`: Platform identifier (`beam_affiliate_platform`)

**Example Link:**
```
https://your-domain.com/payment?v=99.99&id=RESELLER123&product=PRODUCT456&utm_source=affiliate&utm_medium=link&utm_campaign=beam_affiliate
```

### 2. Customer Journey
1. Customer clicks affiliate link
2. Redirected to payment page with 3-second countdown
3. Automatically redirected to Beam Wallet store with tracking parameters
4. Customer completes purchase on official store
5. Store sends webhook to affiliate platform
6. Commission is tracked and processed

### 3. Webhook Integration
The platform receives webhooks from the store at:
- **Endpoint**: `/api/store-webhooks/purchase`
- **Method**: POST
- **Purpose**: Track completed purchases

**Webhook Payload:**
```json
{
  "orderId": "ORDER_123456",
  "productId": "PRODUCT_456",
  "affiliateId": "RESELLER_789",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "amount": 99.99,
  "currency": "USD",
  "paymentMethod": "beam_wallet",
  "purchaseDate": "2024-01-15T10:30:00Z",
  "orderStatus": "completed",
  "trackingData": {
    "productName": "Beam Wallet for Online Stores",
    "commissionRate": 50,
    "customerPhone": "+1234567890",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "utmSource": "affiliate",
    "utmMedium": "link",
    "utmCampaign": "beam_affiliate"
  }
}
```

## API Endpoints

### Store Webhooks
- `POST /api/store-webhooks/purchase` - Handle purchase confirmations
- `POST /api/store-webhooks/order-status` - Handle order status updates
- `GET /api/store-webhooks/stats/:resellerId` - Get store purchase statistics

### Store Integration Service
- `generateTrackingUrl()` - Generate tracking URLs for store
- `simulateStorePurchase()` - Test webhook functionality
- `validatePurchaseData()` - Validate webhook payloads
- `getStoreAnalytics()` - Get store analytics data

## Configuration

### Environment Variables
```env
# Store Integration
STORE_BASE_URL=https://shop.beamwallet.com
WEBHOOK_URL=http://localhost:5001/api/store-webhooks
WEBHOOK_SECRET=your_webhook_secret_key
```

### Store Configuration
The official store needs to be configured to:
1. Accept tracking parameters from affiliate links
2. Send webhooks to the affiliate platform
3. Include tracking data in purchase confirmations

## Testing

### Manual Testing
1. Generate an affiliate link from the Products page
2. Click the link to verify redirection
3. Check that tracking parameters are included in store URL

### Automated Testing
Run the test script:
```bash
cd backend
node test_store_integration.js
```

### Webhook Testing
Use the simulation endpoint to test webhook processing:
```bash
curl -X POST http://localhost:5001/api/store-webhooks/purchase \
  -H "Content-Type: application/json" \
  -H "X-Beam-Signature: test-signature" \
  -d '{
    "orderId": "test_123",
    "productId": "product_456",
    "affiliateId": "reseller_789",
    "customerEmail": "test@example.com",
    "customerName": "Test Customer",
    "amount": 99.99,
    "currency": "USD",
    "paymentMethod": "beam_wallet",
    "orderStatus": "completed"
  }'
```

## Benefits

### For Customers
- Secure payment processing on official store
- Familiar checkout experience
- Trusted payment methods
- Official support channels

### For Resellers
- No change to affiliate link generation
- Full commission tracking maintained
- Real-time purchase notifications
- Detailed analytics and reporting

### For Platform
- Reduced payment processing complexity
- Leverages official store infrastructure
- Maintains tracking capabilities
- Scalable solution

## Migration Notes

### Existing Affiliate Links
- All existing affiliate links continue to work
- Links now redirect to store instead of internal payment page
- No changes needed for resellers

### Database Changes
- New `storeWebhookController.js` for handling store purchases
- Enhanced tracking with store-specific metadata
- Webhook endpoints for real-time updates

### UI Updates
- Payment page converted to redirect page
- Products page updated with store integration notice
- Button text changed from "Get Affiliate Link" to "Get Store Link"

## Security Considerations

### Webhook Security
- Implement signature verification for production
- Use HTTPS for all webhook communications
- Validate all incoming webhook data
- Rate limiting on webhook endpoints

### Data Privacy
- Customer data is handled by official store
- Affiliate platform only receives necessary tracking data
- GDPR compliance maintained through store integration

## Monitoring

### Key Metrics
- Webhook success rate
- Store redirect success rate
- Commission tracking accuracy
- Customer conversion rates

### Alerts
- Failed webhook deliveries
- Store integration errors
- Commission calculation discrepancies
- High error rates

## Support

For issues related to store integration:
1. Check webhook logs in backend
2. Verify store configuration
3. Test webhook endpoints
4. Review tracking parameters

## Future Enhancements

### Planned Features
- Real-time store inventory sync
- Dynamic pricing updates
- Advanced analytics integration
- Multi-store support
- A/B testing for store pages

### API Improvements
- GraphQL integration
- Webhook retry mechanisms
- Enhanced error handling
- Performance optimizations
