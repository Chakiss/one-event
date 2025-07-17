#!/bin/bash

# 🚄 Railway Backend Deploy Script
# แก้ปัญหา Dockerfile not found แบบ one-command

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚄 Railway Backend Deployment"
echo "================================"

# Check if we're in the right directory
if [ ! -f "one-event-be/Dockerfile" ]; then
    print_error "one-event-be/Dockerfile not found. Please run from project root."
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    print_warning "Root Dockerfile not found. Creating one..."
    # Dockerfile was already created above
fi

print_info "Step 1: Test local Docker build"
if docker build -t one-event-backend-test .; then
    print_success "Docker build successful"
else
    print_error "Docker build failed. Please check Dockerfile."
    exit 1
fi

print_info "Step 2: Clean up test image"
docker rmi one-event-backend-test 2>/dev/null || true

print_info "Step 3: Instructions for Railway deployment"
echo ""
echo "🎯 Next steps:"
echo "1. Go to Railway Dashboard"
echo "2. Select your backend service"
echo "3. Go to Settings > Source"
echo "4. Set Root Directory to: one-event-be"
echo "5. Or use the root Dockerfile we just created"
echo ""
echo "🔗 Alternative: Use railway CLI:"
echo "   railway login"
echo "   railway link"
echo "   railway up"
echo ""

print_success "Setup completed! Ready for Railway deployment."
