# Rate Limiting Configuration

## Overview

The One Event API implements comprehensive rate limiting to prevent abuse and ensure fair usage. Rate limiting is applied globally and can be customized per endpoint.

## Global Rate Limits

### Default Throttling Tiers

1. **Short-term (1 second)**: 3 requests per second
2. **Medium-term (10 seconds)**: 20 requests per 10 seconds  
3. **Long-term (1 minute)**: 100 requests per minute

### Rate Limit Headers

All responses include rate limiting headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640123456
```

## Endpoint-Specific Rate Limits

### Authentication Endpoints

#### Registration (`POST /auth/register`)
- **Limit**: 3 requests per 5 minutes
- **Reason**: Prevent spam account creation
- **Response**: 429 Too Many Requests

#### Login (`POST /auth/login`)
- **Limit**: 5 requests per 5 minutes
- **Reason**: Prevent brute force attacks
- **Response**: 429 Too Many Requests

### General API Endpoints

#### Standard Endpoints
- **Limit**: 100 requests per minute
- **Applied to**: Most GET, POST, PATCH, DELETE operations

#### Admin Endpoints
- **Limit**: 200 requests per minute
- **Applied to**: Admin-only operations

## Rate Limit Response

When rate limit is exceeded, the API returns:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## Rate Limiting Strategy

### IP-Based Tracking
- Rate limits are tracked per IP address
- Uses in-memory storage for development
- Redis recommended for production clustering

### User-Based Tracking (Future)
- Authenticated users can have higher limits
- Premium users may have elevated limits
- Role-based rate limiting (admin vs user)

## Configuration

### Environment Variables

```env
# Rate limiting configuration
THROTTLE_TTL=60000          # Time window in milliseconds
THROTTLE_LIMIT=100          # Requests per time window
THROTTLE_SKIP_IF=           # Skip rate limiting condition
```

### Custom Rate Limits

Developers can apply custom rate limits using decorators:

```typescript
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Get('limited-endpoint')
async limitedEndpoint() {
  // This endpoint allows 10 requests per minute
}
```

## Rate Limit Bypass

### Health Checks
- Health endpoints (`/health`) are exempt from rate limiting
- Essential for monitoring and load balancers

### Internal Services
- Service-to-service communication can bypass rate limits
- Use special headers or IP whitelisting

## Production Considerations

### Redis Integration

For production deployments with multiple instances:

```typescript
ThrottlerModule.forRoot({
  storage: new ThrottlerStorageRedisService(redisClient),
  throttlers: [
    {
      name: 'short',
      ttl: 1000,
      limit: 3,
    },
    // ... other limits
  ],
});
```

### Load Balancer Configuration

When using load balancers, ensure:
- Real IP forwarding is enabled
- `X-Forwarded-For` headers are properly set
- Rate limiting occurs at application level, not just proxy

### Monitoring

Track rate limiting metrics:
- Rate limit violations per endpoint
- Top rate-limited IPs
- Rate limit effectiveness

## Customization

### Per-Route Limits

```typescript
// Strict rate limiting for sensitive operations
@Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 per 5 minutes
@Post('sensitive-operation')

// Moderate rate limiting for API calls
@Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 per minute
@Get('api-endpoint')

// Loose rate limiting for public data
@Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 per minute
@Get('public-data')
```

### Dynamic Rate Limits

Future enhancements may include:
- User tier-based limits
- Time-of-day rate limiting
- Endpoint popularity-based limits
- Geographic rate limiting

## Testing Rate Limits

### Development Testing

```bash
# Test registration rate limit
for i in {1..5}; do
  curl -X POST http://localhost:3000/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"password","name":"Test User"}'
done
```

### Load Testing

Use tools like:
- **Artillery**: For comprehensive load testing
- **Apache Bench (ab)**: For simple rate limit testing
- **Postman**: For manual testing scenarios

### Rate Limit Testing Script

```typescript
// Test rate limiting
const testRateLimit = async () => {
  const promises = Array.from({ length: 10 }, (_, i) =>
    fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    })
  );

  const responses = await Promise.all(promises);
  responses.forEach((res, i) => {
    console.log(`Request ${i + 1}: ${res.status}`);
  });
};
```

## Troubleshooting

### Common Issues

1. **Rate limit too strict**: Adjust limits in configuration
2. **False positives**: Check IP forwarding configuration
3. **Memory leaks**: Monitor throttler storage usage
4. **Clustering issues**: Implement Redis storage

### Debugging

Enable debug logs:

```env
DEBUG=throttler:*
```

Check current rate limit status:

```bash
curl -I http://localhost:3000/api/endpoint
```

## Security Considerations

### DDoS Protection
- Rate limiting is first line of defense
- Combine with upstream protection (Cloudflare, AWS Shield)
- Implement progressive penalties for repeat offenders

### Legitimate Traffic
- Ensure rate limits don't block legitimate users
- Provide clear error messages
- Consider implementing request queuing

### Monitoring and Alerting
- Alert on unusual rate limit patterns
- Monitor for potential attacks
- Track rate limit effectiveness metrics

## Future Enhancements

1. **Adaptive Rate Limiting**: Adjust limits based on system load
2. **User Reputation**: Track user behavior for dynamic limits
3. **Geographic Limits**: Different limits per region
4. **API Key Management**: Higher limits for verified API keys
5. **Webhook Rate Limits**: Specific limits for webhook endpoints
