#!/bin/bash

# 🔧 Pre-deployment Setup Script
# This script prepares your local environment for GCP deployment

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

# Configuration
PROJECT_ID="one-event-production"
REGION="asia-southeast1"

print_header "OneEvent GCP Pre-Deployment Setup"

# Check if running from correct directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if local production environment is working
print_info "Checking if local production environment is running..."
if docker compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "Local production environment is running"
    
    print_info "Testing local services..."
    
    # Test Backend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Local Backend is healthy"
    else
        print_warning "Local Backend health check failed"
    fi
    
    # Test Frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Local Frontend is accessible"
    else
        print_warning "Local Frontend is not accessible"
    fi
else
    print_warning "Local production environment is not running"
    print_info "Would you like to start it first? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_info "Starting local production environment..."
        docker compose -f docker-compose.prod.yml up -d
        print_info "Waiting for services to start..."
        sleep 30
    fi
fi

# Check required tools
print_header "Checking Required Tools"

# Check Docker
if command -v docker &> /dev/null; then
    print_success "Docker is installed ($(docker --version | cut -d' ' -f3 | sed 's/,//'))"
else
    print_error "Docker is not installed"
    exit 1
fi

# Check if Docker is running
if docker info > /dev/null 2>&1; then
    print_success "Docker daemon is running"
else
    print_error "Docker daemon is not running. Please start Docker Desktop"
    exit 1
fi

# Check Google Cloud CLI
if command -v gcloud &> /dev/null; then
    print_success "Google Cloud CLI is installed ($(gcloud --version | head -1))"
else
    print_error "Google Cloud CLI is not installed"
    print_info "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check authentication
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    GCLOUD_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
    print_success "Authenticated as: $GCLOUD_ACCOUNT"
else
    print_warning "Not authenticated with Google Cloud"
    print_info "Running: gcloud auth login"
    gcloud auth login
fi

# Check project access
print_info "Checking GCP project access..."
if gcloud projects describe $PROJECT_ID > /dev/null 2>&1; then
    print_success "Can access project: $PROJECT_ID"
else
    print_error "Cannot access project: $PROJECT_ID"
    print_info "Please ensure you have access to the project"
    exit 1
fi

# Set project
gcloud config set project $PROJECT_ID

# Check required APIs
print_header "Checking Required GCP APIs"

REQUIRED_APIS=(
    "run.googleapis.com"
    "sql-component.googleapis.com"
    "sqladmin.googleapis.com"
    "artifactregistry.googleapis.com"
    "cloudbuild.googleapis.com"
)

for api in "${REQUIRED_APIS[@]}"; do
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        print_success "$api is enabled"
    else
        print_warning "$api is not enabled"
        print_info "Enabling $api..."
        gcloud services enable $api
        print_success "$api enabled"
    fi
done

# Check Artifact Registry
print_header "Checking Artifact Registry"

REPO_NAME="one-event-repo"
if gcloud artifacts repositories describe $REPO_NAME --location=$REGION > /dev/null 2>&1; then
    print_success "Artifact Registry repository exists: $REPO_NAME"
else
    print_warning "Artifact Registry repository does not exist"
    print_info "Creating repository: $REPO_NAME"
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="OneEvent Docker images"
    print_success "Repository created: $REPO_NAME"
fi

# Configure Docker for Artifact Registry
print_info "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker $REGION-docker.pkg.dev --quiet
print_success "Docker configured for Artifact Registry"

# Check Cloud SQL instance
print_header "Checking Cloud SQL Database"

DB_INSTANCE_NAME="one-event-db-prod"
if gcloud sql instances describe $DB_INSTANCE_NAME > /dev/null 2>&1; then
    print_success "Cloud SQL instance exists: $DB_INSTANCE_NAME"
    
    # Check if database is ready
    DB_STATE=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(state)")
    if [ "$DB_STATE" = "READY" ]; then
        print_success "Database is ready"
    else
        print_warning "Database state: $DB_STATE"
    fi
else
    print_warning "Cloud SQL instance does not exist: $DB_INSTANCE_NAME"
    print_info "Creating Cloud SQL instance..."
    
    gcloud sql instances create $DB_INSTANCE_NAME \
        --database-version=POSTGRES_14 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-type=SSD \
        --storage-size=10GB \
        --backup-start-time=03:00 \
        --maintenance-window-day=SUN \
        --maintenance-window-hour=04 \
        --deletion-protection
    
    print_success "Cloud SQL instance created"
    
    # Set database password
    print_info "Setting database password..."
    gcloud sql users set-password postgres \
        --instance=$DB_INSTANCE_NAME \
        --password="OneEvent2025Secure!"
    
    # Create database
    print_info "Creating database..."
    gcloud sql databases create one_event_production \
        --instance=$DB_INSTANCE_NAME
    
    print_success "Database setup complete"
fi

# Check environment variables
print_header "Environment Variables Check"

# Create .env file for GCP deployment if it doesn't exist
if [ ! -f ".env.gcp" ]; then
    print_info "Creating .env.gcp file..."
    cat > .env.gcp << EOF
# GCP Deployment Environment Variables
PROJECT_ID=$PROJECT_ID
REGION=$REGION

# Email configuration (update these)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OneEvent <your-email@gmail.com>

# Database
DATABASE_HOST=/cloudsql/$PROJECT_ID:$REGION:$DB_INSTANCE_NAME
DATABASE_PASSWORD=OneEvent2025Secure!

# JWT Secret
JWT_SECRET=OneEvent2025JWT_Secret_Key_Very_Secure_Random_String
EOF
    print_success "Created .env.gcp file"
    print_warning "Please update EMAIL_USER and EMAIL_PASS in .env.gcp"
else
    print_success ".env.gcp file exists"
fi

print_header "Pre-deployment Check Complete!"

print_success "Your environment is ready for GCP deployment!"
echo ""
print_info "📋 Next Steps:"
echo "   1. Update email settings in .env.gcp (if needed)"
echo "   2. Run: ./scripts/deploy-to-gcp.sh"
echo ""
print_info "🔧 Optional:"
echo "   • Test local production: docker compose -f docker-compose.prod.yml up -d"
echo "   • View local app: http://localhost"
echo ""

# Final confirmation
print_info "Would you like to proceed with deployment now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    print_info "Starting deployment..."
    ./scripts/deploy-to-gcp.sh
else
    print_info "Deployment preparation complete. Run './scripts/deploy-to-gcp.sh' when ready."
fi
