#!/bin/bash

# OneEvent - Check Billing Status
# ตรวจสอบสถานะ billing ของ project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="one-event-production"

echo -e "${BLUE}🔍 OneEvent - Billing Status Check${NC}"
echo "=================================="

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if project exists
if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
    print_error "Project $PROJECT_ID not found"
    exit 1
fi

print_status "Project $PROJECT_ID exists"

# Check billing status
echo -e "\n${BLUE}📋 Billing Information${NC}"
echo "Project ID: $PROJECT_ID"

BILLING_INFO=$(gcloud billing projects describe $PROJECT_ID --format="json" 2>/dev/null || echo '{}')

if echo "$BILLING_INFO" | grep -q '"billingEnabled": true'; then
    BILLING_ACCOUNT=$(echo "$BILLING_INFO" | grep -o '"billingAccountName": "[^"]*"' | cut -d'"' -f4)
    print_status "Billing is ENABLED"
    echo "Billing Account: $BILLING_ACCOUNT"
    
    echo -e "\n${GREEN}🎉 Ready to proceed!${NC}"
    echo "You can now run: ./scripts/setup-gcp-auto-deploy.sh"
    
elif echo "$BILLING_INFO" | grep -q '"billingEnabled": false'; then
    print_warning "Billing is DISABLED"
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo "1. Run: ./scripts/setup-billing.sh"
    echo "2. Follow the billing setup instructions"
    echo "3. Run this script again to verify"
    
else
    print_error "Unable to determine billing status"
    echo "Raw billing info: $BILLING_INFO"
fi

# Show available billing accounts
echo -e "\n${BLUE}💳 Available Billing Accounts${NC}"
gcloud billing accounts list 2>/dev/null || print_warning "No billing accounts found or access denied"

echo -e "\n${BLUE}🔗 Quick Links${NC}"
echo "- Billing Console: https://console.cloud.google.com/billing"
echo "- Project Billing: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
echo "- Free Tier: https://cloud.google.com/free"
