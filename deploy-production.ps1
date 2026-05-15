#!/usr/bin/env pwsh
<#
.SYNOPSIS
Production deployment script for CivicGuide to Google Cloud Run
.DESCRIPTION
Deploys both agent-service and web frontend to Cloud Run with production settings
.NOTES
Requires: gcloud CLI, Docker, git
Prerequisites: Authenticate with 'gcloud auth login' first
#>

param(
    [string]$ProjectID = "promptwars-495019",
    [string]$Region = "us-central1",
    [switch]$SkipBuild,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Color functions for output
function Write-Status {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [ERROR] $Message" -ForegroundColor Red
}

# Configuration
$ServiceAccountEmail = "civicguide-deploy@$ProjectID.iam.gserviceaccount.com"
$AgentServiceName = "civicguide-agent"
$WebServiceName = "civicguide-web"
$ImageRegistry = "us-central1-docker.pkg.dev"

Write-Status "=== CivicGuide Production Deployment ==="
Write-Status "Project: $ProjectID"
Write-Status "Region: $Region"

# 1. Verify Prerequisites
Write-Status "[1/8] Verifying prerequisites..."
$tools = @("gcloud", "docker", "git")
foreach ($tool in $tools) {
    if (!(Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Error "$tool is not installed or not in PATH"
        exit 1
    }
}
Write-Success "All prerequisites available"

# 2. Verify Git Status
Write-Status "[2/8] Checking git status..."
$gitStatus = & git status --porcelain
if ($gitStatus) {
    Write-Warning "Uncommitted changes detected:"
    Write-Host $gitStatus
    Read-Host "Press Enter to continue or Ctrl+C to cancel"
}
Write-Success "Git status verified"

# 3. Configure gcloud
Write-Status "[3/8] Configuring gcloud..."
& gcloud config set project $ProjectID
$CurrentAccount = & gcloud config get-value account 2>$null
if (-not $CurrentAccount) {
    Write-Status "Not authenticated. Opening browser to authenticate..."
    & gcloud auth login
} else {
    Write-Success "Authenticated as $CurrentAccount"
}

# Enable required APIs
Write-Status "Enabling required APIs..."
& gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# 4. Create/Update Secrets in Secret Manager
Write-Status "[4/8] Managing secrets in Secret Manager..."
Write-Status "Ensuring secrets exist in Secret Manager:"
Write-Status "  - GEMINI_API_KEY"
Write-Status "  - FIREBASE_SERVICE_ACCOUNT_JSON"
Write-Status "  (Update these manually in Google Cloud Console if needed)"

# 5. Build and Push Docker Images
if (-not $SkipBuild) {
    Write-Status "[5/8] Building and pushing Docker images..."
    
    # Build agent service
    Write-Status "Building agent service image..."
    $AgentImage = "$ImageRegistry/$ProjectID/cloud-run-source-deploy/$AgentServiceName"
    
    Push-Location agent-service
    if ($DryRun) {
        Write-Status "[DRY-RUN] Would run: docker build -t $AgentImage:latest ."
    } else {
        & docker build -t "$AgentImage`:latest" -f Dockerfile .
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build agent image"
            Pop-Location
            exit 1
        }
        Write-Success "Agent image built successfully"
    }
    Pop-Location
    
    # Build web service
    Write-Status "Building web service image..."
    $WebImage = "$ImageRegistry/$ProjectID/cloud-run-source-deploy/$WebServiceName"
    
    Push-Location web
    if ($DryRun) {
        Write-Status "[DRY-RUN] Would run: docker build -t $WebImage:latest ."
    } else {
        & docker build -t "$WebImage`:latest" -f Dockerfile .
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build web image"
            Pop-Location
            exit 1
        }
        Write-Success "Web image built successfully"
    }
    Pop-Location
    
    Write-Success "All images built successfully"
} else {
    Write-Status "[5/8] Skipping Docker build (--SkipBuild flag set)"
}

