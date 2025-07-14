#!/bin/bash

# Quick Production Deployment
echo "🚀 OneEvent Quick Production Deploy"

# Copy production environment
cp .env.production .env

# Stop existing containers
docker compose -f docker-compose.prod.yml down

# Start production services
docker compose -f docker-compose.prod.yml up --build -d

echo "✅ Deployment started!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend: http://localhost/api"

# Show logs
docker compose -f docker-compose.prod.yml logs -f
