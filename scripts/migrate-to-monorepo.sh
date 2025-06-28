#!/bin/bash

# Migration script to convert current structure to monorepo
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}🔄 Migrating to Monorepo Structure${NC}"

# Check if we're in the right directory
if [ ! -d "one-event-be" ] || [ ! -d "one-event-fe" ]; then
    echo -e "${YELLOW}⚠️  Current structure not found. Please run this from the root directory.${NC}"
    exit 1
fi

# Create new structure
echo -e "${BLUE}📁 Creating new directory structure${NC}"
mkdir -p apps
mkdir -p packages/shared-types/src
mkdir -p packages/ui-components/src
mkdir -p packages/utils/src

# Move backend
echo -e "${BLUE}📦 Moving backend application${NC}"
if [ -d "one-event-be" ]; then
    mv one-event-be apps/backend
    echo "✅ Backend moved to apps/backend"
fi

# Move frontend
echo -e "${BLUE}🎨 Moving frontend application${NC}"
if [ -d "one-event-fe" ]; then
    mv one-event-fe apps/frontend
    echo "✅ Frontend moved to apps/frontend"
fi

# Create root package.json
echo -e "${BLUE}📄 Creating root package.json${NC}"
cat > package.json << 'EOF'
{
  "name": "one-event",
  "version": "1.0.0",
  "private": true,
  "description": "OneEvent - Complete Event Management System",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "npm run start:dev --workspace=apps/backend",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "build": "npm run build --workspaces",
    "build:backend": "npm run build --workspace=apps/backend",
    "build:frontend": "npm run build --workspace=apps/frontend",
    "test": "npm run test --workspaces",
    "test:backend": "npm run test --workspace=apps/backend",
    "test:frontend": "npm run test --workspace=apps/frontend",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "clean": "rm -rf node_modules apps/*/node_modules packages/*/node_modules",
    "clean:build": "rm -rf apps/*/dist apps/*/.next packages/*/dist",
    "typecheck": "npm run typecheck --workspaces",
    "migration:run": "npm run typeorm:migration:run --workspace=apps/backend",
    "migration:generate": "npm run typeorm:migration:generate --workspace=apps/backend"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "concurrently": "^8.2.0",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^14.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/one-event.git"
  },
  "keywords": [
    "event-management",
    "nestjs",
    "nextjs",
    "typescript",
    "postgresql"
  ],
  "author": "Your Name",
  "license": "MIT"
}
EOF

# Create shared-types package
echo -e "${BLUE}🔗 Creating shared-types package${NC}"
cat > packages/shared-types/package.json << 'EOF'
{
  "name": "@one-event/shared-types",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# Create basic shared types
cat > packages/shared-types/src/index.ts << 'EOF'
// Shared types for OneEvent application
export * from './api';
export * from './events';
export * from './users';
export * from './registrations';
EOF

# Extract common types from backend
echo -e "${BLUE}📋 Extracting shared types${NC}"

# Copy API types from backend to shared package
if [ -f "apps/backend/src/types/api.ts" ]; then
    cp apps/backend/src/types/api.ts packages/shared-types/src/api.ts
fi

# Create TypeScript config for shared-types
cat > packages/shared-types/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}
EOF

# Create utils package
echo -e "${BLUE}🛠️  Creating utils package${NC}"
cat > packages/utils/package.json << 'EOF'
{
  "name": "@one-event/utils",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# Create root TypeScript config
echo -e "${BLUE}⚙️  Creating root TypeScript config${NC}"
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@one-event/shared-types": ["./packages/shared-types/src"],
      "@one-event/utils": ["./packages/utils/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "**/node_modules", "dist", "**/dist"]
}
EOF

# Update docker-compose.yml paths
echo -e "${BLUE}🐳 Updating Docker Compose paths${NC}"
if [ -f "docker-compose.yml" ]; then
    sed -i '' 's|./one-event-be|./apps/backend|g' docker-compose.yml
    sed -i '' 's|./one-event-fe|./apps/frontend|g' docker-compose.yml
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo -e "${BLUE}📝 Creating .gitignore${NC}"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
*.sqlite
*.db

# Uploads
uploads/

# Cache
.npm
.yarn/cache
.pnp
.pnp.js
EOF
fi

# Create README for the new structure
echo -e "${BLUE}📖 Creating updated README${NC}"
cat > README.md << 'EOF'
# OneEvent - Event Management System

A comprehensive event management platform built with modern technologies.

## 🏗️ Architecture

This is a monorepo containing:

- **Backend API** (`apps/backend`): NestJS-based REST API
- **Frontend Web** (`apps/frontend`): Next.js web application
- **Shared Types** (`packages/shared-types`): Common TypeScript interfaces
- **Utilities** (`packages/utils`): Shared utility functions

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Or run individually
npm run dev:backend  # API server on port 8000
npm run dev:frontend # Web app on port 3000
```

## 📦 Package Scripts

```bash
# Development
npm run dev              # Start both apps
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only

# Building
npm run build           # Build all packages
npm run build:backend   # Build backend only
npm run build:frontend  # Build frontend only

# Testing
npm run test           # Run all tests
npm run test:backend   # Test backend only
npm run test:frontend  # Test frontend only

# Linting
npm run lint           # Lint all packages
npm run lint:fix       # Fix linting issues

# Utilities
npm run clean          # Clean node_modules
npm run clean:build    # Clean build outputs
npm run typecheck      # Type checking
```

## 🗄️ Database

```bash
# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- -n MigrationName
```

## 🐳 Docker

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## 🚀 Deployment

See [GCP Deployment Guide](./docs/GCP_DEPLOYMENT_GUIDE.md) for production deployment instructions.

## 📚 Documentation

- [GCP Deployment Guide](./docs/GCP_DEPLOYMENT_GUIDE.md)
- [Monorepo Structure](./docs/MONOREPO_STRUCTURE.md)
- [API Documentation](http://localhost:8000/api) (when running)

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT
- **Frontend**: Next.js, React, TailwindCSS, TypeScript
- **Infrastructure**: Google Cloud Platform, Docker, Terraform
- **CI/CD**: GitHub Actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.
EOF

echo -e "${GREEN}✅ Migration completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Install dependencies: npm install"
echo "2. Update import paths in your code to use shared types"
echo "3. Test the applications: npm run dev"
echo "4. Update your GitHub repository settings if needed"
echo "5. Commit and push the new structure"
echo ""
echo -e "${BLUE}🔧 Optional improvements:${NC}"
echo "• Extract common UI components to packages/ui-components"
echo "• Set up shared ESLint and Prettier configs"
echo "• Add pre-commit hooks with husky"
echo "• Configure path mapping in your IDE"
