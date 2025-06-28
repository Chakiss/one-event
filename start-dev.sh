#!/bin/bash

# OneEvent Development Server Startup Script
echo "🚀 Starting OneEvent Development Servers..."

# Check if ports are available
echo "🔍 Checking port availability..."

# Kill existing processes on ports 3000 and 8000
echo "🛑 Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

echo "🔧 Starting Backend Server (Port 8000)..."
cd /Users/chakritpaniam/CMD-R/ComOne/one-event/one-event-be
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

echo "🎨 Starting Frontend Server (Port 3000)..."
cd /Users/chakritpaniam/CMD-R/ComOne/one-event/one-event-fe
npm run dev &
FRONTEND_PID=$!

echo "✅ Servers started successfully!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Documentation: http://localhost:8000/api"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID; exit 0' INT
wait
