@echo off
REM Automated setup script for Trident monorepo (Windows)

REM 1. Install dependencies
pnpm install

REM 2. Setup Backend API
cd apps\api
IF NOT EXIST .env (
  copy .env.example .env
  echo Created .env for API. Please edit it to set DATABASE_URL if needed.
)
cd ..\..

REM 3. Setup Frontend
cd apps\web
IF NOT EXIST .env (
  copy .env.example .env
  echo Created .env for Web.
)
cd ..\..

echo.
echo Setup complete!
echo.
echo Next steps:
echo - Edit apps\api\.env and apps\web\.env as needed.
echo - To run everything: pnpm dev
echo - To set up the database:
echo     cd apps\api && npx prisma generate && npx prisma migrate dev --name init && npx prisma db seed
echo - To build all packages and apps: pnpm build
echo - To start in production: pnpm start
echo - To clean all: pnpm clean
echo.
echo Optional: To set up the database automatically, run:
echo     cd apps\api
echo     npx prisma generate
echo     npx prisma migrate dev --name init
echo     npx prisma db seed
