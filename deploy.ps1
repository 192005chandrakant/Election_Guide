$ErrorActionPreference = "Stop"

$ProjectID = "promptwars-495019"
$Region = "us-central1"
$AgentServiceName = "civicguide-agent"
$WebServiceName = "civicguide-web"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🚀 CivicGuide Cloud Run Deployment Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Setup and Authentication
Write-Host "`n[1/5] Checking Google Cloud SDK..." -ForegroundColor Yellow
if (!(Get-Command "gcloud" -ErrorAction SilentlyContinue)) {
    Write-Error "gcloud CLI is not installed or not in PATH. Please install the Google Cloud SDK."
    exit 1
}

Write-Host "Setting active project to '$ProjectID'..."
gcloud config set project $ProjectID

# Ensure we are logged in
$account = gcloud config get-value account 2>$null
if ([string]::IsNullOrWhiteSpace($account)) {
    Write-Host "Not logged in. Opening browser to authenticate..."
    gcloud auth login
} else {
    Write-Host "Authenticated as $account."
}

# Enable required APIs
Write-Host "`n[2/5] Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 2. Deploy Python Agent Service
Write-Host "`n[3/5] Deploying Python Agent Service to Cloud Run..." -ForegroundColor Yellow

# Load Gemini key from .env or web/.env.local
$GeminiKey = ""
$EnvFile = "agent-service/.env"
if (Test-Path $EnvFile) {
    $GeminiKey = (Select-String -Path $EnvFile -Pattern "^GEMINI_API_KEY=(.*)$" | ForEach-Object { $_.Matches[0].Groups[1].Value })
}

# Fallback to web/.env.local if not found
if ([string]::IsNullOrWhiteSpace($GeminiKey)) {
    $WebEnvFile = "web/.env.local"
    if (Test-Path $WebEnvFile) {
        $GeminiKey = (Select-String -Path $WebEnvFile -Pattern "^GEMINI_API_KEY=(.*)$" | ForEach-Object { $_.Matches[0].Groups[1].Value })
    }
}

if ([string]::IsNullOrWhiteSpace($GeminiKey)) {
    Write-Host "⚠️  Warning: GEMINI_API_KEY not found in .env files. Using placeholder." -ForegroundColor Yellow
    $GeminiKey = "your-gemini-api-key-here"
}

Set-Location "agent-service"

$AgentEnvFile = Join-Path $env:TEMP "civicguide-agent-env.txt"
@{
    GEMINI_API_KEY = $GeminiKey
    FIREBASE_PROJECT_ID = $ProjectID
    ALLOWED_ORIGINS = "http://localhost:3000,https://civicguide-web-220048333239.us-central1.run.app"
    GEMINI_MODEL = "gemini-2.0-flash"
    GEMINI_MODELS = "gemini-2.0-flash,gemini-2.0-flash-lite,gemini-1.5-flash,gemini-1.5-flash-8b"
} | ConvertTo-Json -Depth 3 | Set-Content -Path $AgentEnvFile -Encoding ascii

# Deploy agent service
gcloud run deploy $AgentServiceName `
    --source . `
    --region $Region `
    --allow-unauthenticated `
    --env-vars-file $AgentEnvFile `
    --memory 1Gi `
    --cpu 1 `
    --timeout 3600

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy agent service. Exit code: $LASTEXITCODE"
    Set-Location ".."
    exit 1
}


Remove-Item -Path $AgentEnvFile -Force -ErrorAction SilentlyContinue
$AgentURL = gcloud run services describe $AgentServiceName --region $Region --format="value(status.url)"
Write-Host "✅ Agent Service deployed successfully at: $AgentURL" -ForegroundColor Green

Set-Location ".."

# 3. Deploy Next.js Web Service
Write-Host "`n[4/5] Deploying Next.js Web Frontend to Cloud Run..." -ForegroundColor Yellow
Set-Location "web"

# Extract all necessary public env vars from .env.local
$EnvVars = @()
$EnvFile = ".env.local"
if (Test-Path $EnvFile) {
    foreach ($line in Get-Content $EnvFile) {
        $trimmedLine = $line.Trim()
        if ($trimmedLine -and -not $trimmedLine.StartsWith("#")) {
            if ($trimmedLine.StartsWith("NEXT_PUBLIC_") -or $trimmedLine.StartsWith("GEMINI_API_KEY=")) {
                $EnvVars += $trimmedLine
            }
        }
    }
}

# Override AGENT_SERVICE_URL with the new deployed service URL
$EnvVars += "AGENT_SERVICE_URL=$AgentURL"

# Filter out empty values and create the environment string
$validEnvVars = $EnvVars | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
$EnvString = $validEnvVars -join ","

Write-Host "Setting environment variables for web deployment..." -ForegroundColor Yellow

# Deploy the Next.js app
gcloud run deploy $WebServiceName `
    --source . `
    --region $Region `
    --allow-unauthenticated `
    --set-env-vars=$EnvString `
    --memory 1Gi `
    --cpu 1 `
    --timeout 3600

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy web service. Exit code: $LASTEXITCODE"
    Set-Location ".."
    exit 1
}

$WebURL = gcloud run services describe $WebServiceName --region $Region --format="value(status.url)"
Write-Host "✅ Web Frontend deployed successfully at: $WebURL" -ForegroundColor Green

Set-Location ".."

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Agent Service: $AgentURL"
Write-Host "Web Application: $WebURL"
Write-Host "=============================================" -ForegroundColor Cyan
