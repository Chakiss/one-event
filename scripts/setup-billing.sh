#!/bin/bash

# OneEvent - Billing Setup Guide
# สคริปต์นี้จะแนะนำวิธีตั้งค่า Billing ใน GCP

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="one-event-production"

echo -e "${BLUE}🚀 OneEvent - GCP Billing Setup${NC}"
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

print_instruction() {
    echo -e "${YELLOW}👉 $1${NC}"
}

# Check if project exists
if gcloud projects describe $PROJECT_ID &> /dev/null; then
    print_status "Project $PROJECT_ID exists"
else
    print_error "Project $PROJECT_ID not found"
    exit 1
fi

echo -e "\n${BLUE}📋 ขั้นตอนการตั้งค่า Billing${NC}"
echo "=================================="

print_warning "ตอนนี้ project ของคุณยังไม่มี billing account"
print_instruction "คุณต้องตั้งค่า billing ก่อนจึงจะใช้ GCP services ได้"

echo -e "\n${YELLOW}วิธีที่ 1: ใช้ GCP Console (แนะนำ)${NC}"
echo "1. เปิด: https://console.cloud.google.com/billing"
echo "2. คลิก 'Create Account' หรือเลือก billing account ที่มีอยู่"
echo "3. ไปที่: https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
echo "4. เลือก billing account และคลิก 'Set Account'"

echo -e "\n${YELLOW}วิธีที่ 2: ใช้ Command Line${NC}"
echo "1. ดู billing accounts ที่มี:"
echo "   gcloud billing accounts list"
echo ""
echo "2. Link billing account กับ project:"
echo "   gcloud billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID"

echo -e "\n${BLUE}🔍 ตรวจสอบสถานะ Billing${NC}"
echo "รันคำสั่งนี้เพื่อตรวจสอบ:"
echo "gcloud billing projects describe $PROJECT_ID"

echo -e "\n${BLUE}📋 ขั้นตอนต่อไป${NC}"
echo "เมื่อตั้งค่า billing เสร็จแล้ว:"
echo "1. รัน: ./scripts/setup-gcp-auto-deploy.sh"
echo "2. หรือรัน: ./scripts/check-billing-status.sh"

echo -e "\n${GREEN}💡 Tips${NC}"
echo "- Google Cloud มี Free Tier สำหรับผู้ใช้ใหม่"
echo "- Cloud Run มี Free Tier 2 million requests ต่อเดือน"
echo "- คุณสามารถตั้ง budget alerts เพื่อควบคุมค่าใช้จ่าย"

echo -e "\n${BLUE}🔗 Links ที่เป็นประโยชน์${NC}"
echo "- Billing Console: https://console.cloud.google.com/billing"
echo "- Free Tier: https://cloud.google.com/free"
echo "- Pricing Calculator: https://cloud.google.com/products/calculator"

echo -e "\n${YELLOW}⚠️  ข้อควรระวัง${NC}"
echo "- ตรวจสอบ pricing ก่อนใช้ services"
echo "- ตั้ง budget alerts"
echo "- ใช้ Free Tier ให้เต็มที่"

echo -e "\n${BLUE}🎯 สรุป${NC}"
echo "1. ตั้งค่า billing account ใน GCP Console"
echo "2. Link billing account กับ project $PROJECT_ID"
echo "3. รัน ./scripts/setup-gcp-auto-deploy.sh อีกครั้ง"
