#!/bin/bash

# OneEvent GCP Setup Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="one-event-production"
REGION="asia-southeast1"
ZONE="asia-southeast1-a"

echo -e "${GREEN}🚀 Setting up OneEvent on Google Cloud Platform${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  You are not authenticated with Google Cloud. Please login.${NC}"
    gcloud auth login
fi

echo -e "${GREEN}📋 Step 1: Creating GCP Project${NC}"
# Create project if it doesn't exist
if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
    echo "Creating project: $PROJECT_ID"
    gcloud projects create $PROJECT_ID --name="OneEvent Production"
else
    echo "Project $PROJECT_ID already exists"
fi

# Set default project
gcloud config set project $PROJECT_ID

echo -e "${GREEN}💳 Step 2: Enabling Billing (Manual step required)${NC}"
echo "Please enable billing for project $PROJECT_ID in the GCP Console:"
echo "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
echo "Press Enter to continue after enabling billing..."
read

echo -e "${GREEN}🔧 Step 3: Enabling Required APIs${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    compute.googleapis.com \
    container.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iam.googleapis.com

echo -e "${GREEN}🏗️  Step 4: Setting up Terraform Backend${NC}"
# Create bucket for Terraform state
TERRAFORM_BUCKET="$PROJECT_ID-terraform-state"
if ! gsutil ls gs://$TERRAFORM_BUCKET &> /dev/null; then
    echo "Creating Terraform state bucket: $TERRAFORM_BUCKET"
    gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$TERRAFORM_BUCKET
    gsutil versioning set on gs://$TERRAFORM_BUCKET
else
    echo "Terraform state bucket already exists"
fi

echo -e "${GREEN}🔐 Step 5: Creating Service Account for CI/CD${NC}"
SERVICE_ACCOUNT_NAME="github-actions-deploy"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Create service account if it doesn't exist
if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
    echo "Creating service account: $SERVICE_ACCOUNT_NAME"
    gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --description="Service account for GitHub Actions deployment" \
        --display-name="GitHub Actions Deploy"
else
    echo "Service account already exists"
fi

# Assign roles to service account
ROLES=(
    "roles/run.admin"
    "roles/cloudsql.admin"
    "roles/artifactregistry.admin"
    "roles/secretmanager.admin"
    "roles/iam.serviceAccountUser"
    "roles/cloudbuild.builds.editor"
    "roles/storage.admin"
)

for role in "${ROLES[@]}"; do
    echo "Assigning role: $role"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$role"
done

echo -e "${GREEN}🔑 Step 6: Creating Service Account Key${NC}"
KEY_FILE="$SERVICE_ACCOUNT_NAME-key.json"
if [ ! -f "$KEY_FILE" ]; then
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SERVICE_ACCOUNT_EMAIL
    echo "Service account key created: $KEY_FILE"
    echo -e "${YELLOW}⚠️  Please add this key as GCP_SA_KEY secret in your GitHub repository${NC}"
else
    echo "Service account key file already exists"
fi

echo -e "${GREEN}🏗️  Step 7: Initializing Terraform${NC}"
cd infrastructure/terraform
terraform init

echo -e "${GREEN}📊 Step 8: Planning Terraform deployment${NC}"
terraform plan -var="project_id=$PROJECT_ID" -var="region=$REGION"

echo -e "${YELLOW}🤔 Do you want to apply the Terraform configuration? (y/N)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${GREEN}🚀 Applying Terraform configuration${NC}"
    terraform apply -var="project_id=$PROJECT_ID" -var="region=$REGION" -auto-approve
else
    echo "Terraform apply skipped. You can run it manually later."
fi

echo -e "${GREEN}✅ GCP Setup Complete!${NC}"
echo ""
echo -e "${GREEN}📋 Next Steps:${NC}"
echo "1. Add the service account key ($KEY_FILE) as GCP_SA_KEY secret in GitHub"
echo "2. Configure your domain and SSL certificates"
echo "3. Set up monitoring and alerting"
echo "4. Configure backup and disaster recovery"
echo ""
echo -e "${GREEN}🔗 Useful Links:${NC}"
echo "• GCP Console: https://console.cloud.google.com/home/dashboard?project=$PROJECT_ID"
echo "• Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "• Cloud SQL: https://console.cloud.google.com/sql/instances?project=$PROJECT_ID"
echo "• Artifact Registry: https://console.cloud.google.com/artifacts?project=$PROJECT_ID"
echo ""
echo -e "${GREEN}🎉 Happy Deploying!${NC}"
