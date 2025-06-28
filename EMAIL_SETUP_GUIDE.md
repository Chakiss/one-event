# OneEvent Email Configuration Guide

## Current Status
✅ **Email verification system is fully implemented and working in simulation mode**
✅ **Backend logs show verification emails with tokens and links**
✅ **Ready for production email setup**

## For Development (Current Setup)
The system currently runs in **simulation mode** where:
- Email content is logged to the backend console
- Verification tokens are generated and stored correctly
- No actual emails are sent (safe for development)

## To Enable Real Email Sending

### Option 1: Gmail SMTP (Recommended for testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate password for "Mail"
   - Copy the 16-character password

3. **Update backend .env file**:
   ```bash
   # In /one-event-be/.env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

4. **Restart the backend server**:
   ```bash
   cd one-event-be
   npm run start:dev
   ```

### Option 2: Other SMTP Providers

#### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASS=your-mailgun-smtp-password
```

#### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-ses-access-key
EMAIL_PASS=your-ses-secret-key
```

## Testing Email Functionality

1. **With Simulation (Current)**:
   - Register a new user
   - Check backend console for email logs
   - Copy verification link from logs
   - Test verification manually

2. **With Real Email**:
   - Configure SMTP settings above
   - Restart backend server
   - Register with your real email
   - Check your inbox for verification email
   - Click the verification link

## Email Template Customization

The email template is defined in:
`/one-event-be/src/common/services/email.service.ts`

You can customize:
- Subject line
- HTML content
- Styling
- Company branding
- Links and buttons

## Security Notes

- **Never commit real email credentials to git**
- **Use environment variables for all sensitive data**
- **In production, use secure SMTP providers**
- **Consider using email services like SendGrid/Mailgun for scalability**

## Troubleshooting

### Common Issues:
1. **"Authentication failed"** → Check username/password
2. **"Connection timeout"** → Check host/port settings
3. **"Emails not received"** → Check spam folder
4. **"App password invalid"** → Regenerate Gmail app password

### Debug Mode:
The EmailService logs all SMTP attempts. Check backend console for detailed error messages.
