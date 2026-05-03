# 🚀 CivicGuide Deployment Checklist

## Pre-Deployment ✅

### System Requirements
- [ ] Google Cloud SDK installed
- [ ] PowerShell 5.0+ (Windows)
- [ ] Google account with Cloud billing enabled
- [ ] Project ID: `promptwars-495019`
- [ ] Region: `us-central1`

### Code Verification
- [ ] All git changes committed
- [ ] `.env` files configured in both directories
- [ ] Docker files are updated
- [ ] CORS settings configured
- [ ] Environment variables documented

### Authentication
- [ ] `gcloud auth login` executed
- [ ] Project set to `promptwars-495019`
- [ ] Required APIs enabled:
  - [ ] Cloud Run API
  - [ ] Cloud Build API
  - [ ] Container Registry API

## Deployment 🚀

### Option A: Automated Deployment
```powershell
# From project root
cd C:\Users\Chandrakant\Election_Guide
.\deploy.ps1
```

**Expected Output**:
```
[✓] Google Cloud SDK found
[✓] Project set to promptwars-495019
[✓] Required APIs enabled
[✓] Agent Service deployed: https://civicguide-agent-xxxxx-uc.a.run.app
[✓] Web Frontend deployed: https://civicguide-web-xxxxx-uc.a.run.app
```

### Option B: Manual Deployment

#### Step 1: Deploy Agent Service
```powershell
cd agent-service
gcloud run deploy civicguide-agent `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1" `
  --memory 1Gi --cpu 1 --timeout 3600
```

**Note the Agent URL**: `https://civicguide-agent-xxxxx-uc.a.run.app`

#### Step 2: Deploy Web Service
```powershell
cd ../web

# Set environment variables
$Env:AGENT_SERVICE_URL = "https://civicguide-agent-xxxxx-uc.a.run.app"

gcloud run deploy civicguide-web `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807,NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa,NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4,GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,AGENT_SERVICE_URL=$Env:AGENT_SERVICE_URL" `
  --memory 1Gi --cpu 1 --timeout 3600
```

## Post-Deployment 🎯

### Verification
- [ ] Agent service is running: `gcloud run services describe civicguide-agent --region us-central1`
- [ ] Web service is running: `gcloud run services describe civicguide-web --region us-central1`
- [ ] Both services accessible via HTTPS
- [ ] No critical errors in logs

### Health Checks
```powershell
# Check agent service
curl https://civicguide-agent-xxxxx-uc.a.run.app/health

# Check web service
curl https://civicguide-web-xxxxx-uc.a.run.app/

# View logs
gcloud run logs read civicguide-agent --region us-central1 --limit 50
gcloud run logs read civicguide-web --region us-central1 --limit 50
```

### Testing Features
- [ ] Homepage loads successfully
- [ ] Login with Google works
- [ ] Dashboard displays
- [ ] Chat assistant responds
- [ ] Candidate comparison works
- [ ] Booth finder loads
- [ ] Notifications can be enabled
- [ ] Settings page accessible

### Monitoring Setup
- [ ] Enable Cloud Logging for both services
- [ ] Set up alerts for errors
- [ ] Monitor CPU and memory usage
- [ ] Track request latency

## Rollback Plan 🔄

### If Deployment Fails
```powershell
# View previous revisions
gcloud run revisions list --service=civicguide-web --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic civicguide-web `
  --to-revisions <PREVIOUS_REVISION_ID>=100 `
  --region=us-central1
```

### If Issues Found
1. Check logs for error details
2. Fix the issue in code
3. Redeploy with `.\deploy.ps1`
4. Monitor new deployment

## Environment Variables Reference

### Required for Agent Service
```
GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM
FIREBASE_PROJECT_ID=promptwar-cddf1
PORT=8000 (automatically set by Cloud Run)
```

### Required for Web Service
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807
NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY
GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM
AGENT_SERVICE_URL=https://civicguide-agent-xxxxx-uc.a.run.app
PORT=3000 (automatically set by Cloud Run)
```

## Useful Commands

### Service Management
```powershell
# List all services
gcloud run services list --region us-central1

# View service details
gcloud run services describe civicguide-web --region us-central1

# Update environment variables
gcloud run services update civicguide-web `
  --region us-central1 `
  --set-env-vars KEY=VALUE

# Scale services
gcloud run services update civicguide-web `
  --region us-central1 `
  --max-instances 20 `
  --min-instances 1

# Delete service (if needed)
gcloud run services delete civicguide-web --region us-central1
```

### Monitoring
```powershell
# View logs in real-time
gcloud run logs read civicguide-web --region us-central1 --follow

# Get logs from past hour
gcloud run logs read civicguide-web --region us-central1 --limit 200

# Search for errors
gcloud run logs read civicguide-web --region us-central1 --filter="severity>=ERROR"
```

## Contact Support

- **Documentation**: See DEPLOYMENT_GUIDE.md and INTEGRATION_TESTING_GUIDE.md
- **Troubleshooting**: Check logs with `gcloud run logs read`
- **Issues**: Review development-plan.md for requirements

## Deployment Completion

Once deployment is complete:

✅ **Agent Service URL**: https://civicguide-agent-[hash]-uc.a.run.app  
✅ **Web Application URL**: https://civicguide-web-[hash]-uc.a.run.app  

Share these URLs with users to access the deployed CivicGuide application!

---

**Last Verified**: May 3, 2026
**Project**: CivicGuide Election Platform
**Status**: Ready for Production Deployment
