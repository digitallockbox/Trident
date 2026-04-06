#!/bin/bash

echo "Setting up Trident development environment..."

# Navigate to repo root
cd "$(dirname "$0")"

echo "Installing backend dependencies..."
cd server
npm install

echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo "Creating environment files..."
cd ..
touch server/.env
touch frontend/.env

echo "Environment files created. Populate them with your variables."

echo "Starting backend..."
cd server
npm run dev &

echo "Starting frontend..."
cd ../frontend
npm run dev &

echo "Trident environment is running."
