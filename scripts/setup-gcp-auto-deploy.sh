#!/bin/bash

# OneEvent - GCP Setup และ GitHub Secrets Configuration
# ใช้ script นี้เพื่อตั้งค่า GCP และ GitHub secrets สำหรับ auto-deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="one-event-production"
REGION="asia-southeast1"
REPOSITORY="one-event-repo"
SERVICE_ACCOUNT_NAME="github-actions-sa"
GITHUB_REPO="Chakiss/one-event"

echo -e "${BLUE}🚀 OneEvent GCP Setup & GitHub Integration${NC}"
echo "=================================================="

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if user is logged in to gcloud
check_gcloud_auth() {
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "You are not logged in to gcloud. Please run 'gcloud auth login' first."
        exit 1
    fi
    print_status "Authenticated with gcloud"
}

# Check if GitHub CLI is installed and authenticated
check_github_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI is not installed. Please install it: https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        print_error "You are not authenticated with GitHub CLI. Please run 'gh auth login' first."
        exit 1
    fi
    print_status "Authenticated with GitHub CLI"
}

# Step 1: Create GCP Project (if not exists)
setup_gcp_project() {
    echo -e "\n${BLUE}📋 Step 1: Setting up GCP Project${NC}"
    
    if gcloud projects describe $PROJECT_ID &> /dev/null; then
        print_status "Project $PROJECT_ID already exists"
    else
        print_warning "Creating new project: $PROJECT_ID"
        gcloud projects create $PROJECT_ID --name="OneEvent Production"
    fi
    
    # Set the project as default
    gcloud config set project $PROJECT_ID
    print_status "Set project $PROJECT_ID as default"
}

