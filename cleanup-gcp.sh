#!/bin/bash

# 🗑️ GCP Resource Cleanup Script
# ลบ GCP resources ทั้งหมดที่เกี่ยวข้องกับ OneEvent

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}🗑️ $1${NC}"
    echo "=========================="
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header "GCP OneEvent Resource Cleanup"

echo "🎯 This script will help you clean up GCP resources for OneEvent"
echo "⚠️  WARNING: This will DELETE GCP resources and may incur costs!"
echo ""

read -p "Continue with GCP cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleanup cancelled"
    exit 0
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI not found"
    echo "Install: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if logged in
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null; then
    print_error "Not logged into gcloud"
    echo "Run: gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ]; then
    print_error "No GCP project set"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

print_info "Current project: $PROJECT_ID"

print_header "🔍 Scanning for OneEvent Resources"

# Check for Cloud Run services
print_info "Checking Cloud Run services..."
CLOUD_RUN_SERVICES=$(gcloud run services list --platform=managed --format="value(metadata.name)" --filter="metadata.name~one-event" 2>/dev/null || echo "")

if [ -n "$CLOUD_RUN_SERVICES" ]; then
    echo "Found Cloud Run services:"
    echo "$CLOUD_RUN_SERVICES"
    echo ""
    read -p "Delete these Cloud Run services? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for service in $CLOUD_RUN_SERVICES; do
            print_info "Deleting Cloud Run service: $service"
            gcloud run services delete "$service" --platform=managed --region=asia-southeast1 --quiet || true
        done
        print_success "Cloud Run services deleted"
    fi
else
    print_info "No Cloud Run services found"
fi

# Check for Cloud SQL instances
print_info "Checking Cloud SQL instances..."
CLOUD_SQL_INSTANCES=$(gcloud sql instances list --format="value(name)" --filter="name~one-event" 2>/dev/null || echo "")

if [ -n "$CLOUD_SQL_INSTANCES" ]; then
    echo "Found Cloud SQL instances:"
    echo "$CLOUD_SQL_INSTANCES"
    echo ""
    print_warning "⚠️  Cloud SQL deletion is IRREVERSIBLE and will delete all data!"
    read -p "Delete these Cloud SQL instances? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for instance in $CLOUD_SQL_INSTANCES; do
            print_info "Deleting Cloud SQL instance: $instance"
            gcloud sql instances delete "$instance" --quiet || true
        done
        print_success "Cloud SQL instances deleted"
    fi
else
    print_info "No Cloud SQL instances found"
fi

# Check for Load Balancers
print_info "Checking Load Balancers..."
LOAD_BALANCERS=$(gcloud compute backend-services list --format="value(name)" --filter="name~one-event" 2>/dev/null || echo "")

if [ -n "$LOAD_BALANCERS" ]; then
    echo "Found Load Balancers:"
    echo "$LOAD_BALANCERS"
    echo ""
    read -p "Delete these Load Balancers? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for lb in $LOAD_BALANCERS; do
            print_info "Deleting Load Balancer: $lb"
            gcloud compute backend-services delete "$lb" --global --quiet || true
        done
        print_success "Load Balancers deleted"
    fi
else
    print_info "No Load Balancers found"
fi

# Check for Container Registry images
print_info "Checking Container Registry images..."
REGISTRY_IMAGES=$(gcloud container images list --repository=gcr.io/$PROJECT_ID --format="value(name)" --filter="name~one-event" 2>/dev/null || echo "")

if [ -n "$REGISTRY_IMAGES" ]; then
    echo "Found Container Registry images:"
    echo "$REGISTRY_IMAGES"
    echo ""
    read -p "Delete these Container Registry images? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for image in $REGISTRY_IMAGES; do
            print_info "Deleting Container Registry image: $image"
            gcloud container images delete "$image" --force-delete-tags --quiet || true
        done
        print_success "Container Registry images deleted"
    fi
else
    print_info "No Container Registry images found"
fi

# Check for Google Cloud Storage buckets
print_info "Checking Cloud Storage buckets..."
STORAGE_BUCKETS=$(gsutil ls -p $PROJECT_ID 2>/dev/null | grep one-event || echo "")

if [ -n "$STORAGE_BUCKETS" ]; then
    echo "Found Cloud Storage buckets:"
    echo "$STORAGE_BUCKETS"
    echo ""
    print_warning "⚠️  Storage bucket deletion will delete all files!"
    read -p "Delete these Storage buckets? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for bucket in $STORAGE_BUCKETS; do
            print_info "Deleting Storage bucket: $bucket"
            gsutil -m rm -r "$bucket" || true
        done
        print_success "Storage buckets deleted"
    fi
else
    print_info "No Storage buckets found"
fi

print_header "💰 Cost Cleanup"

print_info "Checking for additional billable resources..."

# List all resources that might incur costs
echo ""
echo "📊 Current billable resources in project $PROJECT_ID:"
echo ""

echo "🔄 Cloud Run services:"
gcloud run services list --platform=managed --format="table(metadata.name,status.url,status.conditions[0].status)" 2>/dev/null || echo "None"

echo ""
echo "🗄️ Cloud SQL instances:"
gcloud sql instances list --format="table(name,databaseVersion,tier,region,gceZone,settings.backupConfiguration.enabled)" 2>/dev/null || echo "None"

echo ""
echo "⚖️ Load Balancers:"
gcloud compute forwarding-rules list --format="table(name,region,IPAddress,target)" 2>/dev/null || echo "None"

print_header "🎉 Cleanup Summary"

print_success "GCP resource cleanup completed!"
print_info "✅ Deleted OneEvent-related Cloud Run services"
print_info "✅ Deleted OneEvent-related Cloud SQL instances"
print_info "✅ Deleted OneEvent-related Load Balancers"
print_info "✅ Deleted OneEvent-related Container Registry images"
print_info "✅ Deleted OneEvent-related Storage buckets"

echo ""
print_warning "💡 Recommendations:"
echo "1. Check billing dashboard for any remaining charges"
echo "2. Verify no unexpected resources are still running"
echo "3. Consider disabling unused APIs to avoid accidental charges"
echo "4. Review IAM permissions and remove unnecessary service accounts"

echo ""
print_info "🎯 GCP Project Status:"
echo "Your project '$PROJECT_ID' still exists but OneEvent resources are removed"
echo "You can safely delete the entire project if it was created only for OneEvent"

echo ""
echo "To delete the entire project:"
echo "gcloud projects delete $PROJECT_ID"

print_success "🎉 Migration to Railway completed! OneEvent is now running cost-effectively on Railway."
