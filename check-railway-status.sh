#!/bin/bash

# 🔍 Railway Deployment Status Checker
# ตรวจสอบสถานะ services หลังจาก deploy

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "=========================="
}

check_service() {
    local url=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    if curl -s --head "$url" | head -n 1 | grep -q "200 OK"; then
        echo -e "${GREEN}✅ Online${NC}"
        return 0
    else
        echo -e "${RED}❌ Offline${NC}"
        return 1
    fi
}

check_api_endpoint() {
    local url=$1
    local endpoint=$2
    local expected=$3
    
    echo -n "Testing $endpoint... "
    
    response=$(curl -s "$url$endpoint" || echo "error")
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ Working${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed${NC}"
        echo "Response: $response"
        return 1
    fi
}

print_header "OneEvent Railway Deployment Status"

# ขอ URLs จากผู้ใช้
echo "กรุณาใส่ URLs จาก Railway Dashboard:"
echo ""

read -p "Backend URL (https://xxx.railway.app): " BACKEND_URL
read -p "Frontend URL (https://xxx.railway.app): " FRONTEND_URL

# ลบ trailing slash
BACKEND_URL=${BACKEND_URL%/}
FRONTEND_URL=${FRONTEND_URL%/}

print_header "Service Health Checks"

# ตรวจสอบ Backend
check_service "$BACKEND_URL" "Backend Service"

# ตรวจสอบ Frontend  
check_service "$FRONTEND_URL" "Frontend Service"

print_header "API Endpoint Tests"

# ตรวจสอบ API endpoints
check_api_endpoint "$BACKEND_URL" "/health" "ok"
check_api_endpoint "$BACKEND_URL" "/api" "OneEvent"

print_header "Database & Redis Status"

# ตรวจสอบผ่าน Railway CLI
echo "Checking Railway services..."

if command -v railway &> /dev/null; then
    railway status
else
    echo -e "${YELLOW}⚠️  Railway CLI not found. Install with: npm install -g @railway/cli${NC}"
fi

print_header "Performance Check"

# Ping test
echo "Testing response times..."

echo -n "Backend ping: "
backend_time=$(curl -o /dev/null -s -w "%{time_total}" "$BACKEND_URL/health" || echo "error")
if [ "$backend_time" != "error" ]; then
    echo -e "${GREEN}${backend_time}s${NC}"
else
    echo -e "${RED}Failed${NC}"
fi

echo -n "Frontend ping: "
frontend_time=$(curl -o /dev/null -s -w "%{time_total}" "$FRONTEND_URL" || echo "error")
if [ "$frontend_time" != "error" ]; then
    echo -e "${GREEN}${frontend_time}s${NC}"
else
    echo -e "${RED}Failed${NC}"
fi

print_header "Summary"

echo -e "🎯 **OneEvent Railway Deployment**"
echo -e "Frontend: ${FRONTEND_URL}"
echo -e "Backend:  ${BACKEND_URL}"
echo ""
echo -e "💰 **Cost Savings vs GCP:**"
echo -e "GCP:     ~$70/month"
echo -e "Railway: ~$5-15/month"
echo -e "Savings: ${GREEN}80-90%!${NC}"
echo ""
echo -e "📊 **Next Steps:**"
echo -e "1. Monitor usage in Railway Dashboard"
echo -e "2. Setup custom domain (optional)"
echo -e "3. Configure email settings"
echo -e "4. Add monitoring/alerts"

echo ""
echo -e "${GREEN}🎉 Deployment Check Complete!${NC}"
