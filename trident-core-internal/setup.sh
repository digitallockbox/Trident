#!/bin/sh
# Automated setup script for Trident monorepo
set -e

# 1. Install dependencies
pnpm install

# 2. Setup Backend API
echo "Setting up backend API..."
cd apps/api
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env for API. Please edit it to set DATABASE_URL if needed."
fi
cd ../..

# 3. Setup Frontend
echo "Setting up frontend..."
cd apps/web
if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env for Web."
fi
cd ../..

echo "\nSetup complete!"
echo "\nNext steps:"
echo "- Edit apps/api/.env and apps/web/.env as needed."
echo "- To run everything: pnpm dev"
echo "- To set up the database:"
echo "    cd apps/api && npx prisma generate && npx prisma migrate dev --name init && npx prisma db seed"
