#!/bin/bash

# Fix Tailwind CSS Build Issues
echo "🔧 Fixing Tailwind CSS build issues..."

# Remove old node_modules and package-lock.json
echo "🧹 Cleaning old dependencies..."
rm -rf node_modules package-lock.json

# Install fresh dependencies
echo "📦 Installing fresh dependencies..."
npm install

# Verify Tailwind CSS is installed
echo "🔍 Verifying Tailwind CSS installation..."
if npm list tailwindcss; then
    echo "✅ Tailwind CSS is properly installed"
else
    echo "❌ Tailwind CSS installation failed"
    exit 1
fi

# Test build
echo "🏗️ Testing build..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Tailwind CSS fix completed successfully!"
