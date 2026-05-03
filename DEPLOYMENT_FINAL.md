# CivicGuide - Google Cloud Run Deployment (Windows)

## ✅ Current Status
- Code committed and pushed to GitHub ✓
- Docker images configured ✓
- Environment variables ready ✓
- Project: `promptwars-495019`
- Region: `us-central1`

## 🚀 Deployment Methods

### Method 1: Google Cloud Console (Easiest - No Terminal Issues)

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com
   - Select Project: `promptwars-495019`

2. **Deploy Agent Service**
   - Go to **Cloud Run** (left menu)
   - Click **Create Service**
   - Select **Deploy one revision from an existing image** or **Deploy from source**
   - Source: GitHub (https://github.com/192005chandrakant/Election_Guide)
   - Directory: `agent-service/`
   - Runtime: Python 3.11
   - Region: `us-central1`
   - Memory: 1 GB
   - CPU: 1
   - Set Environment Variables:
     ```
     GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM
     FIREBASE_PROJECT_ID=promptwar-cddf1
     ```
   - Click **Deploy**

3. **Deploy Web Service**
   - Repeat for web directory
   - After agent deploys, get its URL
   - Add AGENT_SERVICE_URL environment variable:
     ```
     AGENT_SERVICE_URL=https://civicguide-agent-[hash]-uc.a.run.app
     NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807
     NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa
     NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY
     GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM
     ```

---

### Method 2: Using Git Bash (Terminal without alternate buffer issue)

1. **Open Git Bash** (Right-click folder → "Git Bash Here")

2. **Configure gcloud**
   ```bash
   gcloud config set project promptwars-495019
   gcloud auth login
   ```

3. **Deploy Agent Service**
   ```bash
   cd agent-service
   gcloud run deploy civicguide-agent \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM,FIREBASE_PROJECT_ID=promptwar-cddf1" \
     --memory 1Gi \
     --cpu 1
   ```

4. **Get Agent URL and Deploy Web**
   ```bash
   AGENT_URL=$(gcloud run services describe civicguide-agent --region us-central1 --format="value(status.url)")
   
   cd ../web
   gcloud run deploy civicguide-web \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="AGENT_SERVICE_URL=$AGENT_URL,NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCNMFTowGSImfl8-sT2TYc8Iak-5AXBAak,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com,NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwar-cddf1,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=promptwar-cddf1.firebasestorage.app,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1072664273807,NEXT_PUBLIC_FIREBASE_APP_ID=1:1072664273807:web:9c7d9e7917ac01f5d8a1fa,NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBdNsFv6g-ZFFydfIoFPRVgQZxDHcTCyVjSSnw0zh0KHZ9ifEeTYdL4yRxErlBVZUnAZymRvFVBRBbKi_kP3nV4,NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDYWL4mILugV4-q2V9xVO2YqmXNHfT72hY,GEMINI_API_KEY=AIzaSyBuEkEqYdOZ_gpQE--GLzeAERY-tNR3aUM" \
     --memory 1Gi \
     --cpu 1
   ```

---

### Method 3: Using Cloud Build (Automated CI/CD)

1. Connect GitHub to Google Cloud Build
2. Create build trigger for main branch
3. Build and deploy on each push

---

## 📋 Recommended: Method 1 (Console) + Git Bash Fallback

**Why Method 1 (Console) is best:**
- No terminal buffer issues
- Visual progress tracking
- Easy environment variable management
- One-click deployment

**If you prefer CLI (Method 2):**
- Use Git Bash instead of PowerShell
- Avoids the alternate buffer problem
- Works reliably on Windows

---

## ✅ After Deployment

Once both services are deployed:

1. **Get URLs**
   ```bash
   gcloud run services list --region us-central1
   ```

2. **Test endpoints**
   - Web: https://civicguide-web-[hash]-uc.a.run.app
   - Agent: https://civicguide-agent-[hash]-uc.a.run.app/health

3. **View logs**
   ```bash
   gcloud run logs read civicguide-web --region us-central1 --limit 50
   gcloud run logs read civicguide-agent --region us-central1 --limit 50
   ```

---

## 🔐 Security Notes

- Service account keys (serviceAccountKey.json) are ignored by Git ✓
- Environment variables properly configured ✓
- Secrets not exposed in code ✓

---

## 🎯 Next Steps

Choose one:
1. **Use Console** (easiest) → Go to console.cloud.google.com
2. **Use Git Bash** (fastest) → Right-click folder → Git Bash Here
3. **Use Cloud Build** (automated) → Setup triggers in console

Your application is ready for production! 🚀
