#!/bin/bash

# 🔍 Railway Debug Helper
# ช่วยดู logs และ debug Railway deployment

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

show_help() {
    echo "Railway Debug Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status     Show Railway project status"
    echo "  logs       Show logs for all services"
    echo "  vars       Show environment variables"
    echo "  test       Test deployed services"
    echo "  help       Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 status   # Show project status"
    echo "  $0 logs     # Show recent logs"
    echo "  $0 test     # Test deployed URLs"
}

check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI not found${NC}"
        echo "Install: npm install -g @railway/cli"
        exit 1
    fi
}

show_status() {
    print_header "Railway Project Status"
    
    echo "🔐 Checking authentication..."
    if railway whoami > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Logged in as: $(railway whoami)${NC}"
    else
        echo -e "${RED}❌ Not logged in${NC}"
        echo "Run: railway login"
        return 1
    fi
    
    echo ""
    echo "📊 Project Status:"
    railway status || echo "No project linked. Run: railway link"
}

show_logs() {
    print_header "Railway Service Logs"
    
    echo "📋 Recent logs from all services:"
    railway logs --limit 50 || echo "No logs available or project not linked"
}

show_variables() {
    print_header "Environment Variables"
    
    echo "🔧 Project environment variables:"
    railway variables || echo "No variables set or project not linked"
}

test_services() {
    print_header "Testing Deployed Services"
    
    echo "🧪 Testing services..."
    
    read -p "Enter Backend URL (or press Enter to skip): " BACKEND_URL
    read -p "Enter Frontend URL (or press Enter to skip): " FRONTEND_URL
    
    if [ -n "$BACKEND_URL" ]; then
        echo ""
        echo "Testing Backend: $BACKEND_URL"
        
        # Remove trailing slash
        BACKEND_URL=${BACKEND_URL%/}
        
        echo -n "Health check: "
        if curl -s --max-time 10 "$BACKEND_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
            
            # Test actual response
            response=$(curl -s "$BACKEND_URL/health" 2>/dev/null || echo "error")
            echo "Response: $response"
        else
            echo -e "${RED}❌ Failed${NC}"
        fi
        
        echo -n "API endpoint: "
        if curl -s --max-time 10 "$BACKEND_URL/api" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ Failed${NC}"
        fi
    fi
    
    if [ -n "$FRONTEND_URL" ]; then
        echo ""
        echo "Testing Frontend: $FRONTEND_URL"
        
        # Remove trailing slash
        FRONTEND_URL=${FRONTEND_URL%/}
        
        echo -n "Frontend loading: "
        if curl -s --max-time 10 "$FRONTEND_URL" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ Failed${NC}"
        fi
    fi
}

debug_common_issues() {
    print_header "Common Issues Debug"
    
    echo "🔍 Checking common deployment issues..."
    
    # Check if files exist
    echo ""
    echo "📁 Configuration Files:"
    
    if [ -f "one-event-be/railway.json" ]; then
        echo -e "${GREEN}✅ Backend railway.json${NC}"
    else
        echo -e "${RED}❌ Missing backend railway.json${NC}"
    fi
    
    if [ -f "one-event-fe/railway.json" ]; then
        echo -e "${GREEN}✅ Frontend railway.json${NC}"
    else
        echo -e "${RED}❌ Missing frontend railway.json${NC}"
    fi
    
    if [ -f "one-event-fe/Dockerfile.railway" ]; then
        echo -e "${GREEN}✅ Frontend Dockerfile.railway${NC}"
    else
        echo -e "${RED}❌ Missing frontend Dockerfile.railway${NC}"
    fi
    
    # Check git status
    echo ""
    echo "📦 Git Status:"
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo -e "${YELLOW}⚠️  Uncommitted changes${NC}"
        echo "Run: git add . && git commit && git push"
    else
        echo -e "${GREEN}✅ All changes committed${NC}"
    fi
    
    # Check package.json scripts
    echo ""
    echo "🔧 Package.json Scripts:"
    
    if grep -q "start:prod" "one-event-be/package.json" 2>/dev/null; then
        echo -e "${GREEN}✅ Backend start:prod script${NC}"
    else
        echo -e "${RED}❌ Missing backend start:prod script${NC}"
    fi
    
    if grep -q "build" "one-event-fe/package.json" 2>/dev/null; then
        echo -e "${GREEN}✅ Frontend build script${NC}"
    else
        echo -e "${RED}❌ Missing frontend build script${NC}"
    fi
}

# Main function
main() {
    case "${1:-help}" in
        "status")
            check_railway_cli
            show_status
            ;;
        "logs")
            check_railway_cli
            show_logs
            ;;
        "vars")
            check_railway_cli
            show_variables
            ;;
        "test")
            test_services
            ;;
        "debug")
            debug_common_issues
            ;;
        "all")
            check_railway_cli
            show_status
            show_logs
            show_variables
            debug_common_issues
            ;;
        "help")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
