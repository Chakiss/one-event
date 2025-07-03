import { SetMetadata } from '@nestjs/common';

export const THROTTLE_LIMIT = 'throttle_limit';
export const THROTTLE_TTL = 'throttle_ttl';

export const ThrottleLimit = (limit: number, ttl: number) =>
  SetMetadata(THROTTLE_LIMIT, { limit, ttl });

// Predefined rate limits for common use cases
export const RateLimit = {
  // Strict rate limiting for sensitive operations
  Strict: () => ThrottleLimit(5, 60000), // 5 requests per minute

  // Moderate rate limiting for API calls
  Moderate: () => ThrottleLimit(30, 60000), // 30 requests per minute

  // Loose rate limiting for general endpoints
  Loose: () => ThrottleLimit(100, 60000), // 100 requests per minute

  // Very strict rate limiting for authentication
  Auth: () => ThrottleLimit(3, 300000), // 3 requests per 5 minutes

  // Custom rate limiting
  Custom: (limit: number, ttlInMs: number) => ThrottleLimit(limit, ttlInMs),
};
