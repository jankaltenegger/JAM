#!/bin/bash

# JAM Backend Startup Script for NixOS
# This script sets up the proper environment for browser automation

echo "🚀 Starting JAM Backend with browser automation support..."

# Set up library paths for browser support
export LD_LIBRARY_PATH="$BROWSER_LIBRARY_PATH:$LD_LIBRARY_PATH"

# Set browser environment
export PLAYWRIGHT_BROWSERS_PATH="$HOME/.cache/ms-playwright"
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# OpenAI API key placeholder (needed for Stagehand AI features)
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Note: OPENAI_API_KEY not set - Stagehand will work in basic mode"
    export OPENAI_API_KEY="placeholder-key"
fi

echo "📦 Environment configured:"
echo "   - Browser library path: $BROWSER_LIBRARY_PATH"
echo "   - Playwright browsers: $PLAYWRIGHT_BROWSERS_PATH"
echo "   - Chromium path: $CHROMIUM_PATH"

# Start the server
echo "🔧 Starting JAM Backend Server..."
node src/server.js