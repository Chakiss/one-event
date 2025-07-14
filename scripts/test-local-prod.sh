#!/bin/bash

# 🧪 Test Local Production Before GCP Deploy
# This script ensures your local production environment is working before deploying to GCP

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}🚀 $1${NC}"
    echo "=================================="
}

print_header "OneEvent Local Production Test"

# Check if running from correct directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Stop any existing services
print_info "Stopping existing services..."
docker compose -f docker-compose.prod.yml down

# Clean up volumes for fresh start
print_info "Cleaning up volumes..."
docker compose -f docker-compose.prod.yml down -v

# Start fresh production environment
print_info "Starting fresh production environment..."
docker compose -f docker-compose.prod.yml up -d

print_info "Waiting for services to start (60 seconds)..."
sleep 60

# Check service status
print_header "Service Status Check"

# Get service status
POSTGRES_STATUS=$(docker compose -f docker-compose.prod.yml ps postgres --format "table" | grep postgres | awk '{print $6}')
REDIS_STATUS=$(docker compose -f docker-compose.prod.yml ps redis --format "table" | grep redis | awk '{print $6}')
BACKEND_STATUS=$(docker compose -f docker-compose.prod.yml ps backend --format "table" | grep backend | awk '{print $6}')
FRONTEND_STATUS=$(docker compose -f docker-compose.prod.yml ps frontend --format "table" | grep frontend | awk '{print $6}')
NGINX_STATUS=$(docker compose -f docker-compose.prod.yml ps nginx --format "table" | grep nginx | awk '{print $6}')

echo "Service Status:"
echo "├── PostgreSQL: $POSTGRES_STATUS"
echo "├── Redis: $REDIS_STATUS"
echo "├── Backend: $BACKEND_STATUS"
echo "├── Frontend: $FRONTEND_STATUS"
echo "└── Nginx: $NGINX_STATUS"

# Health checks
print_header "Health Checks"

# Wait a bit more for services to be ready
sleep 30

# Test PostgreSQL
print_info "Testing PostgreSQL connection..."
if docker exec one-event-postgres pg_isready -U postgres > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_error "PostgreSQL is not ready"
fi

# Test Redis
print_info "Testing Redis connection..."
if docker exec one-event-redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    print_error "Redis is not ready"
fi

# Test Backend
print_info "Testing Backend health endpoint..."
BACKEND_RETRIES=10
BACKEND_READY=false

for i in $(seq 1 $BACKEND_RETRIES); do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
        BACKEND_READY=true
        break
    else
        print_info "Backend not ready yet... (attempt $i/$BACKEND_RETRIES)"
        sleep 10
    fi
done

if [ "$BACKEND_READY" = false ]; then
    print_error "Backend health check failed after $BACKEND_RETRIES attempts"
    print_info "Backend logs:"
    docker compose -f docker-compose.prod.yml logs backend --tail=10
fi

# Test Frontend through Nginx
print_info "Testing Frontend through Nginx..."
FRONTEND_RETRIES=10
FRONTEND_READY=false

for i in $(seq 1 $FRONTEND_RETRIES); do
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Frontend is accessible through Nginx"
        FRONTEND_READY=true
        break
    else
        print_info "Frontend not ready yet... (attempt $i/$FRONTEND_RETRIES)"
        sleep 10
    fi
done

if [ "$FRONTEND_READY" = false ]; then
    print_error "Frontend health check failed after $FRONTEND_RETRIES attempts"
    print_info "Frontend logs:"
    docker compose -f docker-compose.prod.yml logs frontend --tail=10
    print_info "Nginx logs:"
    docker compose -f docker-compose.prod.yml logs nginx --tail=10
fi

# API Tests
print_header "API Functionality Tests"

if [ "$BACKEND_READY" = true ]; then
    # Test API endpoints
    print_info "Testing API endpoints..."
    
    # Health endpoint
    if curl -s http://localhost:3000/health | grep -q "ok"; then
        print_success "Health endpoint working"
    else
        print_warning "Health endpoint not responding correctly"
    fi
    
    # API documentation
    if curl -f http://localhost:3000/api > /dev/null 2>&1; then
        print_success "API documentation accessible"
    else
        print_warning "API documentation not accessible"
    fi
    
    # Test API through Nginx
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        print_success "API accessible through Nginx"
    else
        print_warning "API not accessible through Nginx"
    fi
fi

# Database Tests
print_header "Database Tests"

if docker exec one-event-postgres psql -U postgres -d one_event_production -c "SELECT version();" > /dev/null 2>&1; then
    print_success "Database connection working"
    
    # Check if tables exist
    TABLE_COUNT=$(docker exec one-event-postgres psql -U postgres -d one_event_production -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    if [ "$TABLE_COUNT" -gt 0 ]; then
        print_success "Database has $TABLE_COUNT tables"
    else
        print_warning "Database has no tables (might be first run)"
    fi
else
    print_error "Database connection failed"
fi

# Summary
print_header "Local Production Test Summary"

OVERALL_STATUS="✅ PASS"

if [ "$BACKEND_READY" = false ] || [ "$FRONTEND_READY" = false ]; then
    OVERALL_STATUS="❌ FAIL"
fi

echo ""
echo "🎯 Test Results:"
echo "├── PostgreSQL: $([ "$(docker exec one-event-postgres pg_isready -U postgres 2>/dev/null; echo $?)" = "0" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "├── Redis: $([ "$(docker exec one-event-redis redis-cli ping 2>/dev/null)" = "PONG" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "├── Backend: $([ "$BACKEND_READY" = true ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "├── Frontend: $([ "$FRONTEND_READY" = true ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "└── Overall: $OVERALL_STATUS"
echo ""

if [ "$OVERALL_STATUS" = "✅ PASS" ]; then
    print_success "🎉 Local Production is ready for GCP deployment!"
    echo ""
    print_info "📋 Access URLs:"
    echo "   • Frontend: http://localhost"
    echo "   • Backend: http://localhost:3000"
    echo "   • API Docs: http://localhost:3000/api"
    echo "   • API via Nginx: http://localhost/api"
    echo ""
    print_info "🚀 Ready to deploy to GCP?"
    read -p "Deploy to GCP now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting GCP deployment..."
        ./deploy-gcp.sh
    else
        print_info "GCP deployment skipped. Run './deploy-gcp.sh' when ready."
    fi
else
    print_error "🚨 Local Production has issues. Please fix them before deploying to GCP."
    print_info "💡 Troubleshooting tips:"
    echo "   • Check logs: docker compose -f docker-compose.prod.yml logs [service]"
    echo "   • Restart services: docker compose -f docker-compose.prod.yml restart"
    echo "   • Clean restart: docker compose -f docker-compose.prod.yml down -v && docker compose -f docker-compose.prod.yml up -d"
fi
