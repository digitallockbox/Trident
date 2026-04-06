Write-Host "Setting up Trident development environment..."

Set-Location $PSScriptRoot

Write-Host "Installing backend dependencies..."
Set-Location "server"
npm install

Write-Host "Installing frontend dependencies..."
Set-Location "../frontend"
npm install

Write-Host "Creating environment files..."
New-Item -Path "../server/.env" -ItemType File -Force | Out-Null
New-Item -Path "./.env" -ItemType File -Force | Out-Null

Write-Host "Environment files created. Populate them with your variables."

Write-Host "Starting backend..."
Set-Location "../server"
Start-Process npm -ArgumentList "run dev"

Write-Host "Starting frontend..."
Set-Location "../frontend"
Start-Process npm -ArgumentList "run dev"

Write-Host "Trident environment is running."
