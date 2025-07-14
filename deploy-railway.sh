#!/bin/bash

# 🚄 OneEvent Deploy to Railway
# Free-tier deployment solution for showcasing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}🚄 $1${NC}"
    echo "=================================="
}

print_banner() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         OneEvent Railway Deploy       ║${NC}"
    echo -e "${BLUE}║        Free Showcase Deployment      ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
    echo ""
}

# Check if Railway CLI is installed
check_railway_cli() {
    print_step "Checking Railway CLI installation..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
        print_success "Railway CLI installed successfully"
    else
        print_success "Railway CLI is already installed"
    fi
}

# Login to Railway
railway_login() {
    print_step "Logging into Railway..."
    
    if ! railway whoami &> /dev/null; then
        print_info "Please login to Railway..."
        railway login
    else
        print_success "Already logged into Railway"
    fi
}

# Create Railway project
create_railway_project() {
    print_header "Creating Railway Project"
    
    print_step "Creating new Railway project..."
    railway login
    railway new
    
    print_success "Railway project created successfully"
}

# Setup environment variables
setup_environment() {
    print_header "Setting up Environment Variables"
    
    print_step "Setting up backend environment variables..."
    
    # Create environment variables for Railway
    cat > railway-env.txt << EOF
NODE_ENV=production
PORT=\$PORT
DATABASE_URL=\$DATABASE_URL
REDIS_URL=\$REDIS_URL
JWT_SECRET=railway-production-jwt-secret-$(openssl rand -hex 32)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=OneEvent <noreply@oneevent.demo>
EOF
    
    print_info "Environment variables template created in railway-env.txt"
    print_warning "Please update EMAIL_USER and EMAIL_PASS in Railway dashboard"
}

# Create Railway configuration files
create_railway_config() {
    print_header "Creating Railway Configuration"
    
    # Create railway.json for backend
    print_step "Creating backend railway.json..."
    cat > one-event-be/railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start:prod"
  }
}
EOF

    # Create railway.json for frontend
    print_step "Creating frontend railway.json..."
    cat > one-event-fe/railway.json << EOF
{
  "\$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start"
  }
}
EOF

    # Create production Dockerfile for frontend
    print_step "Creating production Dockerfile for frontend..."
    cat > one-event-fe/Dockerfile.railway << EOF
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

    print_success "Railway configuration files created"
}

# Deploy services
deploy_services() {
    print_header "Deploying to Railway"
    
    print_step "Adding PostgreSQL database..."
    railway add postgresql
    
    print_step "Adding Redis..."
    railway add redis
    
    print_step "Deploying backend service..."
    cd one-event-be
    railway up
    cd ..
    
    print_step "Deploying frontend service..."
    cd one-event-fe
    railway up
    cd ..
    
    print_success "Services deployed successfully"
}

# Get deployment URLs
get_deployment_info() {
    print_header "Deployment Information"
    
    print_step "Getting deployment URLs..."
    railway status
    
    print_info "Your application is now deployed on Railway!"
    print_info "Check the Railway dashboard for URLs and logs"
    print_warning "Remember to update EMAIL settings in environment variables"
}

# Main deployment function
main() {
    print_banner
    
    print_info "This script will deploy OneEvent to Railway for free showcase"
    print_warning "Make sure you have pushed your code to GitHub repository"
    
    read -p "Continue with Railway deployment? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    check_railway_cli
    railway_login
    create_railway_project
    setup_environment
    create_railway_config
    deploy_services
    get_deployment_info
    
    print_success "Railway deployment completed! 🎉"
    print_info "Visit https://railway.app/dashboard to manage your deployment"
}

# Show help
show_help() {
    echo "OneEvent Railway Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  help     Show this help message"
    echo "  deploy   Start deployment process"
    echo ""
    echo "Examples:"
    echo "  $0 deploy    # Deploy to Railway"
    echo "  $0 help      # Show help"
}

# Handle command line arguments
case "${1:-deploy}" in
    "help")
        show_help
        ;;
    "deploy")
        main
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
