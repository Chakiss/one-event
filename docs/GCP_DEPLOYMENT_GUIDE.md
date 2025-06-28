# GCP Deployment Pipeline Guide

## 🚀 Overview
คู่มือการ Deploy OneEvent Application ไปยัง Google Cloud Platform

## 🏗️ Repository Strategy Analysis

### 📁 Monorepo (Single Repository) - RECOMMENDED
**ข้อดี:**
- **Simplified Management**: จัดการ dependencies และ versions ง่าย
- **Atomic Changes**: เปลี่ยนแปลง Frontend + Backend พร้อมกันได้
- **Shared Configuration**: ใช้ CI/CD, linting, testing config ร่วมกัน
- **Code Sharing**: แชร์ types, interfaces, utilities ระหว่าง FE/BE
- **Single Source of Truth**: documentation และ README อยู่ที่เดียว
- **Easier Local Development**: clone repo เดียวได้ทั้งระบบ

**ข้อเสีย:**
- **Larger Repository Size**: ใหญ่กว่า แต่ไม่ส่งผลมากสำหรับ project นี้
- **CI/CD Complexity**: ต้องแยก build paths แต่จัดการได้

**เหมาะสำหรับ:**
- Small to medium teams
- Tightly coupled frontend/backend
- Shared domain logic
- Rapid development cycles

### 📂 Multi-repo (Separate Repositories)
**ข้อดี:**
- **Independent Scaling**: แต่ละ team พัฒนาแยกกันได้
- **Technology Independence**: ใช้ tech stack แยกกันได้
- **Granular Access Control**: ควบคุม permission แยกกัน
- **Independent Release Cycles**: deploy แยกกันได้

**ข้อเสีย:**
- **Coordination Overhead**: ต้องประสานงานระหว่าง repo
- **Dependency Management**: จัดการ API versions ยาก
- **Code Duplication**: types/interfaces ซ้ำกัน
- **Complex Local Setup**: ต้อง clone หลาย repos

## 📋 Prerequisites

### 1. GCP Project Setup
```bash
# สร้าง GCP Project
gcloud projects create one-event-production

# Set default project
gcloud config set project one-event-production

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sql-component.googleapis.com \
    sqladmin.googleapis.com \
    compute.googleapis.com \
    container.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

### 2. Database Setup (Cloud SQL)
```bash
# สร้าง PostgreSQL instance
gcloud sql instances create one-event-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=asia-southeast1 \
    --root-password=your-secure-password

# สร้าง database
gcloud sql databases create one_event_production \
    --instance=one-event-db

# สร้าง user
gcloud sql users create one_event_user \
    --instance=one-event-db \
    --password=your-user-password
```

### 3. Artifact Registry Setup
```bash
# สร้าง Docker repository
gcloud artifacts repositories create one-event-repo \
    --repository-format=docker \
    --location=asia-southeast1 \
    --description="OneEvent application images"
```

## 🏗️ Infrastructure as Code

### 1. Terraform Configuration
สร้างไฟล์ infrastructure/terraform/ สำหรับจัดการ infrastructure

### 2. Cloud Run Services
- Backend API service
- Frontend web service
- Database proxy service (if needed)

## 🔄 CI/CD Pipeline Architecture

### GitHub Actions Workflow:
1. **Build Stage**: Build และ test application
2. **Security Stage**: Security scanning และ vulnerability checks
3. **Build Images**: สร้าง Docker images
4. **Deploy Stage**: Deploy ไปยัง Cloud Run

### Environments:
- **Development**: Auto-deploy จาก develop branch
- **Staging**: Auto-deploy จาก main branch
- **Production**: Manual approval required

## 🔐 Security Best Practices

### 1. Secret Management
- ใช้ Google Secret Manager
- Environment variables แยกตาม environment
- Database credentials rotation

### 2. IAM Permissions
- Service accounts ที่มี least privilege
- Workload Identity สำหรับ GitHub Actions

### 3. Network Security
- VPC และ private subnets
- Cloud Armor สำหรับ DDoS protection
- HTTPS only communication

## 📊 Monitoring และ Logging

### 1. Google Cloud Monitoring
- Application performance monitoring
- Database monitoring
- Resource utilization tracking

### 2. Cloud Logging
- Structured logging
- Log aggregation
- Error tracking และ alerting

## 🔧 Deployment Strategies

### 1. Blue-Green Deployment
- Zero-downtime deployment
- Easy rollback capability

### 2. Canary Deployment
- Gradual traffic shifting
- Risk mitigation

## 📈 Scaling Configuration

### 1. Auto Scaling
- Cloud Run auto-scaling configuration
- Database connection pooling

### 2. Performance Optimization
- CDN configuration
- Caching strategies
- Database indexing

## 🎯 Cost Optimization

### 1. Resource Management
- Right-sizing instances
- Scheduled scaling
- Reserved instances สำหรับ predictable workloads

### 2. Monitoring Costs
- Budget alerts
- Cost attribution
- Resource cleanup automation
