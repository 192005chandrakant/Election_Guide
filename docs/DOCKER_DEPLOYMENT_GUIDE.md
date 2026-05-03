# CivicGuide Google Cloud Run Deployment - Docker Direct Method

## Why This Approach?

Since the gcloud CLI requires a bash shell (which PowerShell doesn't have by default on Windows), we'll use Docker to build and push images directly to Google Cloud, or use an alternative approach.

## Prerequisites

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install gcloud CLI properly (requires WSL2 or Git Bash)
3. Project ID: `promptwars-495019`

## Option A: Using Docker Desktop (Recommended for Windows)

### Step 1: Install Docker Desktop
- Download from: https://www.docker.com/products/docker-desktop
- Install and restart your computer
- Open PowerShell and verify: `docker --version`

### Step 2: Authenticate with Docker
```powershell
# Configure Docker to use gcloud credentials
gcloud auth configure-docker

# Verify authentication
docker images
```

### Step 3: Build and Push Images to Google Container Registry
```powershell
# Set variables
$PROJECT_ID = "promptwars-495019"
$REGION = "us-central1"

# Build Agent Service image
cd agent-service
docker build -t gcr.io/$PROJECT_ID/civicguide-agent:latest .
docker push gcr.io/$PROJECT_ID/civicguide-agent:latest

# Build Web Service image
cd ../web
docker build -t gcr.io/$PROJECT_ID/civicguide-web:latest .
docker push gcr.io/$PROJECT_ID/civicguide-web:latest

# List pushed images
gcloud container images list --project=$PROJECT_ID
```

### Step 4: Deploy from Google Container Registry
```powershell
# Deploy Agent Service
gcloud run deploy civicguide-agent `
  --image gcr.io/$PROJECT_ID/civicguide-agent:latest `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars="GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1"

# Deploy Web Service
$AGENT_URL = gcloud run services describe civicguide-agent --region $REGION --format="value(status.url)"

gcloud run deploy civicguide-web `
  --image gcr.io/$PROJECT_ID/civicguide-web:latest `
  --region $REGION `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars="AGENT_SERVICE_URL=$AGENT_URL,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807,NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa,NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY,GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM"
```

---

## Option B: Using Google Cloud Console (Simplest)

### Step 1: Build Locally
```powershell
cd web
npm run build
cd ../agent-service
# Ensure all dependencies are installed
```

### Step 2: Upload Source to Cloud Storage
```powershell
# Create a Cloud Storage bucket for source code
gsutil mb gs://$PROJECT_ID-source

# Upload project files
gsutil -r cp . gs://$PROJECT_ID-source/civicguide/
```

### Step 3: Deploy via Cloud Console
1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select your project: `promptwars-495019`
3. Go to Cloud Run → Create Service
4. Click "Deploy one revision from an existing image" or "Deploy from source"
5. For "Deploy from source", select your uploaded files
6. Configure environment variables
7. Click Deploy

---

## Option C: Using Windows Subsystem for Linux (WSL2)

If you have WSL2 installed, you can use gcloud CLI directly:

### Step 1: Open WSL Terminal
```bash
# In WSL terminal:
wsl

# Install gcloud CLI in WSL
curl https://sdk.cloud.google.com | bash

# Restart WSL
exit
wsl

# Initialize gcloud
gcloud init
gcloud config set project promptwars-495019

# Authenticate
gcloud auth login
```

### Step 2: Deploy from WSL
```bash
# Agent Service
cd /mnt/c/Users/Chandrakant/Election_Guide/agent-service
gcloud run deploy civicguide-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1"

# Web Service
cd ../web
AGENT_URL=$(gcloud run services describe civicguide-agent --region us-central1 --format="value(status.url)")

gcloud run deploy civicguide-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="AGENT_SERVICE_URL=$AGENT_URL,NEXT_PUBLIC_FIREBASE_API_KEY=..."
```

---

## Quick Setup: Install Docker & Deploy

### For Option A (Recommended):

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and restart

2. **Verify installation**
   ```powershell
   docker --version
   ```

3. **Build images locally**
   ```powershell
   cd agent-service
   docker build -t civicguide-agent:latest .
   
   cd ../web
   docker build -t civicguide-web:latest .
   ```

4. **Test locally**
   ```powershell
   docker run -p 8000:8000 civicguide-agent:latest
   docker run -p 3000:3000 civicguide-web:latest
   ```

5. **Deploy to Cloud Run**
   - Use the gcloud commands from Step 3 above

---

## Troubleshooting

### Docker not found
- Ensure Docker Desktop is installed
- Restart PowerShell after installation
- Run: `docker --version`

### gcloud not found in PowerShell
- Use Git Bash (included with Git for Windows) or WSL2
- Or use Option B (Google Cloud Console)

### Images won't push to registry
- Authenticate: `gcloud auth configure-docker`
- Check project ID is correct
- Ensure you have Push permissions

### Need quick help?
See DEPLOYMENT_GUIDE.md and GOOGLE_CLOUD_SETUP.md for more details.

---

## Summary

**Easiest Path:**
1. Install Docker Desktop
2. Test locally with Docker
3. Use Google Cloud Console to deploy

**Recommended Path:**
1. Install Docker Desktop
2. Use Docker to build images
3. Push to Google Container Registry
4. Deploy from Cloud Run

**Most Automated:**
1. Install WSL2
2. Install gcloud in WSL2
3. Use the deploy.ps1 script (adapted for WSL)
