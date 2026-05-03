# Google Cloud SDK Installation & Deployment Guide

## Step 1: Install Google Cloud SDK

### For Windows (Recommended Method)

#### Option A: Using the Installer (Easiest)
1. Download the Google Cloud SDK installer:
   - Go to: https://cloud.google.com/sdk/docs/install-cloud-sdk#windows
   - Click "Download the Google Cloud CLI installer (360 MB)"
   - Run `google-cloud-cli-installer.exe`

2. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation location (default is fine)
   - Let it install the bundled Python if needed
   - Click "Finish"

3. Verify installation:
   ```powershell
   gcloud --version
   ```

#### Option B: Using PowerShell (if Option A doesn't work)
```powershell
# Run as Administrator
# Bypass execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Download and install
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Verify
gcloud --version
```

#### Option C: Using Chocolatey (if you have it installed)
```powershell
choco install google-cloud-sdk
gcloud --version
```

### After Installation
Close and reopen PowerShell to ensure PATH is updated, then verify:
```powershell
gcloud --version
gcloud auth list
```

---

## Step 2: Configure Google Cloud Project

Once Google Cloud SDK is installed, run these commands:

```powershell
# Set your project ID
gcloud config set project promptwars-495019

# Verify the project is set
gcloud config get-value project

# List available projects
gcloud projects list
```

---

## Step 3: Authenticate with Google Cloud

```powershell
# Authenticate (opens browser for login)
gcloud auth login

# Verify authentication
gcloud auth list

# Set application default credentials
gcloud auth application-default login
```

---

## Step 4: Enable Required APIs

```powershell
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API (for building containers)
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry (for storing images)
gcloud services enable containerregistry.googleapis.com

# Enable Artifact Registry (optional, for newer deployments)
gcloud services enable artifactregistry.googleapis.com

# Verify APIs are enabled
gcloud services list --enabled
```

---

## Step 5: Deploy to Google Cloud Run

Once everything is set up, run the deployment script from your project directory:

```powershell
# Navigate to project
cd C:\Users\Chandrakant\Election_Guide

# Run the deployment script
.\deploy.ps1
```

**What the script will do:**
1. Verify Google Cloud SDK is installed
2. Set project to `promptwars-495019`
3. Enable required APIs
4. Deploy the Python Agent Service to Cloud Run
5. Deploy the Next.js Web Application to Cloud Run
6. Output the URLs for both services

---

## Manual Deployment (If Script Fails)

### Deploy Agent Service
```powershell
cd agent-service

gcloud run deploy civicguide-agent `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1" `
  --memory 1Gi `
  --cpu 1 `
  --timeout 3600

# Note the service URL displayed after deployment
# Format: https://civicguide-agent-[hash]-[region].a.run.app
```

### Deploy Web Service
```powershell
cd ../web

# Set the agent service URL from previous step
$AGENT_URL = "https://civicguide-agent-[hash]-[region].a.run.app"

gcloud run deploy civicguide-web `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807,NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa,NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY,GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,AGENT_SERVICE_URL=$AGENT_URL" `
  --memory 1Gi `
  --cpu 1 `
  --timeout 3600
```

---

## Verify Deployment

```powershell
# List all Cloud Run services
gcloud run services list --region us-central1

# View service details
gcloud run services describe civicguide-web --region us-central1

# View logs
gcloud run logs read civicguide-web --region us-central1 --limit 50
gcloud run logs read civicguide-agent --region us-central1 --limit 50

# Test the services
curl https://civicguide-web-[hash]-[region].a.run.app
curl https://civicguide-agent-[hash]-[region].a.run.app/health
```

---

## Troubleshooting

### Issue: "gcloud is not recognized"
- **Solution**: Ensure Google Cloud SDK is installed and restart PowerShell
- Download from: https://cloud.google.com/sdk/docs/install-cloud-sdk

### Issue: "Permission denied" or "Quota exceeded"
- **Solution**: Check IAM permissions in Google Cloud Console
- Ensure your account has "Editor" or "Cloud Run Admin" role

### Issue: Deployment times out
- **Solution**: This is normal for first deployment (5-10 minutes)
- Check status: `gcloud run services describe civicguide-web --region us-central1`

### Issue: "API not enabled"
- **Solution**: Manually enable APIs:
  ```powershell
  gcloud services enable run.googleapis.com
  gcloud services enable cloudbuild.googleapis.com
  ```

---

## Summary

1. Install Google Cloud SDK from: https://cloud.google.com/sdk/docs/install-cloud-sdk#windows
2. Run `gcloud auth login`
3. Run `.\deploy.ps1` from project root
4. Access your deployed application via the provided URLs

**Your Project ID**: `promptwars-495019`
**Region**: `us-central1`
**Agent Service Name**: `civicguide-agent`
**Web Service Name**: `civicguide-web`

---

For more help, see the complete DEPLOYMENT_GUIDE.md in your project directory.
