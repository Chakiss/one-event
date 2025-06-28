#!/bin/bash

# SSL Certificate Setup for OneEvent
# This script helps set up SSL certificates using Let's Encrypt

set -e

DOMAIN=$1
EMAIL=$2

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email>"
    echo "Example: $0 example.com admin@example.com"
    exit 1
fi

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Create SSL directory
mkdir -p ssl

# Create docker-compose override for certbot
cat > docker-compose.certbot.yml << EOF
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    container_name: one-event-certbot
    volumes:
      - ./ssl:/etc/letsencrypt
      - ./certbot-webroot:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN -d www.$DOMAIN

  nginx-certbot:
    image: nginx:alpine
    container_name: one-event-nginx-certbot
    ports:
      - "80:80"
    volumes:
      - ./certbot-webroot:/var/www/certbot
      - ./nginx/certbot.conf:/etc/nginx/conf.d/default.conf
EOF

# Create temporary nginx config for certificate verification
mkdir -p nginx
cat > nginx/certbot.conf << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

echo "📋 Starting temporary nginx for certificate verification..."
docker-compose -f docker-compose.certbot.yml up -d nginx-certbot

echo "🔑 Requesting SSL certificate from Let's Encrypt..."
docker-compose -f docker-compose.certbot.yml run --rm certbot

echo "🔄 Setting up certificate renewal..."

# Create renewal script
cat > scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
echo "🔄 Renewing SSL certificates..."
docker-compose -f docker-compose.certbot.yml run --rm certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
echo "✅ SSL certificates renewed!"
EOF

chmod +x scripts/renew-ssl.sh

# Add to crontab (optional)
echo "📅 To set up automatic renewal, add this to your crontab:"
echo "0 3 * * 0 /path/to/your/project/scripts/renew-ssl.sh"

echo "🧹 Cleaning up temporary services..."
docker-compose -f docker-compose.certbot.yml down

echo "✅ SSL certificate setup completed!"
echo "📝 Certificate files are located in ./ssl/"
echo "🔧 Update your nginx configuration with the correct domain name: $DOMAIN"
