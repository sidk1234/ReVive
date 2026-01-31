#!/bin/bash

# Kitchen Sink Setup Script
# This script sets up and builds the Konsta UI Kitchen Sink for ReVive

set -e

echo "================================================"
echo "Konsta UI Kitchen Sink Setup"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the kitchen-sink directory"
    exit 1
fi

# Install dependencies
echo "Step 1/3: Installing dependencies..."
npm install --break-system-packages

echo ""
echo "Step 2/3: Building the kitchen-sink app..."
npm run build

echo ""
echo "Step 3/3: Verifying build..."
if [ -d "../public/kitchensink-app" ]; then
    echo "✓ Build successful! Output directory created."
    echo "✓ Files:"
    ls -lh ../public/kitchensink-app/ | head -10
else
    echo "✗ Build failed! Output directory not found."
    exit 1
fi

echo ""
echo "================================================"
echo "Setup Complete!"
echo "================================================"
echo ""
echo "The kitchen-sink app is now ready."
echo ""
echo "Next steps:"
echo "1. Start the Next.js development server:"
echo "   cd .. && npm run dev"
echo ""
echo "2. Access the kitchen-sink at:"
echo "   http://localhost:3000/app/kitchensink"
echo ""
echo "================================================"
