#!/bin/bash

# JAM Application Launcher - Starts Backend + Frontend Together
# Usage: ./launch-jam.sh [dev|prod]

MODE=${1:-dev}

echo "🚀 JAM Application Launcher"
echo "=========================================="
echo "Mode: $MODE"
echo "Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down JAM Application...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${BLUE}   ✓ Backend server stopped${NC}"
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${BLUE}   ✓ Frontend app stopped${NC}"
    fi
    echo -e "${GREEN}✅ JAM Application shutdown complete${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Must run from JAM root directory${NC}"
    echo -e "${YELLOW}   Expected structure: JAM/package.json and JAM/backend/${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Checking dependencies...${NC}"

# Check if backend node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies not found. Installing...${NC}"
    cd backend && npm install && cd ..
fi

# Check if frontend node_modules exist  
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not found. Installing...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}🔧 Starting JAM Application Services...${NC}"
echo ""

# Start Backend Server
echo -e "${BLUE}🎯 Starting Backend Server...${NC}"
cd backend

if [ "$MODE" = "prod" ]; then
    echo -e "${BLUE}   → Production mode: Using optimized settings${NC}"
    node src/server.js > ../jam-backend.log 2>&1 &
else
    echo -e "${BLUE}   → Development mode: Enhanced logging${NC}"
    if [ -f "./start-nixos.sh" ]; then
        ./start-nixos.sh > ../jam-backend.log 2>&1 &
    else
        node src/server.js > ../jam-backend.log 2>&1 &
    fi
fi

BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}   ⏳ Waiting for backend to initialize...${NC}"
sleep 3

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    # Test if backend is responding
    if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Backend server running on http://localhost:3001${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Backend starting (health check pending...)${NC}"
    fi
else
    echo -e "${RED}   ❌ Backend failed to start${NC}"
    echo -e "${YELLOW}   📋 Check backend logs: tail -f jam-backend.log${NC}"
    exit 1
fi

# Start Frontend Application
echo ""
echo -e "${BLUE}🖥️  Starting Frontend Application...${NC}"

if [ "$MODE" = "prod" ]; then
    echo -e "${BLUE}   → Production mode: Building and starting Electron app${NC}"
    npm run build > jam-frontend.log 2>&1
    npm start > jam-frontend.log 2>&1 &
else
    echo -e "${BLUE}   → Development mode: Hot reload enabled${NC}"
    npm run dev > jam-frontend.log 2>&1 &
fi

FRONTEND_PID=$!

# Wait for frontend to start
echo -e "${YELLOW}   ⏳ Waiting for frontend to initialize...${NC}"
sleep 5

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}   ✅ Frontend application started${NC}"
else
    echo -e "${RED}   ❌ Frontend failed to start${NC}"
    echo -e "${YELLOW}   📋 Check frontend logs: tail -f jam-frontend.log${NC}"
    cleanup
fi

echo ""
echo -e "${GREEN}🎉 JAM Application Successfully Launched!${NC}"
echo "=========================================="
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "   • Backend API: ${GREEN}http://localhost:3001${NC}"
echo -e "   • Frontend App: ${GREEN}Electron Window${NC}"
echo -e "   • Logs: ${YELLOW}jam-backend.log, jam-frontend.log${NC}"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo -e "   • View backend logs: ${YELLOW}tail -f jam-backend.log${NC}"
echo -e "   • View frontend logs: ${YELLOW}tail -f jam-frontend.log${NC}"
echo -e "   • Test backend API: ${YELLOW}curl http://localhost:3001/api/health${NC}"
echo -e "   • Stop application: ${YELLOW}Ctrl+C${NC}"
echo ""

# Monitor processes and keep script running
echo -e "${BLUE}📱 Monitoring application... (Press Ctrl+C to stop)${NC}"

while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend process died unexpectedly${NC}"
        cleanup
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend process died unexpectedly${NC}"
        cleanup
    fi
    
    sleep 5
done