#!/bin/bash

# 🔍 Railway Pre-Deploy Checker
# ตรวจสอบ configuration ก่อน deploy

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "=========================="
}

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_header "Railway Pre-Deploy Configuration Check"

# Check if in correct directory
if [ ! -f "docker-compose.yml" ]; then
    check_fail "Not in project root directory"
    echo "Please run this script from the one-event directory"
    exit 1
fi

check_pass "In correct project directory"

# Check backend files
print_header "Backend Configuration"

if [ -f "one-event-be/package.json" ]; then
    check_pass "Backend package.json exists"
else
    check_fail "Backend package.json missing"
fi

if [ -f "one-event-be/Dockerfile" ]; then
    check_pass "Backend Dockerfile exists"
else
    check_fail "Backend Dockerfile missing"
fi

if [ -f "one-event-be/railway.json" ]; then
    check_pass "Backend railway.json exists"
else
    check_warn "Backend railway.json missing (will create)"
fi

# Check frontend files
print_header "Frontend Configuration"

if [ -f "one-event-fe/package.json" ]; then
    check_pass "Frontend package.json exists"
else
    check_fail "Frontend package.json missing"
fi

if [ -f "one-event-fe/Dockerfile.railway" ]; then
    check_pass "Frontend Dockerfile.railway exists"
else
    check_warn "Frontend Dockerfile.railway missing (will create)"
fi

if [ -f "one-event-fe/railway.json" ]; then
    check_pass "Frontend railway.json exists"
else
    check_warn "Frontend railway.json missing (will create)"
fi

# Check next.config.ts
print_header "Next.js Configuration"

if [ -f "one-event-fe/next.config.ts" ]; then
    if grep -q "output.*standalone" "one-event-fe/next.config.ts"; then
        check_pass "Next.js standalone output configured"
    else
        check_warn "Next.js standalone output not found"
        echo "  Add: output: 'standalone' to next.config.ts"
    fi
else
    check_fail "next.config.ts missing"
fi

# Check Git status
print_header "Git Status"

if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository initialized"
    
    if [ -n "$(git status --porcelain)" ]; then
        check_warn "Uncommitted changes detected"
        echo "  Run: git add . && git commit -m 'Railway deployment prep'"
    else
        check_pass "No uncommitted changes"
    fi
    
    if git remote get-url origin > /dev/null 2>&1; then
        check_pass "Git remote configured"
        echo "  Remote: $(git remote get-url origin)"
    else
        check_fail "No git remote configured"
        echo "  Add remote: git remote add origin <github-url>"
    fi
else
    check_fail "Not a git repository"
fi

# Check dependencies
print_header "Dependencies Check"

# Backend dependencies
if [ -f "one-event-be/package-lock.json" ]; then
    check_pass "Backend package-lock.json exists"
else
    check_warn "Backend package-lock.json missing"
    echo "  Run: cd one-event-be && npm install"
fi

# Frontend dependencies
if [ -f "one-event-fe/package-lock.json" ]; then
    check_pass "Frontend package-lock.json exists"
else
    check_warn "Frontend package-lock.json missing"
    echo "  Run: cd one-event-fe && npm install"
fi

# Check Railway CLI
print_header "Railway CLI"

if command -v railway &> /dev/null; then
    check_pass "Railway CLI installed"
    echo "  Version: $(railway --version)"
else
    check_fail "Railway CLI not installed"
    echo "  Install: npm install -g @railway/cli"
fi

# Summary
print_header "Summary & Next Steps"

echo "📋 Checklist for Railway deployment:"
echo ""
echo "1. 🔧 Configuration Files:"
echo "   - Create missing railway.json files"
echo "   - Ensure Dockerfile.railway exists"
echo ""
echo "2. 📦 Dependencies:"
echo "   - Run npm install in both directories"
echo "   - Commit package-lock.json files"
echo ""
echo "3. 🌐 Git Repository:"
echo "   - Push code to GitHub"
echo "   - Ensure remote is accessible"
echo ""
echo "4. 🚄 Railway Setup:"
echo "   - Login: railway login"
echo "   - Create project from GitHub repo"
echo "   - Add PostgreSQL and Redis services"
echo ""
echo "5. ⚙️  Environment Variables:"
echo "   - Backend: NODE_ENV, JWT_SECRET, EMAIL_*"
echo "   - Frontend: NEXT_PUBLIC_API_URL"
echo ""

# Auto-fix missing files
read -p "Auto-create missing configuration files? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_header "Creating Missing Files"
    
    # Create backend railway.json if missing
    if [ ! -f "one-event-be/railway.json" ]; then
        cat > "one-event-be/railway.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start:prod"
  }
}
EOF
        check_pass "Created one-event-be/railway.json"
    fi
    
    # Create frontend railway.json if missing
    if [ ! -f "one-event-fe/railway.json" ]; then
        cat > "one-event-fe/railway.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile.railway"
  },
  "deploy": {
    "startCommand": "node server.js"
  }
}
EOF
        check_pass "Created one-event-fe/railway.json"
    fi
    
    # Create frontend Dockerfile.railway if missing
    if [ ! -f "one-event-fe/Dockerfile.railway" ]; then
        cat > "one-event-fe/Dockerfile.railway" << 'EOF'
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
EOF
        check_pass "Created one-event-fe/Dockerfile.railway"
    fi
    
    echo ""
    check_pass "Configuration files created!"
    echo "Now commit and push to GitHub, then follow RAILWAY_QUICK_START.md"
fi

echo ""
echo -e "${GREEN}🎯 Ready for Railway deployment!${NC}"
echo "Next: Follow RAILWAY_QUICK_START.md"
