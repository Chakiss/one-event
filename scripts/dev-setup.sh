#!/bin/bash

# OneEvent Development Setup Script
# This script sets up the development environment using Docker Compose

set -e

echo "🔧 Setting up OneEvent Development Environment..."

# Check if required files exist
if [ ! -f ".env.local" ]; then
    echo "📋 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ .env.local created. Please review and update the configuration."
fi

echo "📦 Building and starting development services..."

# Build and start development services
docker-compose -f docker-compose.dev.yml up -d --build

echo "⏳ Waiting for services to be ready..."

# Wait for database
echo "🗄️  Waiting for database..."
timeout 60 bash -c 'until docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres; do sleep 2; done'

# Wait for backend
echo "🔧 Waiting for backend API..."
timeout 60 bash -c 'until curl -f http://localhost:3000/health; do sleep 2; done'

# Wait for frontend
echo "🌐 Waiting for frontend..."
timeout 60 bash -c 'until curl -f http://localhost:3001; do sleep 2; done'

echo "✅ Development environment is ready!"
echo ""
echo "🔗 Development URLs:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000"
echo "   API Documentation: http://localhost:3000/api"
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "📝 Development Commands:"
echo "   View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
echo "   Restart services: docker-compose -f docker-compose.dev.yml restart"
echo "   Access backend shell: docker-compose -f docker-compose.dev.yml exec backend sh"
echo "   Access frontend shell: docker-compose -f docker-compose.dev.yml exec frontend sh"
