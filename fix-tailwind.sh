#!/bin/bash

echo "=== Fixing Tailwind CSS Version Conflict ==="
echo ""

# Remove node_modules and lock file
echo "1. Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Reinstall with exact versions
echo ""
echo "2. Reinstalling dependencies with Tailwind v3..."
npm install

# Verify Tailwind version
echo ""
echo "3. Verifying Tailwind CSS version..."
TAILWIND_VERSION=$(npm list tailwindcss | grep tailwindcss@ | head -1)
echo "   Installed: $TAILWIND_VERSION"

if [[ $TAILWIND_VERSION == *"3."* ]]; then
    echo "   ✅ Correct version (v3.x)"
else
    echo "   ⚠️  Warning: Unexpected version detected"
    echo "   Force installing Tailwind v3..."
    npm install tailwindcss@3.3.5 --save-exact
fi

echo ""
echo "4. Building kitchen-sink..."
npm run build:kitchensink

echo ""
echo "=== Fix Complete ==="
echo ""
echo "You can now run: npm run dev"
