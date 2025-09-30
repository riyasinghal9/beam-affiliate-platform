#!/bin/bash

echo "🚀 Starting Beam Affiliate Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if MongoDB is running
print_status "Checking MongoDB..."
if brew services list | grep -q "mongodb-community.*started"; then
    print_success "MongoDB is running"
else
    print_warning "MongoDB not running, starting it..."
    brew services start mongodb-community
    sleep 3
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the beam-affiliate-platform root directory"
    exit 1
fi

# Kill any existing processes on ports 3000 and 5001
print_status "Cleaning up existing processes..."
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "node.*5001" 2>/dev/null || true
sleep 2

# Start backend
print_status "Starting backend server..."
cd backend
if [ ! -f ".env" ]; then
    print_warning "Creating .env file..."
    cat > .env << EOF
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/beam-affiliate
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key_hereyour_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_hereyour_stripe_publishable_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
BEAM_WALLET_API_URL=https://api.beamwallet.com
BEAM_WALLET_API_KEY=your-beam-wallet-api-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF
fi

# Start backend in background
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5001/health > /dev/null; then
    print_success "Backend server started successfully on port 5001"
else
    print_error "Backend server failed to start. Check backend.log for details"
    exit 1
fi

# Start frontend
print_status "Starting frontend server..."
cd ../frontend

# Start frontend in background
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Frontend server started successfully on port 3000"
else
    print_warning "Frontend server may still be starting. Check frontend.log for details"
fi

# Return to root directory
cd ..

# Display status
echo ""
print_success "🎉 Beam Affiliate Platform is starting up!"
echo ""
echo "📊 Services Status:"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo "   MongoDB:  Running"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   ./stop.sh"
echo ""
echo "🔍 To check if services are running:"
echo "   lsof -i :3000 -i :5001"
echo ""

# Wait a bit more for everything to fully start
sleep 5

# Final check
if curl -s http://localhost:3000 > /dev/null && curl -s http://localhost:5001/health > /dev/null; then
    print_success "✅ All services are running successfully!"
    echo ""
    echo "🌐 Open your browser and go to: http://localhost:3000"
    echo ""
    echo "👤 Default admin credentials:"
    echo "   Email: admin@beamwallet.com"
    echo "   Password: admin123"
    echo ""
else
    print_warning "⚠️  Some services may still be starting up. Please wait a moment and refresh."
fi

# Keep the script running to maintain the background processes
wait 