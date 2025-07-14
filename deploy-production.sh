#!/bin/bash

# OneEvent Production Docker Deployment Script
echo "🚀 Starting OneEvent Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version > /dev/null 2>&1; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

print_status "Docker and Docker Compose are available ✅"

# Create production environment file if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        print_status "Copying .env.production to .env..."
        cp .env.production .env
    else
        print_warning "Creating default .env file..."
        cp .env.template .env
        print_warning "Please edit .env file with your production values"
        read -p "Press enter to continue after editing .env file..."
    fi
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker compose -f docker-compose.prod.yml down

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# print_status "Removing old images..."
# docker system prune -f

# Build and start services
print_status "Building and starting production services..."
docker compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service status
print_status "Checking service status..."

# Check PostgreSQL
if docker compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL is not ready"
fi

# Check Redis
if docker compose -f docker-compose.prod.yml exec redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is running"
else
    print_error "Redis is not ready"
fi

# Check Backend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Backend API is running"
else
    print_warning "Backend API is not ready yet (may still be starting up)"
fi

# Check Frontend
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    print_success "Frontend is running"
else
    print_warning "Frontend is not ready yet (may still be starting up)"
fi

# Check Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    print_success "Nginx reverse proxy is running"
else
    print_warning "Nginx is not ready yet (may still be starting up)"
fi

print_success "🎉 Deployment completed!"
echo
echo "📋 Service URLs:"
echo "  🌐 Frontend: http://localhost"
echo "  🔧 Backend API: http://localhost/api"
echo "  📚 API Documentation: http://localhost/api/docs"
echo "  📊 Direct Backend: http://localhost:3000"
echo "  🎨 Direct Frontend: http://localhost:3001"
echo
echo "📊 To check logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo
echo "🛑 To stop services:"
echo "  docker compose -f docker-compose.prod.yml down"
echo
