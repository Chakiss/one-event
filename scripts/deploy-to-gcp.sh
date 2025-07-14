#!/bin/bash

# 🚀 Deploy OneEvent to GCP Cloud Run Script
# This script builds Docker images locally and deploys them to GCP Cloud Run

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
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

# Configuration
PROJECT_ID="one-event-production"
REGION="asia-southeast1"
FRONTEND_IMAGE_NAME="one-event-frontend"
BACKEND_IMAGE_NAME="one-event-backend"
FRONTEND_SERVICE_NAME="one-event-web-prod"
BACKEND_SERVICE_NAME="one-event-api-prod"

# Environment variables
DB_INSTANCE_NAME="one-event-db-prod"
DB_USER="postgres"
DB_PASSWORD="OneEvent2025Secure!"
DB_NAME="one_event_production"

print_header "OneEvent GCP Deployment"

# Check if gcloud is installed and authenticated
print_info "Checking GCP authentication..."
if ! command -v gcloud &> /dev/null; then
    print_error "Google Cloud CLI is not installed"
    print_info "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    print_warning "Not authenticated with Google Cloud"
    print_info "Running: gcloud auth login"
    gcloud auth login
fi

# Set project
print_info "Setting GCP project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Configure Docker to use gcloud as credential helper
print_info "Configuring Docker for GCP..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet

print_header "Building and Pushing Docker Images"

# Build and push Backend image
print_info "Building Backend Docker image..."
cd one-event-be
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/one-event-repo/$BACKEND_IMAGE_NAME:latest .
print_success "Backend image built successfully"

print_info "Pushing Backend image to Artifact Registry..."
docker push $REGION-docker.pkg.dev/$PROJECT_ID/one-event-repo/$BACKEND_IMAGE_NAME:latest
print_success "Backend image pushed successfully"

# Return to root directory
cd ..

# Build and push Frontend image
print_info "Building Frontend Docker image..."
cd one-event-fe
docker build \
    --build-arg NEXT_PUBLIC_API_URL=https://$BACKEND_SERVICE_NAME-712057384144.asia-southeast1.run.app \
    -t $REGION-docker.pkg.dev/$PROJECT_ID/one-event-repo/$FRONTEND_IMAGE_NAME:latest .
print_success "Frontend image built successfully"

print_info "Pushing Frontend image to Artifact Registry..."
docker push $REGION-docker.pkg.dev/$PROJECT_ID/one-event-repo/$FRONTEND_IMAGE_NAME:latest
print_success "Frontend image pushed successfully"

# Return to root directory
cd ..

print_header "Deploying to Cloud Run"

# Deploy Backend
print_info "Deploying Backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE_NAME \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/one-event-repo/$BACKEND_IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "DATABASE_HOST=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME" \
    --set-env-vars "DATABASE_PORT=5432" \
    --set-env-vars "DATABASE_USERNAME=$DB_USER" \
    --set-env-vars "DATABASE_PASSWORD=$DB_PASSWORD" \
    --set-env-vars "DATABASE_NAME=$DB_NAME" \
    --set-env-vars "JWT_SECRET=OneEvent2025JWT_Secret_Key_Very_Secure_Random_String" \
    --set-env-vars "EMAIL_HOST=smtp.gmail.com" \
    --set-env-vars "EMAIL_PORT=587" \
    --set-env-vars "EMAIL_USER=${EMAIL_USER:-your-email@gmail.com}" \
    --set-env-vars "EMAIL_PASS=${EMAIL_PASS:-your-app-password}" \
    --set-env-vars "EMAIL_FROM=${EMAIL_FROM:-OneEvent <your-email@gmail.com>}" \
    --set-env-vars "CORS_ORIGIN=https://$FRONTEND_SERVICE_NAME-712057384144.asia-southeast1.run.app" \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$DB_INSTANCE_NAME

print_success "Backend deployed successfully"

# Get Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE_NAME --region=$REGION --format="value(status.url)")
print_info "Backend URL: $BACKEND_URL"

# Deploy Frontend
print_info "Deploying Frontend to Cloud Run..."
gcloud run deploy $FRONTEND_SERVICE_NAME \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/one-event-repo/$FRONTEND_IMAGE_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3000 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "NEXT_PUBLIC_API_URL=$BACKEND_URL"

print_success "Frontend deployed successfully"

# Get Frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE_NAME --region=$REGION --format="value(status.url)")
print_info "Frontend URL: $FRONTEND_URL"

print_header "Deployment Complete!"

print_success "OneEvent has been successfully deployed to GCP!"
echo ""
print_info "🌐 Access URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo "   API Docs: $BACKEND_URL/api"
echo ""
print_info "🔧 Services:"
echo "   • Frontend: Cloud Run service '$FRONTEND_SERVICE_NAME'"
echo "   • Backend:  Cloud Run service '$BACKEND_SERVICE_NAME'"
echo "   • Database: Cloud SQL instance '$DB_INSTANCE_NAME'"
echo ""
print_info "📊 Monitoring:"
echo "   • Cloud Run Console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "   • Logs: gcloud logs read --log-filter=\"resource.type=cloud_run_revision\""
echo ""

# Health check
print_info "Performing health checks..."
sleep 30

echo "Testing Backend health..."
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed - might need a few more minutes to start"
fi

echo "Testing Frontend..."
if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    print_success "Frontend health check passed"
else
    print_warning "Frontend health check failed - might need a few more minutes to start"
fi

print_success "Deployment script completed!"
