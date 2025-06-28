#!/bin/bash

# OneEvent Production Deployment Script
# This script deploys the OneEvent application using Docker Compose

set -e

echo "🚀 Starting OneEvent Production Deployment..."

# Check if required files exist
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found. Please copy .env.example to .env and configure it."
    exit 1
fi

if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: docker-compose.prod.yml not found."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📦 Building and starting services..."

# Pull latest images (if using remote registry)
docker-compose -f docker-compose.prod.yml pull

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to be healthy..."

# Wait for database to be ready
echo "🗄️  Waiting for database..."
timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U ${DATABASE_USERNAME:-postgres}; do sleep 2; done'

# Wait for backend to be ready
echo "🔧 Waiting for backend API..."
timeout 60 bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'

# Wait for frontend to be ready
echo "🌐 Waiting for frontend..."
timeout 60 bash -c 'until curl -f http://localhost:3001; do sleep 2; done'

echo "✅ Deployment completed successfully!"
echo ""
echo "🔗 Application URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   API Documentation: http://localhost:3000/api"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📝 To view logs:"
echo "   All services: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Backend only: docker-compose -f docker-compose.prod.yml logs -f backend"
echo "   Frontend only: docker-compose -f docker-compose.prod.yml logs -f frontend"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"
