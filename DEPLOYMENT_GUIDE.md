# Google Cloud Run Deployment Guide for CivicGuide

## Prerequisites

### 1. Install Google Cloud SDK

**For Windows:**
1. Download the installer from: https://cloud.google.com/sdk/docs/install-cloud-sdk#windows
2. Run the installer (google-cloud-sdk-installer.exe)
3. Follow the installation wizard
4. After installation, open a new PowerShell or Command Prompt window and verify:
   ```powershell
   gcloud --version
   ```

### 2. Authenticate with Google Cloud

After installing the Google Cloud SDK, authenticate with your Google account:

```powershell
# Authenticate
gcloud auth login

# Set your project ID
gcloud config set project promptwars-495019

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

## Deployment Steps

### Step 1: Deploy the Python Agent Service

```powershell
# Navigate to agent-service directory
Set-Location agent-service

# Deploy the service
gcloud run deploy civicguide-agent `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1

# Get the service URL (you'll need this for the web service)
$AGENT_URL = gcloud run services describe civicguide-agent --region us-central1 --format="value(status.url)"
Write-Host "Agent Service URL: $AGENT_URL"

# Return to root directory
Set-Location ..
```

### Step 2: Deploy the Next.js Web Application

```powershell
# Navigate to web directory
Set-Location web

# Create environment variables string with all NEXT_PUBLIC_* variables
$EnvVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807",
    "NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa",
    "NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY",
    "GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM",
    "AGENT_SERVICE_URL=$AGENT_URL"
)

$EnvString = $EnvVars -join ","

# Deploy the web service
gcloud run deploy civicguide-web `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars $EnvString `
  --memory 1Gi `
  --cpu 1 `
  --timeout 3600

# Get the web service URL
$WEB_URL = gcloud run services describe civicguide-web --region us-central1 --format="value(status.url)"
Write-Host "Web Application URL: $WEB_URL"

# Return to root directory
Set-Location ..
```

## Alternative: Using the Deployment Script

If you prefer to run the automated deployment script:

```powershell
# Run the deployment script
.\deploy.ps1
```

## Verification

After deployment, verify that both services are running:

```powershell
# List all Cloud Run services
gcloud run services list --region us-central1

# Check logs for agent service
gcloud run logs read civicguide-agent --region us-central1 --limit 50

# Check logs for web service
gcloud run logs read civicguide-web --region us-central1 --limit 50
```

## Monitoring and Management

### View Service Details

```powershell
# View agent service details
gcloud run services describe civicguide-agent --region us-central1

# View web service details
gcloud run services describe civicguide-web --region us-central1
```

### Update Environment Variables

```powershell
# Update agent service environment variables
gcloud run services update civicguide-agent `
  --region us-central1 `
  --set-env-vars GEMINI_API_KEY=<new-key>,FIREBASE_PROJECT_ID=<project-id>

# Update web service environment variables
gcloud run services update civicguide-web `
  --region us-central1 `
  --set-env-vars AGENT_SERVICE_URL=<agent-url>,GEMINI_API_KEY=<new-key>
```

### Scale Services

```powershell
# Set max instances for agent service
gcloud run services update civicguide-agent `
  --region us-central1 `
  --max-instances 10

# Set max instances for web service
gcloud run services update civicguide-web `
  --region us-central1 `
  --max-instances 20
```

## Troubleshooting

### Issue: "gcloud is not recognized"
- **Solution:** Ensure the Google Cloud SDK is installed and added to your system PATH. Restart PowerShell after installation.

### Issue: "Permission denied" during deployment
- **Solution:** Ensure you're authenticated with `gcloud auth login` and have the necessary permissions in the Google Cloud project.

### Issue: Service times out during deployment
- **Solution:** This is normal for the first deployment. Cloud Run may take several minutes to build and deploy. Check the status with:
  ```powershell
  gcloud run services describe civicguide-web --region us-central1
  ```

### Issue: Frontend cannot reach backend
- **Solution:** Ensure the `AGENT_SERVICE_URL` environment variable in the web service is correctly set to the agent service URL.

## Important Notes

1. **Security:** The CORS settings are currently set to allow all origins. For production, update these to restrict to your specific domain.

2. **Environment Variables:** Keep sensitive API keys secure. Consider using Google Cloud Secret Manager for sensitive values:
   ```powershell
   # Create a secret
   echo "AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM" | gcloud secrets create gemini-api-key --data-file=-
   
   # Reference in deployment
   gcloud run deploy civicguide-agent --set-env-vars GEMINI_API_KEY=<secret-value>
   ```

3. **Costs:** Cloud Run charges based on memory, CPU, and request count. Monitor your usage in the Google Cloud Console to manage costs.

## Next Steps

1. Install the Google Cloud SDK if not already installed
2. Authenticate with `gcloud auth login`
3. Run the deployment script or follow the manual steps above
4. Verify both services are running
5. Test the application at the provided URLs
6. Monitor logs for any issues
