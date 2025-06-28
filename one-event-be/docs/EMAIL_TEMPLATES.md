# Email Templates Documentation

## Overview
This document describes the email templates used in the One Event system. All templates use Handlebars templating engine for dynamic content rendering.

## Template Structure
All email templates are located in `src/email/templates/` and follow these conventions:
- Use `.hbs` extension (Handlebars)
- Include responsive HTML design
- Support both dark and light themes
- Include proper meta tags for email clients

## Available Templates

### 1. Registration Confirmation (`registration-confirmation.hbs`)
**Purpose**: Sent when a user successfully registers for an event
**Trigger**: User completes event registration
**Variables**:
- `userName` (string): Name of the user
- `eventTitle` (string): Title of the event
- `eventDate` (string): Event date in ISO format
- `eventLocation` (string): Event location

**Subject**: `Registration Confirmed: [Event Title]`

### 2. Registration Approved (`registration-approved.hbs`)
**Purpose**: Sent when admin approves a pending registration
**Trigger**: Admin confirms user registration
**Variables**:
- `userName` (string): Name of the user
- `eventTitle` (string): Title of the event
- `eventDate` (string): Event date in ISO format
- `eventLocation` (string): Event location

**Subject**: `Registration Approved: [Event Title]`

### 3. Event Cancellation (`event-cancellation.hbs`)
**Purpose**: Sent when an event is cancelled
**Trigger**: Event organizer cancels the event
**Variables**:
- `userName` (string): Name of the user
- `eventTitle` (string): Title of the event
- `reason` (string): Reason for cancellation (optional, defaults to "Unforeseen circumstances")

**Subject**: `Event Cancelled: [Event Title]`

### 4. Event Reminder (`event-reminder.hbs`)
**Purpose**: Sent as a reminder before the event
**Trigger**: Scheduled reminder (typically 24 hours before event)
**Variables**:
- `userName` (string): Name of the user
- `eventTitle` (string): Title of the event
- `eventDate` (string): Event date in ISO format
- `eventLocation` (string): Event location

**Subject**: `Reminder: [Event Title] is Tomorrow!`

## Template Customization

### Adding New Templates
1. Create a new `.hbs` file in `src/email/templates/`
2. Add corresponding method in `EmailService`
3. Test the template using the test script

### Template Variables
All templates have access to these common variables:
- `userName`: Recipient's name
- `eventTitle`: Event title
- `eventDate`: Event date (should be formatted before passing)
- `eventLocation`: Event location

### HTML Guidelines
- Use inline CSS for maximum email client compatibility
- Include viewport meta tag for mobile responsiveness
- Use web-safe fonts (Arial, Helvetica, sans-serif)
- Test with multiple email clients

## Testing Templates
Use the provided test script to verify templates:
```bash
npx ts-node src/scripts/test-emails.ts
```

This will send all email types to a test address and provide preview URLs.

## Production Considerations
- Ensure SMTP credentials are properly configured
- Test email delivery in production environment
- Monitor email delivery rates and bounce rates
- Consider using email delivery services like SendGrid or AWS SES for better deliverability
