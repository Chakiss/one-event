#!/bin/bash

# 🔍 GCP Cleanup Verification Script
# ตรวจสอบว่าไม่มี GCP resources ที่ยังใช้งานอยู่

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

print_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

check_gcloud_auth() {
    print_info "Checking GCP authentication..."
    
    if ! command -v gcloud &> /dev/null; then
        print_warning "gcloud CLI not installed"
        return 1
    fi
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1 > /dev/null 2>&1; then
        print_warning "Not authenticated with GCP"
        echo "Run: gcloud auth login"
        return 1
    fi
    
    local active_account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
    print_success "Authenticated as: $active_account"
    return 0
}

check_project() {
    print_info "Checking GCP project..."
    
    local current_project=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -z "$current_project" ]; then
        print_warning "No GCP project set"
        echo "Run: gcloud config set project YOUR_PROJECT_ID"
        return 1
    fi
    
    print_success "Current project: $current_project"
    echo "$current_project"
    return 0
}

verify_cleanup() {
    local project=$1
    
    print_info "Verifying cleanup for project: $project"
    
    # Check Cloud Run services
    print_info "🔍 Checking Cloud Run services..."
    local run_services=$(gcloud run services list --region=asia-southeast1 --format="value(metadata.name)" 2>/dev/null | grep -E "(one-event|onevent)" || echo "")
    
    if [ -z "$run_services" ]; then
        print_success "No OneEvent Cloud Run services found"
    else
        print_error "Found OneEvent Cloud Run services:"
        echo "$run_services"
    fi
    
    # Check Cloud SQL instances
    print_info "🔍 Checking Cloud SQL instances..."
    local sql_instances=$(gcloud sql instances list --format="value(name)" 2>/dev/null | grep -E "(one-event|onevent)" || echo "")
    
    if [ -z "$sql_instances" ]; then
        print_success "No OneEvent Cloud SQL instances found"
    else
        print_error "Found OneEvent Cloud SQL instances:"
        echo "$sql_instances"
    fi
    
    # Check Artifact Registry repositories
    print_info "🔍 Checking Artifact Registry..."
    local artifacts=$(gcloud artifacts repositories list --format="value(name)" 2>/dev/null | grep -E "(one-event|onevent)" || echo "")
    
    if [ -z "$artifacts" ]; then
        print_success "No OneEvent Artifact Registry repositories found"
    else
        print_error "Found OneEvent Artifact Registry repositories:"
        echo "$artifacts"
    fi
    
    # Check Load Balancers
    print_info "🔍 Checking Load Balancers..."
    local load_balancers=$(gcloud compute url-maps list --format="value(name)" 2>/dev/null | grep -E "(one-event|onevent)" || echo "")
    
    if [ -z "$load_balancers" ]; then
        print_success "No OneEvent Load Balancers found"
    else
        print_error "Found OneEvent Load Balancers:"
        echo "$load_balancers"
    fi
    
    # Check Secret Manager
    print_info "🔍 Checking Secret Manager..."
    local secrets=$(gcloud secrets list --format="value(name)" 2>/dev/null | grep -E "(one-event|onevent)" || echo "")
    
    if [ -z "$secrets" ]; then
        print_success "No OneEvent secrets found"
    else
        print_error "Found OneEvent secrets:"
        echo "$secrets"
    fi
    
    # Check Service Accounts
    print_info "🔍 Checking Service Accounts..."
    local service_accounts=$(gcloud iam service-accounts list --format="value(email)" 2>/dev/null | grep -E "(one-event|onevent)" || echo "")
    
    if [ -z "$service_accounts" ]; then
        print_success "No OneEvent service accounts found"
    else
        print_error "Found OneEvent service accounts:"
        echo "$service_accounts"
    fi
}

check_billing() {
    print_info "🔍 Checking billing status..."
    
    local project=$1
    local billing_account=$(gcloud beta billing projects describe "$project" --format="value(billingAccountName)" 2>/dev/null || echo "")
    
    if [ -z "$billing_account" ]; then
        print_success "No billing account linked to project"
    else
        print_warning "Billing account still linked: $billing_account"
        print_info "Consider unlinking billing if project not needed"
    fi
}

estimate_costs() {
    print_info "💰 Cost estimation..."
    echo ""
    echo "Before cleanup (estimated):"
    echo "  Cloud Run: $20-30/month"
    echo "  Cloud SQL: $30-40/month"  
    echo "  Load Balancer: $10-15/month"
    echo "  Storage/Networking: $5-10/month"
    echo "  Total: ~$65-95/month"
    echo ""
    echo "After cleanup:"
    echo "  GCP: $0/month"
    echo "  Railway: $5-15/month"
    echo "  Savings: $50-80/month (70-85%)"
}

main() {
    print_header "🔍 GCP OneEvent Cleanup Verification"
    
    if ! check_gcloud_auth; then
        exit 1
    fi
    
    project=$(check_project)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    verify_cleanup "$project"
    check_billing "$project"
    estimate_costs
    
    echo ""
    print_header "📋 Summary"
    print_info "If any OneEvent resources were found above, run:"
    echo "  ./cleanup-gcp.sh"
    echo ""
    print_info "To completely remove project:"
    echo "  gcloud projects delete $project"
    echo ""
    print_success "Verification completed!"
}

main "$@"
