#!/bin/bash

echo "🚀 Starting Beam Affiliate Platform..."

# Kill any existing processes on ports 3000, 3001, and 5001
echo "🔄 Cleaning up existing processes..."
pkill -f "node.*3000" 2>/dev/null
pkill -f "node.*3001" 2>/dev/null
pkill -f "node.*5001" 2>/dev/null
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd backend
PORT=5001 node src/server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Test backend
echo "🧪 Testing backend..."
curl -s http://localhost:5001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running on http://localhost:5001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 10

# Test frontend
echo "🧪 Testing frontend..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "⚠️  Frontend may still be starting..."
fi

echo ""
echo "🎉 Beam Affiliate Platform is ready!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5001"
echo "🏥 Health:   http://localhost:5001/health"
echo ""
echo "📋 Available endpoints:"
echo "   POST /api/auth/register - Register new reseller"
echo "   POST /api/auth/login    - Login reseller"
echo "   GET  /health           - Health check"
echo ""
echo "🛑 To stop the servers, press Ctrl+C"
echo ""

# Keep script running
wait 