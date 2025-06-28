# API Documentation

## Overview

The One Event API provides comprehensive event management functionality with authentication, user management, event creation, and registration capabilities. The API is documented using Swagger/OpenAPI 3.0 specification.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.oneevent.com`

## API Documentation Access

The interactive Swagger UI documentation is available at:
- **Local**: http://localhost:3000/api
- **Production**: https://api.oneevent.com/api

## Authentication

### JWT Bearer Token

Most endpoints require authentication using JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. Register a new account: `POST /auth/register`
2. Login with credentials: `POST /auth/login`
3. Use the returned `access_token` for subsequent requests

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (requires auth)
- `GET /auth/admin-only` - Admin-only endpoint (requires admin role)

### Users
- `POST /users` - Create user (admin only)
- `GET /users` - Get all users (admin only)
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID (admin only)
- `PATCH /users/me` - Update current user profile
- `PATCH /users/:id` - Update user by ID (admin only)
- `DELETE /users/:id` - Delete user (admin only)

### Events
- `POST /events` - Create event (requires auth)
- `GET /events` - Get all published events (public)
- `GET /events/published` - Get published events (public)
- `GET /events/my-events` - Get current user events (requires auth)
- `GET /events/:id` - Get event by ID (public)
- `PATCH /events/:id` - Update event (owner or admin)
- `DELETE /events/:id` - Delete event (owner or admin)
- `PATCH /events/:id/publish` - Publish event (owner or admin)
- `PATCH /events/:id/cancel` - Cancel event (owner or admin)
- `GET /events/admin/all` - Get all events including drafts (admin only)

### Registrations
- `POST /registrations` - Register for event (requires auth)
- `GET /registrations` - Get all registrations (admin only)
- `GET /registrations/my-registrations` - Get user registrations (requires auth)
- `GET /registrations/event/:eventId` - Get event registrations (admin only)
- `GET /registrations/event/:eventId/stats` - Get event statistics (admin only)
- `GET /registrations/:id` - Get registration by ID (requires auth)
- `PATCH /registrations/:id` - Update registration (owner or admin)
- `PATCH /registrations/:id/cancel` - Cancel registration (owner or admin)
- `PATCH /registrations/:id/confirm` - Confirm registration (admin only)
- `PATCH /registrations/:id/attended` - Mark as attended (admin only)
- `DELETE /registrations/:id` - Delete registration (owner or admin)

### Health
- `GET /health` - System health status (public)

### Application
- `GET /` - Welcome message (public)

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

## Rate Limiting

The API implements multiple layers of rate limiting to prevent abuse. See [RATE_LIMITING.md](./RATE_LIMITING.md) for details.

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Data Formats

### Date Format
All dates are returned in ISO 8601 format: `2023-12-07T10:30:00.000Z`

### UUID Format
All IDs use UUID v4 format: `550e8400-e29b-41d4-a716-446655440000`

## Pagination

For endpoints that return lists, pagination is implemented using query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field
- `order` - Sort order (asc/desc)

## Filtering

Many endpoints support filtering using query parameters:

### Events
- `title` - Filter by title (partial match)
- `location` - Filter by location (partial match)
- `status` - Filter by status (draft, published, cancelled)
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)

### Registrations
- `eventId` - Filter by event ID
- `userId` - Filter by user ID
- `status` - Filter by status (pending, confirmed, cancelled, attended)

## Testing

You can test the API using:
- Swagger UI at `/api` endpoint
- Postman collection (available in `/docs` folder)
- curl commands
- Any HTTP client

## Support

For API support and questions:
- Check the Swagger documentation at `/api`
- Review this documentation
- Contact the development team
