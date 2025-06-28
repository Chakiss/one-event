# Production Deployment Guide

## 🚀 Prerequisites

### System Requirements
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn
- SSL Certificate (for HTTPS)

### Email Service Setup
Choose one of the following email providers:

#### Option 1: Gmail SMTP
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

#### Option 2: SendGrid
1. Create SendGrid account
2. Generate API Key
3. Use these settings:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

## 📋 Deployment Steps

### 1. Server Setup
```bash
# Clone repository
git clone <repository-url>
cd one-event-be

# Install dependencies
npm ci --production

# Build application
npm run build
```

### 2. Database Setup
```bash
# Create production database
createdb one_event_production

# Set environment variables
export NODE_ENV=production
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=your_secure_password
export DB_DATABASE=one_event_production
```

### 3. Environment Configuration
Create `.env` file for production:
```env
# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-db-password
DB_DATABASE=one_event_production

# JWT
JWT_SECRET=your-super-secure-32-character-secret-key
JWT_EXPIRES_IN=7d

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Application
PORT=3000
NODE_ENV=production
```

### 4. Security Configuration
```bash
# Set proper file permissions
chmod 600 .env
chown app:app .env

# Configure firewall
ufw allow 3000/tcp
ufw enable
```

### 5. Process Management (PM2)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'one-event-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Health Checks

### Application Health
```bash
# Check application status
curl https://api.yourdomain.com/health

# Expected response:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

### Email Service Health
```bash
# Test email sending
curl -X POST https://api.yourdomain.com/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 📊 Monitoring

### Logs
```bash
# View application logs
pm2 logs one-event-api

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Performance Monitoring
- Monitor CPU and memory usage
- Track database connection pool
- Monitor email delivery rates
- Set up alerts for errors

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit sensitive data
2. **Database**: Use strong passwords and limit connections
3. **HTTPS**: Always use SSL certificates
4. **Rate Limiting**: Implement API rate limiting
5. **CORS**: Configure proper CORS origins
6. **Headers**: Set security headers
7. **Updates**: Keep dependencies updated

## 🆘 Troubleshooting

### Common Issues

#### Email Not Sending
```bash
# Check SMTP configuration
node -e "console.log(process.env.SMTP_HOST)"

# Test SMTP connection
telnet smtp.gmail.com 587
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U your-user -d one_event_production

# Check connection pool
# Monitor logs for connection errors
```

#### Application Crashes
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs one-event-api --err

# Restart application
pm2 restart one-event-api
```

## 🔄 Backup Strategy

### Database Backup
```bash
# Daily backup script
#!/bin/bash
pg_dump -h localhost -U postgres one_event_production > backup_$(date +%Y%m%d).sql
```

### Application Backup
- Source code: Use Git repository
- Configuration: Backup .env and config files
- Logs: Rotate and archive logs regularly

## 📈 Scaling Considerations

- **Load Balancer**: Use multiple application instances
- **Database**: Consider read replicas for high traffic
- **Email**: Use dedicated email service (SendGrid, AWS SES)
- **Caching**: Implement Redis for session management
- **CDN**: Use CDN for static assets
