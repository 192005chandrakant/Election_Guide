# 🔐 Firebase Setup Instructions for CivicGuide

This document explains how to configure all required Firebase credentials for the CivicGuide webapp.

---

## 📋 Quick Checklist

- [ ] Firebase Client Config (✅ Already populated in `.env.local`)
- [ ] Firebase Service Account Key (⏳ Need to download)
- [ ] Firebase VAPID Key (⏳ Need to copy)
- [ ] Google Maps API Key (⏳ Need to create)
- [ ] Gemini API Key (✅ Already populated in `.env.local`)

---

## 🔑 STEP 1: Firebase Service Account Key

This is a **PRIVATE** key that allows your backend to access Firebase. Never share or commit this file!

### How to Get It:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **promptwar-cddf1**
3. Click **Settings** ⚙️ (gear icon at top)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. A JSON file will download automatically

### Where to Place It:

```
Election_Guide/
├── serviceAccountKey.json  ← Save it HERE
├── web/
├── agent-service/
└── dataconnect/
```

### Update `.env.local`:

```
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

### ⚠️ IMPORTANT: Add to `.gitignore`

The `.gitignore` file has already been configured to prevent this file from being committed. Do NOT commit `serviceAccountKey.json`!

---

## 🔔 STEP 2: Firebase VAPID Key

This key is needed for **push notifications** (FCM - Firebase Cloud Messaging).

### How to Get It:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **promptwar-cddf1**
3. Go to **Messaging** section (left sidebar)
4. Click **Cloud Messaging** tab
5. Under **Web Configuration**, you'll see:
   - **VAPID Key**: Copy this value

### Update `.env.local`:

Find this line in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_KEY_HERE
```

Replace `YOUR_VAPID_KEY_HERE` with the VAPID key you copied:
```
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🗺️ STEP 3: Google Maps API Key

This key enables the **Polling Station Finder** feature.

### How to Get It:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **API Key**
5. Copy the generated API key

### Enable Required APIs:

1. Still in **APIs & Services**
2. Go to **Library** tab
3. Search for and **ENABLE** each:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Distance Matrix API**

### Restrict API Key (Security Best Practice):

1. In **Credentials**, click on your API Key
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Add your domain(s):
   ```
   http://localhost:3000/*
   https://yourdomain.com/*
   ```
4. Under **API restrictions**, select **Maps JavaScript API, Places API, Geocoding API, Distance Matrix API**

### Update `.env.local`:

Find this line:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

Replace with your API key:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Verification

Once you've filled in all credentials, verify the setup:

### Check Web App Starts:

```bash
cd web
npm run dev
```

You should see:
```
▲ Next.js 16.2.4
- Local:        http://localhost:3000
- Environments: .env.local
```

### Test Firebase Connection:

1. Open http://localhost:3000
2. Try to **Sign In** with Google
3. Check if authentication works
4. Go to Dashboard - should load user profile

### Test Agent Service:

1. Make sure Python agent is running:
   ```bash
   cd agent-service
   python main.py
   ```
2. Ask a question in the Chat assistant
3. Should get a response

### Test Notifications:

1. Go to Settings
2. Enable "Turn on push notifications"
3. Browser should ask for permission
4. Should be able to save FCM token

---

## 🚨 Environment Variables Summary

### Public Variables (Safe to commit):
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
GEMINI_API_KEY (if already public)
AGENT_SERVICE_URL
```

### Private Variables (NEVER commit):
```
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID
```

---

## 🔒 Security Checklist

- [ ] `serviceAccountKey.json` is in `.gitignore`
- [ ] Never commit `.env.local`
- [ ] API keys are restricted to specific domains/APIs
- [ ] Service account key is stored securely (not in git, not in code)
- [ ] Firestore security rules are configured (see below)

---

## 🛡️ Firestore Security Rules

These have been configured in `web/.env.local`. Here's what they do:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Users can only access their own chat history
    match /agent_chats/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Elections data is public (read-only)
    match /elections/{document=**} {
      allow read: if true;
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

To apply these rules:
1. Firebase Console → Firestore → Rules
2. Copy & paste the rules above
3. Click "Publish"

---

## 🐛 Troubleshooting

### Error: "Firebase Admin SDK is not initialized"
- [ ] Check `FIREBASE_SERVICE_ACCOUNT_PATH` points to correct file
- [ ] Verify `serviceAccountKey.json` is in project root
- [ ] Check file is valid JSON

### Error: "VAPID key is invalid"
- [ ] Verify VAPID key is copied correctly from Firebase Console
- [ ] Check for extra spaces before/after the key
- [ ] VAPID keys start with `BK...`

### Error: "Google Maps API is not enabled"
- [ ] Verify Maps JavaScript API is enabled
- [ ] Check API key is not restricted too tightly
- [ ] Wait 5-10 minutes after enabling (APIs take time to activate)

### Firebase Authentication Not Working
- [ ] Check Google OAuth consent screen is configured
- [ ] Verify `localhost:3000` is in authorized redirect URIs
- [ ] Clear browser cache and try again

---

## 📞 Need Help?

Reference files:
- [Firebase Setup Guide](./development-plan.md)
- [Architecture Documentation](./architecture.md)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**Last Updated:** May 1, 2026
**Status:** Ready for configuration
