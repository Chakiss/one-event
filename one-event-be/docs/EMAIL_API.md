# Email Notification API Documentation

## Overview
The Email Notification System automatically sends emails for various event-related activities. This document describes the email triggers and customization options.

## Automatic Email Triggers

### 1. Registration Confirmation
**Triggered When**: User registers for an event  
**Method**: `POST /registrations`  
**Email Type**: `registration-confirmation`  

**Request Example**:
```http
POST /registrations
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "eventId": "uuid-event-id",
  "notes": "Looking forward to this event!"
}
```

**Email Sent To**: Registered user  
**Email Content**: Event details, registration confirmation, next steps

---

### 2. Registration Approval
**Triggered When**: Admin approves a pending registration  
**Method**: `PATCH /registrations/:id/confirm`  
**Email Type**: `registration-approved`  

**Request Example**:
```http
PATCH /registrations/uuid-registration-id/confirm
Authorization: Bearer <admin-jwt-token>
```

**Email Sent To**: User whose registration was approved  
**Email Content**: Approval notification, event details, attendance instructions

---

### 3. Event Cancellation
**Triggered When**: Event organizer cancels an event  
**Method**: `PATCH /events/:id/cancel`  
**Email Type**: `event-cancellation`  

**Request Example**:
```http
PATCH /events/uuid-event-id/cancel
Authorization: Bearer <organizer-jwt-token>
Content-Type: application/json

{
  "reason": "Venue unavailable due to maintenance"
}
```

**Email Sent To**: All registered users for the event  
**Email Content**: Cancellation notice, reason, refund/rescheduling information

---

### 4. Event Reminder
**Triggered When**: Scheduled reminder (typically 24 hours before event)  
**Method**: Automated/Scheduled  
**Email Type**: `event-reminder`  

**Email Sent To**: All confirmed attendees  
**Email Content**: Event reminder, location details, what to bring

## Email Service API Endpoints

### Manual Email Testing (Development Only)

#### Send Test Registration Confirmation
```http
POST /email/test/registration-confirmation
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "userName": "John Doe",
  "eventTitle": "Test Event",
  "eventDate": "2024-12-25T10:00:00Z",
  "eventLocation": "Test Location"
}
```

#### Send Test Registration Approved
```http
POST /email/test/registration-approved
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "userName": "John Doe",
  "eventTitle": "Test Event",
  "eventDate": "2024-12-25T10:00:00Z",
  "eventLocation": "Test Location"
}
```

#### Send Test Event Cancellation
```http
POST /email/test/event-cancellation
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "userName": "John Doe",
  "eventTitle": "Test Event",
  "reason": "Technical difficulties"
}
```

#### Send Test Event Reminder
```http
POST /email/test/event-reminder
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "to": "test@example.com",
  "userName": "John Doe",
  "eventTitle": "Test Event",
  "eventDate": "2024-12-25T10:00:00Z",
  "eventLocation": "Test Location"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "messageId": "<unique-message-id@domain.com>",
  "previewUrl": "https://ethereal.email/message/..." // Development only
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Email Configuration

### Environment Variables
```env
# Email Service Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=production
```

### Development vs Production
- **Development**: Uses Ethereal Email for testing, provides preview URLs
- **Production**: Uses configured SMTP server for real email delivery

## Email Template Customization

### Template Variables
All email templates support these variables:
- `userName`: Recipient's name
- `eventTitle`: Event title
- `eventDate`: Event date (ISO string format)
- `eventLocation`: Event location
- `reason`: Cancellation reason (for cancellation emails)

### Template Structure
```handlebars
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{eventTitle}}</title>
    <!-- Responsive CSS styles -->
</head>
<body>
    <div class="container">
        <h1>Hello {{userName}}!</h1>
        <!-- Email content -->
    </div>
</body>
</html>
```

## Error Handling

### Common Errors
1. **SMTP Configuration Error**: Invalid SMTP credentials
2. **Template Not Found**: Missing or corrupted email template
3. **Network Error**: Unable to connect to SMTP server
4. **Invalid Email Address**: Malformed recipient email

### Error Logging
All email errors are logged to the console with detailed error messages:
```javascript
console.error('Email sending failed:', error);
```

## Rate Limiting
Email sending is subject to SMTP provider rate limits:
- **Gmail**: 100 emails/day (free), 2000 emails/day (paid)
- **SendGrid**: Based on your plan
- **AWS SES**: Based on your sending quota

## Security Considerations
1. **SMTP Credentials**: Store securely in environment variables
2. **Email Templates**: Sanitize user input to prevent XSS
3. **Rate Limiting**: Implement application-level rate limiting
4. **Logging**: Don't log sensitive email content
5. **GDPR**: Ensure compliance with data protection regulations

## Monitoring and Analytics
Consider implementing:
- Email delivery tracking
- Open rate monitoring
- Bounce rate tracking
- Unsubscribe handling
- Email service health checks

## Future Enhancements
Potential improvements:
- Email preferences for users
- Email scheduling system
- A/B testing for templates
- Email analytics dashboard
- Bulk email sending
- Email queue management
