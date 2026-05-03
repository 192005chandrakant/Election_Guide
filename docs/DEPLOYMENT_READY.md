# 🚀 CivicGuide Deployment - Complete Instructions

## Current Status
✅ Application is fully integrated and ready
✅ Docker images are configured
✅ Environment variables are set
⚠️  Docker daemon needs to be started
⚠️  Google Cloud CLI needs proper setup

---

## 🎯 Quick Start - 5 Steps to Deployment

### Step 1: Start Docker Desktop
1. Click the Windows Start menu
2. Search for "Docker Desktop"
3. Click to launch it
4. Wait for it to fully start (you'll see the Docker icon in the taskbar)
5. Wait 1-2 minutes for initialization

### Step 2: Verify Docker is Running
After starting Docker Desktop, run in PowerShell:
```powershell
docker ps
```
You should see output with CONTAINER ID, IMAGE, etc. (even if it's empty initially)

### Step 3: Install Git Bash (for gcloud CLI)
Google Cloud SDK works better with Bash. Download Git for Windows:
- https://git-scm.com/download/win
- Run installer with default options
- Restart PowerShell

### Step 4: Install Google Cloud SDK (in Git Bash)
1. Right-click on Start menu → Windows PowerShell (Admin) or Git Bash
2. Run:
```bash
# Download and install
curl https://sdk.cloud.google.com > install.sh
bash install.sh --disable-prompts

# Initialize
gcloud init
gcloud config set project promptwars-495019
gcloud auth login
```

### Step 5: Deploy to Cloud Run
Once Docker is running and gcloud is set up:
```powershell
cd C:\Users\Chandrakant\Election_Guide
.\deploy.ps1
```

---

## 📋 Detailed Steps

### A. Start Docker Desktop
```
Windows Start Menu → Docker Desktop → Launch
Wait for "Docker is running" message
```

### B. Build Docker Images (wait for Docker to be fully running)
```powershell
cd C:\Users\Chandrakant\Election_Guide

# Build Agent Service
cd agent-service
docker build -t civicguide-agent:v1.0 .
# Expected output: Successfully tagged civicguide-agent:v1.0

# Build Web Application
cd ../web
docker build -t civicguide-web:v1.0 .
# Expected output: Successfully tagged civicguide-web:v1.0

# Verify both images built
docker images | findstr civicguide
# Should show both civicguide-agent and civicguide-web
```

### C. Test Images Locally (Optional but Recommended)
```powershell
# Test Agent Service
docker run -p 8000:8000 -e GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM civicguide-agent:v1.0
# Visit: http://localhost:8000/docs
# Press Ctrl+C to stop

# Test Web Application
docker run -p 3000:3000 civicguide-web:v1.0
# Visit: http://localhost:3000
# Press Ctrl+C to stop
```

### D. Set Up Google Cloud Authentication
```powershell
# Option 1: Using Windows + Git Bash
# Right-click Start → Git Bash
# Run in Git Bash:
gcloud init
gcloud config set project promptwars-495019
gcloud auth login

# Option 2: Or run in PowerShell if gcloud is in PATH:
gcloud init
gcloud config set project promptwars-495019
gcloud auth login
```

### E. Push Images to Google Container Registry
```powershell
$PROJECT_ID = "promptwars-495019"

# Authenticate Docker with gcloud
gcloud auth configure-docker

# Tag images for Google Container Registry
docker tag civicguide-agent:v1.0 gcr.io/$PROJECT_ID/civicguide-agent:v1.0
docker tag civicguide-web:v1.0 gcr.io/$PROJECT_ID/civicguide-web:v1.0

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/civicguide-agent:v1.0
docker push gcr.io/$PROJECT_ID/civicguide-web:v1.0

# Verify pushed images
gcloud container images list --project=$PROJECT_ID
```

### F. Deploy to Cloud Run
```powershell
$PROJECT_ID = "promptwars-495019"
$REGION = "us-central1"

# Deploy Agent Service
gcloud run deploy civicguide-agent `
  --image gcr.io/$PROJECT_ID/civicguide-agent:v1.0 `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars="GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1" `
  --memory 1Gi `
  --cpu 1

# Get Agent Service URL
$AGENT_URL = gcloud run services describe civicguide-agent --region $REGION --format="value(status.url)"
Write-Host "Agent Service: $AGENT_URL"

# Deploy Web Service
gcloud run deploy civicguide-web `
  --image gcr.io/$PROJECT_ID/civicguide-web:v1.0 `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars="AGENT_SERVICE_URL=$AGENT_URL,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807,NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa,NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY,GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM" `
  --memory 1Gi `
  --cpu 1

# Get Web Service URL
$WEB_URL = gcloud run services describe civicguide-web --region $REGION --format="value(status.url)"
Write-Host "Web Application: $WEB_URL"
```

---

## ✅ Verification Checklist

After deployment, verify everything is working:

```powershell
# Check services are running
gcloud run services list --region us-central1

# View service details
gcloud run services describe civicguide-web --region us-central1
gcloud run services describe civicguide-agent --region us-central1

# Check recent logs
gcloud run logs read civicguide-web --region us-central1 --limit 20
gcloud run logs read civicguide-agent --region us-central1 --limit 20

# Test the endpoints (replace URLs with your actual URLs)
curl https://civicguide-web-xxxxx-uc.a.run.app
curl https://civicguide-agent-xxxxx-uc.a.run.app/health
```

---

## 🆘 Troubleshooting

### Docker Daemon Not Running
**Error**: `cannot connect to docker API`
```powershell
# Solution: Start Docker Desktop
# Windows Start Menu → Docker Desktop → Launch
# Then wait 2 minutes for full startup
```

### gcloud Command Not Found
**Error**: `gcloud : The term 'gcloud' is not recognized`
```powershell
# Solution 1: Use Git Bash instead of PowerShell
# Right-click Windows Start → Git Bash
# Then run gcloud commands there

# Solution 2: Add gcloud to PATH
# Install from: https://cloud.google.com/sdk/docs/install
```

### Image Build Fails
**Error**: `failed to build image`
```powershell
# Solution:
# 1. Check Docker is running: docker ps
# 2. Ensure you're in correct directory: cd C:\Users\Chandrakant\Election_Guide
# 3. Check Dockerfile exists: dir agent-service\Dockerfile
# 4. Build with verbose output: docker build -t civicguide-agent . --progress=plain
```

### Push to Registry Fails
**Error**: `unauthorized: authentication required`
```powershell
# Solution:
gcloud auth configure-docker
gcloud auth login
# Then retry push command
```

### Deployment Fails
**Error**: `failed to deploy to Cloud Run`
```powershell
# Solution:
# 1. Check APIs are enabled:
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 2. Check project is set correctly:
gcloud config get-value project
# Should show: promptwars-495019

# 3. Check you're authenticated:
gcloud auth list
```

---

## 📊 Command Summary

| Command | Purpose |
|---------|---------|
| `docker --version` | Check Docker installation |
| `docker ps` | List running containers |
| `docker build -t name . ` | Build Docker image |
| `docker run -p 8000:8000 image` | Run container locally |
| `gcloud --version` | Check gcloud CLI |
| `gcloud config set project ID` | Set GCP project |
| `gcloud auth login` | Authenticate with Google |
| `docker push gcr.io/...` | Push image to registry |
| `gcloud run deploy ...` | Deploy to Cloud Run |

---

## 🎯 What Happens Next

1. **You start Docker Desktop** → Takes 1-2 minutes
2. **You build Docker images** → Takes 3-5 minutes each
3. **You authenticate with Google** → Opens browser for login
4. **You push to registry** → Takes 2-5 minutes per image
5. **You deploy to Cloud Run** → Takes 5-10 minutes per service
6. **Your app is live!** → Access via provided URLs

---

## 📝 Your Project Details

- **Project ID**: `promptwars-495019`
- **Region**: `us-central1`
- **Agent Service**: `civicguide-agent`
- **Web Service**: `civicguide-web`
- **Environment**: Production
- **Auto-scaling**: Enabled
- **Budget**: Monitor in Google Cloud Console

---

## 🚀 Ready to Deploy?

1. **Start Docker Desktop** (Windows Start Menu)
2. **Run these commands**:
```powershell
cd C:\Users\Chandrakant\Election_Guide
docker build -t civicguide-agent:v1.0 ./agent-service
docker build -t civicguide-web:v1.0 ./web
gcloud auth configure-docker
docker tag civicguide-agent:v1.0 gcr.io/promptwars-495019/civicguide-agent:v1.0
docker tag civicguide-web:v1.0 gcr.io/promptwars-495019/civicguide-web:v1.0
docker push gcr.io/promptwars-495019/civicguide-agent:v1.0
docker push gcr.io/promptwars-495019/civicguide-web:v1.0
.\deploy.ps1
```

---

**Status**: Ready for Deployment
**Next Step**: Start Docker Desktop
**Estimated Time**: 30-45 minutes to full deployment
