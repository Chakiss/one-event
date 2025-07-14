#!/bin/bash

# 🚀 OneEvent Quick Deploy to GCP
# This script provides a complete deployment solution from local to GCP

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}🚀 $1${NC}"
    echo "=================================="
}

print_banner() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           OneEvent GCP Deploy         ║${NC}"
    echo -e "${BLUE}║     From Local to Cloud in Minutes   ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
    echo ""
}

# Configuration
PROJECT_ID="one-event-production"
REGION="asia-southeast1"

print_banner

# Check if running from correct directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_header "Choose Deployment Option"

echo "1. 🔧 Prepare environment only (check requirements & setup)"
echo "2. 🚀 Full deployment (prepare + deploy)"
echo "3. 📦 Deploy only (skip preparation)"
echo "4. 🧪 Test local production first"
echo "5. 📊 Check current GCP status"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_step "Running preparation script..."
        ./scripts/prepare-gcp-deploy.sh
        ;;
    2)
        print_step "Running full deployment..."
        ./scripts/prepare-gcp-deploy.sh
        ;;
    3)
        print_step "Running deployment only..."
        ./scripts/deploy-to-gcp.sh
        ;;
    4)
        print_step "Testing local production environment..."
        
        print_info "Starting local production services..."
        docker compose -f docker-compose.prod.yml down -v
        docker compose -f docker-compose.prod.yml up -d
        
        print_info "Waiting for services to start..."
        sleep 30
        
        print_info "Testing services..."
        
        # Test Backend
        if curl -f http://localhost:3000/health > /dev/null 2>&1; then
            print_success "Backend is healthy: http://localhost:3000"
            print_info "API Documentation: http://localhost:3000/api"
        else
            print_warning "Backend health check failed"
        fi
        
        # Test Frontend
        if curl -f http://localhost > /dev/null 2>&1; then
            print_success "Frontend is accessible: http://localhost"
        else
            print_warning "Frontend is not accessible"
        fi
        
        # Show logs
        print_info "Recent logs:"
        docker compose -f docker-compose.prod.yml logs --tail=5
        
        print_info "Local production test complete!"
        print_info "Visit: http://localhost"
        ;;
    5)
        print_step "Checking current GCP status..."
        
        print_info "Current GCP project:"
        gcloud config get-value project
        
        print_info "Cloud Run services:"
        gcloud run services list --region=$REGION
        
        print_info "Cloud SQL instances:"
        gcloud sql instances list
        
        print_info "Artifact Registry repositories:"
        gcloud artifacts repositories list --location=$REGION
        
        print_info "Recent deployments:"
        gcloud run revisions list --region=$REGION --limit=5
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

print_header "Deployment Summary"

# Show current status
print_info "📊 Current Status:"

# Check if services are deployed
if gcloud run services describe one-event-web-prod --region=$REGION > /dev/null 2>&1; then
    FRONTEND_URL=$(gcloud run services describe one-event-web-prod --region=$REGION --format="value(status.url)")
    print_success "Frontend: $FRONTEND_URL"
else
    print_warning "Frontend: Not deployed"
fi

if gcloud run services describe one-event-api-prod --region=$REGION > /dev/null 2>&1; then
    BACKEND_URL=$(gcloud run services describe one-event-api-prod --region=$REGION --format="value(status.url)")
    print_success "Backend: $BACKEND_URL"
    print_info "API Docs: $BACKEND_URL/api"
else
    print_warning "Backend: Not deployed"
fi

print_info "🔧 Useful Commands:"
echo "   • View logs: gcloud logs read --log-filter=\"resource.type=cloud_run_revision\""
echo "   • List services: gcloud run services list --region=$REGION"
echo "   • Update service: gcloud run deploy [SERVICE_NAME] --image=[IMAGE_URL]"
echo "   • Delete service: gcloud run services delete [SERVICE_NAME] --region=$REGION"
echo ""

print_info "🌐 GCP Console Links:"
echo "   • Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "   • Cloud SQL: https://console.cloud.google.com/sql?project=$PROJECT_ID"
echo "   • Artifact Registry: https://console.cloud.google.com/artifacts?project=$PROJECT_ID"
echo ""

print_success "OneEvent deployment operations complete!"
