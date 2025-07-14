#!/bin/bash

# 🚄 Railway Quick Status Check
# ตรวจสอบสถานะ Railway deployment อย่างรวดเร็ว

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}🚄 $1${NC}"
    echo "=========================="
}

print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header "Railway Quick Status Check"

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not installed"
    echo "Install: npm install -g @railway/cli"
    exit 1
fi

# Check login
print_step "Checking Railway authentication..."
if railway whoami > /dev/null 2>&1; then
    user=$(railway whoami)
    print_success "Logged in as: $user"
else
    print_error "Not logged in to Railway"
    echo "Run: railway login"
    exit 1
fi

# Check project link
print_step "Checking project link..."
if railway status > /dev/null 2>&1; then
    project_info=$(railway status)
    print_success "Project linked"
    echo "$project_info"
else
    print_error "No project linked"
    echo "Run: railway link"
    exit 1
fi

# Check services
print_header "Railway Dashboard Actions"

echo "🌐 To check your deployment:"
echo "1. Railway Dashboard: https://railway.app"
echo "2. Project: earnest-laughter"
echo "3. Check these services:"
echo "   - PostgreSQL (should be Running)"
echo "   - Redis (should be Running)"
echo "   - one-event-be (check if Building/Running)"
echo "   - one-event-fe (may not exist yet)"
echo ""

echo "🔧 To redeploy Backend:"
echo "1. Click on 'one-event-be' service"
echo "2. Go to 'Deployments' tab"
echo "3. Click 'Redeploy' on latest deployment"
echo "4. Watch the build logs"
echo ""

echo "📊 Expected Backend URL format:"
echo "https://one-event-be-production-xxxx.up.railway.app"
echo ""

print_header "Quick Tests"

# Test if we can get backend URL
print_step "Getting backend URL..."
backend_url="https://one-event-be-production.up.railway.app"

echo "Testing backend health: $backend_url/health"
response=$(curl -s --max-time 10 "$backend_url/health" 2>/dev/null || echo "error")

if echo "$response" | grep -q "status"; then
    print_success "Backend is responding!"
    echo "Response: $response"
else
    print_warning "Backend not responding yet"
    echo "This is normal if deployment is still in progress"
    echo "Expected response: {\"status\":\"ok\",\"timestamp\":\"...\"}"
fi

print_header "Next Steps"

echo "📋 Deployment Checklist:"
echo "□ Backend deployed and running"
echo "□ Backend health endpoint working"
echo "□ Frontend deployed with correct NEXT_PUBLIC_API_URL"
echo "□ Frontend accessible and working"
echo ""

echo "🎯 If Backend is not working:"
echo "1. Check Railway Dashboard build logs"
echo "2. Verify environment variables are set"
echo "3. Ensure DATABASE_URL and REDIS_URL are auto-generated"
echo "4. Try manual redeploy"
echo ""

echo "💡 Helpful commands:"
echo "railway logs                    # View logs"
echo "railway variables              # View environment variables"
echo "railway domain                 # Generate/view domain"
echo "railway open                   # Open dashboard"
echo ""

echo -e "${GREEN}🎉 Check Railway Dashboard for detailed status!${NC}"
