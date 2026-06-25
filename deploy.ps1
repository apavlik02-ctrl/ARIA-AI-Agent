# ARIA — One-Click Deploy to Vercel
# Run this from the project folder in PowerShell or Terminal

Write-Host "Deploying ARIA to Vercel..." -ForegroundColor Cyan

# Check for Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Deploy via Vercel CLI (will prompt for login on first run)
Write-Host "Launching Vercel deploy..." -ForegroundColor Green
npx vercel --yes

Write-Host ""
Write-Host "Done! Your ARIA app is live." -ForegroundColor Green
Write-Host "Add these env vars in the Vercel dashboard:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
Write-Host "  SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor White
Write-Host "  ANTHROPIC_API_KEY" -ForegroundColor White