# Step 2: Enable required APIs
enable_apis() {
    echo -e "\n${BLUE}🔧 Step 2: Enabling required APIs${NC}"
    
    apis=(
        "run.googleapis.com"
        "cloudbuild.googleapis.com"
        "artifactregistry.googleapis.com"
        "secretmanager.googleapis.com"
        "sql-component.googleapis.com"
        "sqladmin.googleapis.com"
        "iam.googleapis.com"
        "cloudresourcemanager.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        echo "Enabling $api..."
        gcloud services enable $api
    done
    
    print_status "All required APIs enabled"
}

# Step 3: Create Artifact Registry repository
setup_artifact_registry() {
    echo -e "\n${BLUE}📦 Step 3: Setting up Artifact Registry${NC}"
    
    if gcloud artifacts repositories describe $REPOSITORY --location=$REGION &> /dev/null; then
        print_status "Artifact Registry repository already exists"
    else
        gcloud artifacts repositories create $REPOSITORY \
            --repository-format=docker \
            --location=$REGION \
            --description="OneEvent Docker images"
        print_status "Artifact Registry repository created"
    fi
}

# Step 4: Create Service Account for GitHub Actions
setup_service_account() {
    echo -e "\n${BLUE}🔐 Step 4: Setting up Service Account${NC}"
    
    # Create service account
    if gcloud iam service-accounts describe $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
        print_status "Service account already exists"
    else
        gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
            --display-name="GitHub Actions Service Account" \
            --description="Service account for GitHub Actions deployment"
        print_status "Service account created"
    fi
    
    # Grant necessary roles
    roles=(
        "roles/run.admin"
        "roles/iam.serviceAccountUser"
        "roles/artifactregistry.admin"
        "roles/cloudsql.client"
        "roles/secretmanager.secretAccessor"
        "roles/storage.admin"
    )
    
    for role in "${roles[@]}"; do
        gcloud projects add-iam-policy-binding $PROJECT_ID \
            --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
            --role="$role"
    done
    
    print_status "Service account roles assigned"
}

# Step 5: Generate service account key
generate_service_account_key() {
    echo -e "\n${BLUE}🔑 Step 5: Generating Service Account Key${NC}"
    
    KEY_FILE="./gcp-service-account-key.json"
    
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com
    
    print_status "Service account key generated: $KEY_FILE"
    print_warning "Keep this file secure and don't commit it to version control!"
}

# Step 6: Create Cloud SQL database
setup_database() {
    echo -e "\n${BLUE}🗄️  Step 6: Setting up Cloud SQL Database${NC}"
    
    DB_INSTANCE_NAME="one-event-db"
    
    if gcloud sql instances describe $DB_INSTANCE_NAME &> /dev/null; then
        print_status "Cloud SQL instance already exists"
    else
        print_warning "Creating Cloud SQL instance (this may take several minutes)..."
        gcloud sql instances create $DB_INSTANCE_NAME \
            --database-version=POSTGRES_14 \
            --tier=db-f1-micro \
            --region=$REGION \
            --storage-type=SSD \
            --storage-size=10GB \
            --storage-auto-increase
        print_status "Cloud SQL instance created"
    fi
    
    # Create database
    gcloud sql databases create one_event_prod --instance=$DB_INSTANCE_NAME || true
    gcloud sql databases create one_event_dev --instance=$DB_INSTANCE_NAME || true
    
    print_status "Databases created"
}

# Step 7: Create secrets in Secret Manager
setup_secrets() {
    echo -e "\n${BLUE}🔒 Step 7: Setting up Secret Manager${NC}"
    
    # Generate random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Create secrets
    echo -n "$JWT_SECRET" | gcloud secrets create one-event-jwt-secret-prod --data-file=- || true
    echo -n "$JWT_SECRET" | gcloud secrets create one-event-jwt-secret-dev --data-file=- || true
    
    # Database URLs (you'll need to update these with actual credentials)
    DB_INSTANCE_IP=$(gcloud sql instances describe one-event-db --format="value(ipAddresses[0].ipAddress)")
    
    echo -n "postgresql://postgres:YOUR_PASSWORD@$DB_INSTANCE_IP:5432/one_event_prod" | \
        gcloud secrets create one-event-db-url-prod --data-file=- || true
    
    echo -n "postgresql://postgres:YOUR_PASSWORD@$DB_INSTANCE_IP:5432/one_event_dev" | \
        gcloud secrets create one-event-db-url-dev --data-file=- || true
    
    print_status "Secrets created in Secret Manager"
    print_warning "Please update the database URLs with your actual database password"
}

# Step 8: Setup GitHub Secrets
setup_github_secrets() {
    echo -e "\n${BLUE}🐙 Step 8: Setting up GitHub Secrets${NC}"
    
    # Set GitHub secrets
    gh secret set GCP_SA_KEY -b"$(cat ./gcp-service-account-key.json)" --repo=$GITHUB_REPO
    gh secret set GCP_PROJECT_ID -b"$PROJECT_ID" --repo=$GITHUB_REPO
    gh secret set GCP_REGION -b"$REGION" --repo=$GITHUB_REPO
    
    print_status "GitHub secrets configured"
}

# Step 9: Cleanup
cleanup() {
    echo -e "\n${BLUE}🧹 Step 9: Cleanup${NC}"
    
    # Remove the service account key file
    if [ -f "./gcp-service-account-key.json" ]; then
        rm ./gcp-service-account-key.json
        print_status "Service account key file removed"
    fi
}

# Main execution
main() {
    echo -e "\n${YELLOW}⚠️  This script will set up GCP resources and GitHub secrets for auto-deployment${NC}"
    echo "Make sure you have the necessary permissions and billing enabled on your GCP account."
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Setup cancelled"
        exit 1
    fi
    
    check_gcloud_auth
    check_github_cli
    setup_gcp_project
    enable_apis
    setup_artifact_registry
    setup_service_account
    generate_service_account_key
    setup_database
    setup_secrets
    setup_github_secrets
    cleanup
    
    echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
    echo "=================================================="
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update your database passwords in Secret Manager"
    echo "2. Push your code to the main branch to trigger deployment"
    echo "3. Monitor the deployment in GitHub Actions"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo "• View Cloud Run services: gcloud run services list"
    echo "• View deployment logs: gh run list --repo=$GITHUB_REPO"
    echo "• View GCP console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
}

# Run the main function
main "$@"
