#!/usr/bin/env bash
# Exit on error
set -e

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build