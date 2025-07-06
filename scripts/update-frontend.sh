#!/bin/bash

# Script to update and redeploy OneEvent frontend with logo fixes

set -e

echo "🔄 Updating OneEvent Frontend with Logo Fixes..."

# Stop development server if running
pkill -f "next dev" || true

# Navigate to project directory
cd /Users/chakritpaniam/CMD-R/ComOne/one-event

# Build the frontend
echo "🏗️  Building frontend..."
cd one-event-fe
npm run build

# Navigate back to root
cd ..

# Stop existing production services
echo "🛑 Stopping existing services..."
docker-compose -f docker-compose.prod.yml down

# Rebuild and restart services
echo "📦 Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to be healthy..."

# Wait for services to be ready
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Frontend updated successfully!"
echo ""
echo "🔗 Your application should be available at:"
echo "   https://one-event-web-prod-712057384144.asia-southeast1.run.app/"
echo ""
echo "🖼️  Logo should now display correctly using direct img tags"
echo "   instead of Next.js Image optimization"
