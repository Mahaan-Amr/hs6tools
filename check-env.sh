#!/bin/bash

# Environment Variables Diagnostic Script
# Run this on your production server to check SMS configuration

echo "=========================================="
echo "Environment Variables Diagnostic"
echo "=========================================="
echo ""

# Check current directory
echo "Current directory: $(pwd)"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    echo "Checking for SMS-related variables in .env:"
    grep -i "kavenegar" .env 2>/dev/null || echo "   ⚠️  No KAVENEGAR variables found in .env"
else
    echo "❌ .env file not found"
fi
echo ""

# Check if .env.production exists
if [ -f ".env.production" ]; then
    echo "✅ .env.production file found"
    echo "Checking for SMS-related variables in .env.production:"
    grep -i "kavenegar" .env.production 2>/dev/null || echo "   ⚠️  No KAVENEGAR variables found in .env.production"
else
    echo "❌ .env.production file not found"
fi
echo ""

# Check PM2 environment
echo "Checking PM2 environment variables:"
pm2 env hs6tools 2>/dev/null | grep -i "kavenegar" || echo "   ⚠️  No KAVENEGAR variables found in PM2 env"
echo ""

# Check system environment (without showing values)
echo "Checking system environment variables (names only):"
env | grep -i "kavenegar" | cut -d'=' -f1 || echo "   ⚠️  No KAVENEGAR variables found in system env"
echo ""

# Check if variables are set (without showing values)
echo "Checking if variables are set:"
if [ -n "${KAVENEGAR_API_KEY}" ]; then
    echo "   ✅ KAVENEGAR_API_KEY is set (length: ${#KAVENEGAR_API_KEY} chars)"
else
    echo "   ❌ KAVENEGAR_API_KEY is NOT set"
fi

if [ -n "${NEXT_PUBLIC_KAVENEGAR_API_KEY}" ]; then
    echo "   ✅ NEXT_PUBLIC_KAVENEGAR_API_KEY is set (length: ${#NEXT_PUBLIC_KAVENEGAR_API_KEY} chars)"
else
    echo "   ❌ NEXT_PUBLIC_KAVENEGAR_API_KEY is NOT set"
fi

if [ -n "${KAVENEGAR_API_TOKEN}" ]; then
    echo "   ✅ KAVENEGAR_API_TOKEN is set (length: ${#KAVENEGAR_API_TOKEN} chars)"
else
    echo "   ❌ KAVENEGAR_API_TOKEN is NOT set"
fi
echo ""

# Check PM2 process environment
echo "Checking PM2 process environment:"
pm2 show hs6tools 2>/dev/null | grep -A 20 "env:" || echo "   ⚠️  Could not get PM2 process info"
echo ""

echo "=========================================="
echo "To fix: Add KAVENEGAR_API_KEY to your .env file"
echo "Then restart PM2: pm2 restart hs6tools"
echo "=========================================="
