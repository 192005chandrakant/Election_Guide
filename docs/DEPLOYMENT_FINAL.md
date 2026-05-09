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
   GEMINI_API_KEY=[REDACTED_GEMINI_API_KEY]
     FIREBASE_PROJECT_ID=promptwar-cddf1
     ```
   - Click **Deploy**

3
---

### Method 2: Using Git Bash (Terminal without alternate buffer issue)

1. **Open Git Bash** (Right-click folder → "Git Bash Here")

2. **Configure gcloud**
   ```bash
   gcloud config set project promptwars-495019
   gcloud auth login
   ```



4. **Get Agent URL and Deploy Web**
   ```bash
   AGENT_URL=$(gcloud run services describe civicguide-agent --region us-central1 
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