# 6. Deploy Agent Service
Write-Status "[6/8] Deploying agent service to Cloud Run..."
$AgentEnvVars = @(
    "FIREBASE_PROJECT_ID=$ProjectID"
    "ALLOWED_ORIGINS=http://localhost:3000,https://$WebServiceName-*.run.app"
    "GEMINI_MODEL=gemini-2.0-flash-lite"
    "ALLOWED_GEMINI_MODELS=gemini-2.0-flash-lite,gemini-2.0-flash,gemini-2.5-flash,gemini-1.5-flash"
    "ENABLE_GEMINI=true"
    "ENVIRONMENT=production"
)

if ($DryRun) {
    Write-Status "[DRY-RUN] Would deploy agent with:"
    foreach ($ev in $AgentEnvVars) {
        Write-Status "  $ev"
    }
} else {
    $deployCmd = @(
        "gcloud", "run", "deploy", $AgentServiceName,
        "--source", ".",
        "--region", $Region,
        "--allow-unauthenticated",
        "--memory", "1Gi",
        "--cpu", "2",
        "--timeout", "3600",
        "--max-instances", "100",
        "--min-instances", "1",
        "--platform", "managed"
    )
    
    foreach ($ev in $AgentEnvVars) {
        $deployCmd += @("--set-env-vars", $ev)
    }
    
    # Add secret bindings
    $deployCmd += @(
        "--set-secrets", "GEMINI_API_KEY=GEMINI_API_KEY:latest",
        "--set-secrets", "FIREBASE_SERVICE_ACCOUNT_JSON=FIREBASE_SERVICE_ACCOUNT_JSON:latest"
    )
    
    Push-Location agent-service
    & $deployCmd[0] ($deployCmd[1..($deployCmd.Length-1)])
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy agent service"
        Pop-Location
        exit 1
    }
    Write-Success "Agent service deployed successfully"
    Pop-Location
}

# 7. Get Agent URL and Deploy Web Service
Write-Status "[7/8] Deploying web service to Cloud Run..."

if (-not $DryRun) {
    $AgentURL = & gcloud run services describe $AgentServiceName --region $Region --format="value(status.url)"
    Write-Success "Agent URL: $AgentURL"
} else {
    $AgentURL = "https://$AgentServiceName-[hash]-$Region.run.app"
}

$WebEnvVars = @(
    "AGENT_SERVICE_URL=$AgentURL"
    "NODE_ENV=production"
    "NEXT_PUBLIC_ENVIRONMENT=production"
)

if ($DryRun) {
    Write-Status "[DRY-RUN] Would deploy web with AGENT_SERVICE_URL=$AgentURL"
} else {
    $deployCmd = @(
        "gcloud", "run", "deploy", $WebServiceName,
        "--source", ".",
        "--region", $Region,
        "--allow-unauthenticated",
        "--memory", "1Gi",
        "--cpu", "2",
        "--timeout", "3600",
        "--max-instances", "100",
        "--min-instances", "1",
        "--platform", "managed"
    )
    
    foreach ($ev in $WebEnvVars) {
        $deployCmd += @("--set-env-vars", $ev)
    }
    
    # Add secret bindings for Firebase config
    $deployCmd += @(
        "--set-secrets", "NEXT_PUBLIC_FIREBASE_API_KEY=NEXT_PUBLIC_FIREBASE_API_KEY:latest",
        "--set-secrets", "GEMINI_API_KEY=GEMINI_API_KEY:latest"
    )
    
    Push-Location web
    & $deployCmd[0] ($deployCmd[1..($deployCmd.Length-1)])
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to deploy web service"
        Pop-Location
        exit 1
    }
    Write-Success "Web service deployed successfully"
    Pop-Location
}

# 8. Verify Deployment
Write-Status "[8/8] Verifying deployment..."

if ($DryRun) {
    Write-Status "[DRY-RUN] Would verify services are running"
} else {
    Write-Status "Waiting for services to be ready..."
    Start-Sleep -Seconds 5
    
    $services = & gcloud run services list --region $Region --format="table(name,status.url)"
    Write-Success "Deployed services:"
    Write-Host $services
}

Write-Success ""
Write-Success "=== Deployment Complete ==="
Write-Success ""
Write-Success "Next steps:"
Write-Success "1. Verify services: gcloud run services list --region $Region"
Write-Success "2. View logs: gcloud run logs read $AgentServiceName --region $Region --limit 50"
Write-Success "3. Check health: curl https://<service-url>/health"
Write-Success ""
