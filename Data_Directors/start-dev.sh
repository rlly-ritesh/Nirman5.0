#!/bin/bash

# PadhAI Development Server Starter
# Starts both Python backend and Next.js frontend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        PadhAI - Integrated Backend & Frontend          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

# Check Ollama
echo -e "${YELLOW}Checking Ollama availability...${NC}"
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${RED}⚠ Warning: Ollama is not running${NC}"
    echo -e "${YELLOW}Please start Ollama separately:${NC}"
    echo -e "${YELLOW}  ollama serve${NC}"
    echo -e ""
fi

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Python backend
echo -e "\n${BLUE}Starting Python backend...${NC}"
python3 backend.py --port 5000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
sleep 2

# Start Next.js frontend
echo -e "\n${BLUE}Starting Next.js frontend...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Display info
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Both servers are running!                   ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║ Backend:  http://localhost:5000                        ║${NC}"
echo -e "${GREEN}║ Frontend: http://localhost:3000                        ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║ Press Ctrl+C to stop all servers                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
