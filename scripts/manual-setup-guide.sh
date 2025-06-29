#!/bin/bash

# OneEvent - Simple Manual Setup Guide
# ให้ทำทีละขั้นตอนตามคำแนะนำนี้

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OneEvent Auto-Deployment Setup Guide${NC}"
echo "=============================================="

print_step() {
    echo -e "\n${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_instruction() {
    echo -e "${YELLOW}👉 $1${NC}"
}

# Check current status
print_step "ตรวจสอบสถานะปัจจุบัน"

# Check gcloud
if command -v gcloud &> /dev/null; then
    print_success "Google Cloud CLI ติดตั้งแล้ว ($(gcloud --version | head -1))"
    
    # Check if authenticated
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        GCLOUD_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
        print_success "Authenticated as: $GCLOUD_ACCOUNT"
        GCLOUD_AUTH=true
    else
        print_warning "ยังไม่ได้ login gcloud"
        GCLOUD_AUTH=false
    fi
else
    print_warning "Google Cloud CLI ยังไม่ได้ติดตั้ง"
    GCLOUD_AUTH=false
fi

# Check GitHub CLI
if command -v gh &> /dev/null; then
    print_success "GitHub CLI ติดตั้งแล้ว ($(gh --version | head -1))"
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        GH_USER=$(gh api user --jq .login 2>/dev/null || echo "Unknown")
        print_success "Authenticated as: $GH_USER"
        GH_AUTH=true
    else
        print_warning "ยังไม่ได้ login GitHub CLI"
        GH_AUTH=false
    fi
else
    print_warning "GitHub CLI ยังไม่ได้ติดตั้ง"
    GH_AUTH=false
fi

echo ""
echo "=============================================="

# Manual setup instructions
if [ "$GCLOUD_AUTH" = false ]; then
    print_step "ขั้นตอนที่ 1: Login Google Cloud"
    print_instruction "เปิด browser ไปที่: https://accounts.google.com/oauth/authorize?..."
    print_instruction "หรือรันคำสั่ง: gcloud auth login"
    echo ""
    print_instruction "กด Enter เมื่อ login เสร็จแล้ว..."
    read -p ""
fi

if [ "$GH_AUTH" = false ]; then
    print_step "ขั้นตอนที่ 2: Login GitHub"
    print_instruction "1. ไปที่ https://github.com/settings/tokens/new"
    print_instruction "2. สร้าง Personal Access Token ด้วย scopes: repo, workflow, admin:org"
    print_instruction "3. Copy token และรันคำสั่ง:"
    echo "   gh auth login --with-token"
    echo ""
    print_instruction "กด Enter เมื่อ login เสร็จแล้ว..."
    read -p ""
fi

print_step "ขั้นตอนที่ 3: ตั้งค่า GCP Project"

echo -e "${YELLOW}ตอนนี้คุณต้องทำต่อไปนี้ใน GCP Console:${NC}"
echo ""
echo "1. ไปที่ https://console.cloud.google.com/"
echo "2. สร้าง Project ใหม่ชื่อ 'one-event-production'"
echo "3. เปิด Billing สำหรับ project นี้"
echo "4. เปิด APIs ต่อไปนี้:"
echo "   - Cloud Run API"
echo "   - Cloud Build API"
echo "   - Artifact Registry API"
echo "   - Secret Manager API"
echo "   - Cloud SQL Admin API"
echo ""

print_step "ขั้นตอนที่ 4: สร้าง Service Account"

echo -e "${YELLOW}ใน GCP Console:${NC}"
echo ""
echo "1. ไปที่ IAM & Admin > Service Accounts"
echo "2. สร้าง Service Account ชื่อ 'github-actions-sa'"
echo "3. ให้ Roles ต่อไปนี้:"
echo "   - Cloud Run Admin"
echo "   - Artifact Registry Admin"
echo "   - Secret Manager Secret Accessor"
echo "   - Service Account User"
echo "4. สร้าง JSON Key และดาวน์โหลด"
echo ""

print_step "ขั้นตอนที่ 5: ตั้งค่า GitHub Secrets"

echo -e "${YELLOW}ใน GitHub Repository (https://github.com/Chakiss/one-event):${NC}"
echo ""
echo "1. ไปที่ Settings > Secrets and variables > Actions"
echo "2. เพิ่ม Repository secrets:"
echo "   - GCP_SA_KEY: (เนื้อหาของไฟล์ JSON key ที่ดาวน์โหลดมา)"
echo "   - GCP_PROJECT_ID: one-event-production"
echo "   - GCP_REGION: asia-southeast1"
echo ""

print_step "ขั้นตอนที่ 6: สร้าง Artifact Registry"

echo -e "${YELLOW}ใน GCP Console:${NC}"
echo ""
echo "1. ไปที่ Artifact Registry"
echo "2. สร้าง Repository ใหม่:"
echo "   - Name: one-event-repo"
echo "   - Format: Docker"
echo "   - Location: asia-southeast1"
echo ""

print_step "ขั้นตอนสุดท้าย: ทดสอบ Auto-Deployment"

echo -e "${YELLOW}ใน Terminal:${NC}"
echo ""
echo "1. แก้ไขไฟล์อะไรก็ได้ในโปรเจ็ค"
echo "2. รัน:"
echo "   git add ."
echo "   git commit -m \"Test auto-deployment\""
echo "   git push origin main"
echo ""
echo "3. ไปดูที่ GitHub Actions: https://github.com/Chakiss/one-event/actions"
echo "4. ถ้าสำเร็จจะได้ URL ของ app ที่รันบน GCP Cloud Run"
echo ""

print_step "🎯 สรุป"

echo -e "${GREEN}เมื่อตั้งค่าเสร็จแล้ว:${NC}"
echo "✅ Push ไป main branch = Deploy ขึ้น Production"
echo "✅ Push ไป develop branch = Deploy ขึ้น Development"
echo "✅ ดู deployment ได้ที่ GitHub Actions"
echo "✅ ดู services ได้ที่ GCP Cloud Run"
echo ""

print_warning "หากต้องการความช่วยเหลือ ดูได้ที่:"
echo "📖 docs/AUTO_DEPLOYMENT_GUIDE.md"
echo "🚀 QUICK_START_AUTO_DEPLOY.md"
echo ""

echo -e "${BLUE}🎉 Happy Deploying! 🚀${NC}"
