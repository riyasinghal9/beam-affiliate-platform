#!/bin/bash

echo "🛑 Stopping Beam Affiliate Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Kill processes by PID files if they exist
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    print_status "Stopping backend server (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
    rm backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    print_status "Stopping frontend server (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || true
    rm frontend.pid
fi

# Kill any remaining processes on ports 3000 and 5001
print_status "Cleaning up any remaining processes..."
pkill -f "node.*3000" 2>/dev/null || true
pkill -f "node.*5001" 2>/dev/null || true

# Wait a moment for processes to stop
sleep 2

# Check if processes are still running
if lsof -i :3000 > /dev/null 2>&1; then
    print_warning "Frontend server may still be running on port 3000"
else
    print_success "Frontend server stopped"
fi

if lsof -i :5001 > /dev/null 2>&1; then
    print_warning "Backend server may still be running on port 5001"
else
    print_success "Backend server stopped"
fi

print_success "✅ All services stopped successfully!" 