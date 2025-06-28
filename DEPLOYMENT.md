# OneEvent Deployment Guide

This comprehensive guide covers various deployment options for the OneEvent application, from development setup to production deployment.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL database
- Domain name (for production)

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd one-event
   ```

2. **Run development setup**:
   ```bash
   ./scripts/dev-setup.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:3001
   - Backend: http://localhost:3000
   - API Docs: http://localhost:3000/api

## 🏗 Deployment Options

### 1. Docker Compose (Recommended)

#### Production Deployment

1. **Prepare environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Deploy**:
   ```bash
   ./scripts/deploy.sh
   ```

3. **Setup SSL (optional)**:
   ```bash
   ./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com
   ```

#### Development Environment

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### 2. Manual Deployment

#### Backend Deployment

1. **Install dependencies**:
   ```bash
   cd one-event-be
   npm install --production
   ```

2. **Build application**:
   ```bash
   npm run build
   ```

3. **Setup environment**:
   ```bash
   cp .env.example .env
   # Configure your production values
   ```

4. **Start application**:
   ```bash
   npm run start:prod
   ```

#### Frontend Deployment

1. **Install dependencies**:
   ```bash
   cd one-event-fe
   npm install --production
   ```

2. **Build application**:
   ```bash
   npm run build
   ```

3. **Start application**:
   ```bash
   npm start
   ```

### 3. Cloud Deployment

#### Vercel (Frontend)

1. **Connect your repository to Vercel**
2. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   ```
3. **Deploy**: Automatic on git push

#### Railway/Heroku (Backend)

1. **Create new app**
2. **Set environment variables**
3. **Connect repository**
4. **Deploy**: Automatic on git push

#### DigitalOcean App Platform

1. **Create new app**
2. **Add both backend and frontend services**
3. **Configure environment variables**
4. **Set up database**

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=one_event

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="OneEvent <noreply@yourdomain.com>"

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

#### Frontend (.env.local)
```bash
# API URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_NAME=OneEvent
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Database Setup

#### PostgreSQL Setup

1. **Create database**:
   ```sql
   CREATE DATABASE one_event_production;
   CREATE USER one_event_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE one_event_production TO one_event_user;
   ```

2. **Run migrations**: The application will automatically run migrations on startup.

### SSL Certificate Setup

#### Using Let's Encrypt

```bash
# Run SSL setup script
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com

# Setup automatic renewal
echo "0 3 * * 0 /path/to/project/scripts/renew-ssl.sh" | crontab -
```

#### Manual Certificate

1. **Place certificates in `/ssl/` directory**:
   - `fullchain.pem` (full certificate chain)
   - `privkey.pem` (private key)

2. **Update nginx configuration** with correct paths

## 🔄 CI/CD Pipeline

### GitHub Actions

The project includes a complete CI/CD pipeline that:

1. **Tests code** on every push/PR
2. **Builds Docker images** on main branch
3. **Deploys to production** (when configured)

#### Setup

1. **Enable GitHub Actions** in your repository
2. **Add secrets** for production deployment:
   ```
   PRODUCTION_HOST=your-server-ip
   PRODUCTION_USER=deploy-user
   PRODUCTION_SSH_KEY=your-private-key
   ```

### Manual CI/CD

#### Build and Test

```bash
# Test backend
cd one-event-be
npm test
npm run lint
npm run build

# Test frontend
cd one-event-fe
npm run lint
npm run build
```

#### Deploy

```bash
# Build and push images
docker build -t one-event-backend ./one-event-be
docker build -t one-event-frontend ./one-event-fe

# Deploy with compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring and Maintenance

### Health Checks

- **Backend**: `GET /health`
- **Frontend**: Access homepage
- **Database**: Connection test

### Log Management

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Follow logs in real-time
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

### Backup

#### Database Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres one_event_production > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres one_event_production < backup.sql
```

#### File Backup

```bash
# Backup uploads and certificates
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/ ssl/
```

### Updates

#### Application Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Clean up old images
docker system prune -f
```

#### Security Updates

```bash
# Update base images
docker-compose -f docker-compose.prod.yml pull

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡 Security

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secret
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database backup strategy
- [ ] Monitor application logs

### Security Headers

The nginx configuration includes:
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connectivity
docker-compose -f docker-compose.prod.yml exec backend npm run typeorm:check

# View database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

#### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in ssl/fullchain.pem -text -noout

# Renew certificate
./scripts/renew-ssl.sh
```

#### Memory Issues

```bash
# Check container resource usage
docker stats

# Restart services with memory limit
docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

### Performance Optimization

#### Database Optimization

- Enable connection pooling
- Add database indexes
- Regular VACUUM and ANALYZE

#### Application Optimization

- Enable gzip compression
- Optimize images
- Use CDN for static assets
- Enable browser caching

## 📋 Deployment Checklist

### Pre-deployment

- [ ] Test application locally
- [ ] Configure environment variables
- [ ] Set up database
- [ ] Configure SSL certificates
- [ ] Set up monitoring
- [ ] Configure backups

### Post-deployment

- [ ] Verify all services are running
- [ ] Test all endpoints
- [ ] Check logs for errors
- [ ] Verify SSL certificate
- [ ] Test email functionality
- [ ] Set up monitoring alerts

### Production Maintenance

- [ ] Regular backups
- [ ] Security updates
- [ ] Performance monitoring
- [ ] Log rotation
- [ ] SSL certificate renewal
- [ ] Database maintenance

## 🆘 Support

For deployment issues:

1. Check application logs
2. Review configuration
3. Consult troubleshooting section
4. Create issue in repository

---

**Happy Deploying! 🚀**
