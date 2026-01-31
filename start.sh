#!/bin/bash

# ReVive + Kitchen Sink Startup Script
# This ensures kitchen-sink is built before starting Next.js

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         ReVive + Konsta Kitchen Sink Startup              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the ReVive-main directory"
    exit 1
fi

# Step 1: Check if main dependencies are installed
echo "📦 Step 1/4: Checking main dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing main dependencies..."
    npm install
else
    echo "   ✓ Main dependencies already installed"
fi

echo ""

# Step 2: Check if kitchen-sink is built
echo "🍳 Step 2/4: Checking kitchen-sink build..."
if [ ! -d "public/kitchensink-app" ]; then
    echo "   Kitchen-sink not built yet. Building now..."
    echo ""
    npm run build:kitchensink
    echo ""
    echo "   ✓ Kitchen-sink built successfully!"
else
    echo "   ✓ Kitchen-sink already built"
    echo ""
    read -p "   Rebuild kitchen-sink? (y/N): " rebuild
    if [[ $rebuild =~ ^[Yy]$ ]]; then
        echo "   Rebuilding kitchen-sink..."
        npm run build:kitchensink
        echo "   ✓ Kitchen-sink rebuilt!"
    fi
fi

echo ""

# Step 3: Verify build
echo "✅ Step 3/4: Verifying build..."
if [ -f "public/kitchensink-app/index.html" ]; then
    echo "   ✓ index.html found"
    if [ -d "public/kitchensink-app/assets" ]; then
        echo "   ✓ assets directory found"
        echo "   ✓ Build verification passed!"
    else
        echo "   ⚠️  Warning: assets directory not found"
    fi
else
    echo "   ❌ Error: Kitchen-sink build failed!"
    echo "   Please run: npm run build:kitchensink"
    exit 1
fi

echo ""

# Step 4: Start Next.js
echo "🚀 Step 4/4: Starting Next.js development server..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Kitchen-sink will be available at:                       ║"
echo "║  http://localhost:3000/app/kitchensink                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

npm run dev
