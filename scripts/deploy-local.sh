#!/bin/bash

# Local deployment script for testing before GCP deployment
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🏠 OneEvent Local Deployment Script${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}🧹 Cleaning up previous containers${NC}"
docker-compose down -v

echo -e "${GREEN}🏗️  Building images${NC}"
docker-compose build

echo -e "${GREEN}🚀 Starting services${NC}"
docker-compose up -d

echo -e "${GREEN}⏳ Waiting for services to be ready${NC}"
sleep 30

echo -e "${GREEN}🔍 Running health checks${NC}"
# Check backend health
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    docker-compose logs frontend
    exit 1
fi

echo -e "${GREEN}🎉 Local deployment successful!${NC}"
echo ""
echo -e "${GREEN}🔗 Services:${NC}"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:8000"
echo "• API Documentation: http://localhost:8000/api"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "• Test the application functionality"
echo "• Run integration tests"
echo "• Check logs: docker-compose logs -f"
echo "• Stop services: docker-compose down"
