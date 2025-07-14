#!/bin/bash

# 🌟 OneEvent Deploy to Vercel + PlanetScale + Upstash
# 100% FREE deployment solution for showcasing

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
    echo -e "\n${BLUE}🌟 $1${NC}"
    echo "=================================="
}

print_banner() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    OneEvent FREE Serverless Deploy    ║${NC}"
    echo -e "${BLUE}║   Vercel + PlanetScale + Upstash     ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
    echo ""
}

# Check if required CLIs are installed
check_dependencies() {
    print_step "Checking required dependencies..."
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
        print_success "Vercel CLI installed successfully"
    else
        print_success "Vercel CLI is already installed"
    fi
    
    # Check if we have git
    if ! command -v git &> /dev/null; then
        print_error "Git is required but not installed"
        exit 1
    fi
    
    print_success "All dependencies are ready"
}

# Create serverless API structure
create_serverless_structure() {
    print_header "Converting to Serverless Architecture"
    
    print_step "Creating Vercel API routes..."
    
    # Create api directory structure
    mkdir -p one-event-fe/pages/api
    mkdir -p one-event-fe/lib
    
    # Create database connection
    cat > one-event-fe/lib/db.ts << 'EOF'
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});

export default connection;
EOF

    # Create Redis connection
    cat > one-event-fe/lib/redis.ts << 'EOF'
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;
EOF

    # Create basic API routes
    cat > one-event-fe/pages/api/health.ts << 'EOF'
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless'
  });
}
EOF

    # Create events API
    cat > one-event-fe/pages/api/events/index.ts << 'EOF'
import type { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const [rows] = await db.execute('SELECT * FROM events ORDER BY created_at DESC LIMIT 10');
        res.status(200).json(rows);
        break;
        
      case 'POST':
        const { title, description, date, location } = req.body;
        const [result] = await db.execute(
          'INSERT INTO events (title, description, event_date, location) VALUES (?, ?, ?, ?)',
          [title, description, date, location]
        );
        res.status(201).json({ id: (result as any).insertId, ...req.body });
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
EOF

    print_success "Serverless API structure created"
}

# Setup environment variables template
setup_environment() {
    print_header "Setting up Environment Variables"
    
    cat > one-event-fe/.env.local.template << 'EOF'
# PlanetScale Database
DATABASE_HOST=aws.connect.psdb.cloud
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database-name
DATABASE_PORT=3306

# Upstash Redis
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Email (Optional for Vercel)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=OneEvent <noreply@oneevent.demo>
EOF

    print_info "Environment template created at one-event-fe/.env.local.template"
    print_warning "Please copy to .env.local and fill in actual values"
}

# Create package.json updates
update_package_json() {
    print_header "Updating Dependencies"
    
    print_step "Adding serverless dependencies..."
    
    cd one-event-fe
    
    # Add serverless dependencies
    npm install mysql2 @upstash/redis next-auth
    
    # Update package.json scripts
    cat > temp_package.json << 'EOF'
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next export",
    "vercel": "vercel",
    "vercel:prod": "vercel --prod"
  }
}
EOF

    print_success "Dependencies updated"
    cd ..
}

# Create Vercel configuration
create_vercel_config() {
    print_header "Creating Vercel Configuration"
    
    # Create vercel.json
    cat > one-event-fe/vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["sin1"],
  "env": {
    "NODE_ENV": "production"
  }
}
EOF

    # Create next.config.js for Vercel
    cat > one-event-fe/next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    runtime: 'nodejs',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
EOF

    print_success "Vercel configuration created"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_header "Deploying to Vercel"
    
    cd one-event-fe
    
    print_step "Logging into Vercel..."
    vercel login
    
    print_step "Deploying frontend..."
    vercel --prod
    
    cd ..
    
    print_success "Deployed to Vercel successfully"
}

# Database setup instructions
show_database_setup() {
    print_header "Database Setup Instructions"
    
    print_info "📋 PlanetScale Setup Steps:"
    echo "1. Go to https://planetscale.com"
    echo "2. Create account and new database"
    echo "3. Create main branch"
    echo "4. Generate connection credentials"
    echo "5. Update .env.local with credentials"
    echo ""
    
    print_info "📋 Upstash Redis Setup:"
    echo "1. Go to https://upstash.com"
    echo "2. Create account and new Redis database"
    echo "3. Copy REST URL and Token"
    echo "4. Update .env.local with credentials"
    echo ""
    
    print_warning "Remember to add these environment variables in Vercel dashboard!"
}

# Show deployment summary
show_deployment_summary() {
    print_header "🎉 Deployment Summary"
    
    print_success "✅ Serverless API structure created"
    print_success "✅ Vercel configuration ready"
    print_success "✅ Environment template created"
    
    print_info "📋 Next Steps:"
    echo "1. Setup PlanetScale database"
    echo "2. Setup Upstash Redis"
    echo "3. Update .env.local with credentials"
    echo "4. Add environment variables to Vercel"
    echo "5. Push code and deploy"
    
    print_info "💰 Cost: 100% FREE! 🎉"
    print_info "📊 Limits:"
    echo "   - Vercel: 100GB bandwidth/month"
    echo "   - PlanetScale: 1 database, 5GB storage"
    echo "   - Upstash: 10,000 requests/day"
}

# Main deployment function
main() {
    print_banner
    
    print_info "This script will prepare OneEvent for FREE serverless deployment"
    print_warning "This converts your app to serverless architecture"
    print_warning "Original NestJS backend will be replaced with Next.js API routes"
    
    read -p "Continue with serverless conversion? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Conversion cancelled"
        exit 0
    fi
    
    check_dependencies
    create_serverless_structure
    setup_environment
    update_package_json
    create_vercel_config
    show_database_setup
    
    print_info "Setup completed! Run 'vercel' in one-event-fe directory to deploy"
    show_deployment_summary
}

# Show help
show_help() {
    echo "OneEvent Serverless Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  help       Show this help message"
    echo "  setup      Setup serverless structure"
    echo "  deploy     Deploy to Vercel"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # Convert to serverless"
    echo "  $0 deploy    # Deploy to Vercel"
    echo "  $0 help      # Show help"
}

# Handle command line arguments
case "${1:-setup}" in
    "help")
        show_help
        ;;
    "setup")
        main
        ;;
    "deploy")
        deploy_to_vercel
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
