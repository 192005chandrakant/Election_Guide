# CivicGuide Integration & Testing Guide

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│              (Port 3000 - Cloud Run Dynamic)                │
├─────────────────────────────────────────────────────────────┤
│  Pages: Dashboard, Guide, Candidates, Booth Map, Settings   │
│  Components: UI, Auth, Notifications, Accessibility         │
│  Services: Firebase Auth, Firestore, FCM, Google Maps       │
└────────────────┬────────────────────────────────────────────┘
                 │ CORS Enabled (*/*)
                 │ API Routes
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                         │
│              (Port 8000 - Cloud Run Dynamic)                │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                    │
│  - /chat - AI Chat with Gemini                             │
│  - /agents - Agent Catalog                                 │
│  - /notifications - Push Notifications                     │
│  - /health - Health Check                                  │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴────────┐
         ↓                ↓
    Gemini API      Firebase Admin
    (Generative)    (Auth, Firestore)
```

## 2. Component Integration Checklist

### Frontend Components
- [ ] **Authentication** (`auth-context.tsx`)
  - Firebase Auth integration
  - User session management
  - Protected routes
  
- [ ] **Navigation** (`navbar.tsx`, `workflow-rail.tsx`)
  - Route navigation
  - Mobile responsive menu
  - Active page indicators
  
- [ ] **Dashboard** (`app/dashboard/page.tsx`)
  - Readiness score display
  - Checklist progress
  - Action recommendations
  
- [ ] **Assistant** (`app/assistant/page.tsx`)
  - Chat interface
  - AI response handling
  - Conversation history
  
- [ ] **Candidates** (`app/candidates/page.tsx`)
  - Candidate comparison
  - Issue filtering
  - AI analysis integration
  
- [ ] **Booth Finder** (`app/map/page.tsx`)
  - Google Maps integration
  - Polling booth search
  - Location services
  
- [ ] **Settings** (`app/settings/page.tsx`)
  - User preferences
  - Accessibility options
  - Notification settings

### Backend Services
- [ ] **Chat Service** (`/api/chat`)
  - Query processing
  - Gemini API integration
  - Response formatting
  
- [ ] **Agent Service** (`/api/agents`)
  - Agent catalog
  - Fallback handling
  
- [ ] **Readiness Service** (`/api/readiness`)
  - Score calculation
  - Progress tracking
  
- [ ] **User Service** (`/api/user`)
  - Profile management
  - Preference storage
  
- [ ] **Notifications** (`/api/notifications`)
  - FCM integration
  - Notification templates
  
- [ ] **Booth Search** (`/api/booths/search`)
  - Google Maps integration
  - Location queries
  
- [ ] **Candidate Analysis** (`/api/candidates/analyze`)
  - Gemini AI analysis
  - Comparison generation

### External Services
- [ ] **Firebase**
  - Authentication
  - Firestore Database
  - Cloud Messaging (FCM)
  
- [ ] **Google Cloud**
  - Gemini API
  - Google Maps API
  - Cloud Run Deployment
  
- [ ] **CORS Configuration**
  - Frontend CORS headers
  - Backend CORS middleware
  - Preflight requests handling

## 3. Local Testing Procedures

### Setup
```bash
# Install dependencies
npm install              # Frontend
pip install -r requirements.txt  # Backend

# Start services
npm run dev             # Frontend on :3000
python agent-service/main.py  # Backend on :8000
```

### Test Cases

#### 1. Authentication Flow
```
Test: User Login
1. Navigate to /login
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify user is redirected to dashboard
5. Check Firebase Auth token in localStorage
Expected: User authenticated, token present
```

#### 2. Dashboard Readiness Score
```
Test: Readiness Score Calculation
1. Navigate to /dashboard
2. Verify score displays (0-100)
3. Check checklist items show correct status
4. Click on incomplete item
5. Mark item as complete
6. Verify score updates
Expected: Score updates in real-time, checklist changes persisted
```

#### 3. AI Chat Assistant
```
Test: Chat with AI Agent
1. Navigate to /assistant
2. Select an agent (Guide, Helper, etc.)
3. Type a question: "How do I register to vote?"
4. Wait for response
5. Check response formatting and content
Expected: Response appears in chat, proper formatting, no errors
```

#### 4. Candidate Analysis
```
Test: Candidate Comparison
1. Navigate to /candidates
2. Enter candidate names: "Candidate A", "Candidate B"
3. Select issues: "Education", "Healthcare"
4. Click "Compare"
5. Wait for analysis
6. Check comparison results
Expected: Analysis loads, proper formatting, neutral tone
```

#### 5. Booth Finder
```
Test: Polling Booth Search
1. Navigate to /map
2. Enter location: "New Delhi"
3. Click "Find Booths"
4. Wait for results
5. Click on a booth result
6. Verify booth details display
Expected: Map loads, booths appear, details show correctly
```

#### 6. Notifications
```
Test: Push Notifications
1. Enable notifications in settings
2. Open DevTools Console
3. Check for FCM token in logs
4. Trigger notification from backend
5. Verify notification appears
Expected: Notification received, displayed correctly
```

#### 7. API Communication
```
Test: API CORS and Responses
1. Open DevTools Network tab
2. Trigger API call from frontend
3. Check request/response headers
4. Verify CORS headers present
5. Check response status (200)
Expected: CORS headers present, successful responses
```

## 4. Error Handling & Recovery

### Common Issues and Solutions

#### Issue: CORS Error in Console
```
Error: "Access to XMLHttpRequest at 'http://127.0.0.1:8000/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy"

Solution:
1. Verify backend CORS middleware is enabled
2. Check allowed origins in main.py:
   allow_origins=["*"]
3. Restart backend service
4. Clear browser cache
```

#### Issue: Gemini API Key Invalid
```
Error: "401 Unauthorized" from Gemini API

Solution:
1. Verify GEMINI_API_KEY in .env files
2. Check key is valid in Google Cloud Console
3. Ensure API is enabled: "Generative Language API"
4. Regenerate key if necessary
```

#### Issue: Firebase Connection Failed
```
Error: "Unable to connect to Firestore"

Solution:
1. Check Firebase project ID matches config
2. Verify serviceAccountKey.json exists
3. Check Firebase credentials in environment
4. Ensure Firestore database is enabled
```

#### Issue: Google Maps API Not Loading
```
Error: "Google Maps API key is invalid"

Solution:
1. Verify NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
2. Check APIs enabled:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Verify key restrictions match domain
```

## 5. Feature Validation Checklist

### Core Features
- [ ] User can create account and log in
- [ ] Dashboard shows readiness score
- [ ] Checklist progress updates correctly
- [ ] AI assistant responds to queries
- [ ] Candidate comparison works
- [ ] Booth finder locates polling stations
- [ ] Notifications can be enabled/disabled
- [ ] Settings persist across sessions

### Accessibility Features
- [ ] High contrast mode works
- [ ] Text size can be adjusted
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible
- [ ] Simple language mode simplifies text

### Performance
- [ ] Page load time < 3 seconds
- [ ] Smooth animations (60 FPS)
- [ ] No console errors or warnings
- [ ] API responses < 500ms
- [ ] Images optimized and lazy-loaded

### Security
- [ ] No sensitive data in localStorage
- [ ] API keys not exposed in frontend
- [ ] HTTPS enforced (production)
- [ ] CSRF tokens present
- [ ] Input validation on all forms

## 6. Deployment Testing

### Pre-Deployment Checks
```bash
# TypeScript compilation
npm run build

# Linting
npm run lint

# Build Docker image
docker build -t civicguide-web:latest ./web
docker build -t civicguide-agent:latest ./agent-service

# Test Docker locally
docker run -p 3000:3000 civicguide-web:latest
docker run -p 8000:8000 civicguide-agent:latest
```

### Post-Deployment Verification
```bash
# Check service status
gcloud run services list

# View logs
gcloud run logs read civicguide-web --region us-central1 --limit 100
gcloud run logs read civicguide-agent --region us-central1 --limit 100

# Test endpoints
curl https://civicguide-web.run.app/api/agents
curl https://civicguide-agent.run.app/health

# Monitor metrics
gcloud monitoring dashboards list
gcloud logging read "resource.service.name=civicguide-web" --limit 10
```

## 7. Performance Monitoring

### Key Metrics to Monitor
1. **Response Time**: Target < 500ms for API calls
2. **Error Rate**: Target < 0.1%
3. **Availability**: Target > 99.9%
4. **Memory Usage**: Monitor spikes and optimization
5. **CPU Usage**: Scale services based on demand

### Cloud Run Monitoring
```bash
# Set up monitoring
gcloud monitoring metrics-descriptors list --filter="metric.type:run.googleapis.com/*"

# View resource metrics
gcloud run services describe civicguide-web --region us-central1 --format json

# Set up alerts (via Google Cloud Console)
# - High error rate
# - High latency
# - High memory usage
```

## 8. Rollback Procedures

### If Deployment Fails
```bash
# View previous revisions
gcloud run revisions list --service=civicguide-web --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic civicguide-web `
  --to-revisions <previous-revision-id>=100 `
  --region=us-central1
```

## 9. Continuous Integration (CI/CD)

### Recommended Setup
- Use Cloud Build to automatically build and deploy on push
- Run tests before deployment
- Verify all checks pass before merging
- Deploy to staging environment first
- Promote to production after validation

### Cloud Build Configuration
```yaml
steps:
  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/civicguide-web:$SHORT_SHA', './web']
  
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/civicguide-agent:$SHORT_SHA', './agent-service']
  
  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/civicguide-web:$SHORT_SHA']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/civicguide-agent:$SHORT_SHA']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args: ['run', '--deploy', '-f=k8s/', '-i', 'gcr.io/$PROJECT_ID']
```

## 10. Support & Debugging

### Useful Commands
```bash
# Check service health
gcloud run services describe civicguide-web --region us-central1

# View detailed logs
gcloud run logs read civicguide-web --region us-central1 --limit 1000

# SSH into running container (if enabled)
gcloud run services describe civicguide-web --region us-central1 --format json

# Test external connectivity
curl -I https://civicguide-web.run.app
curl -I https://civicguide-agent.run.app

# Update service configuration
gcloud run services update civicguide-web `
  --memory 2Gi `
  --cpu 2 `
  --region us-central1
```

## Summary

This guide covers the complete integration and testing of CivicGuide. Before deploying to production:

1. ✅ Complete all local testing
2. ✅ Fix any errors found
3. ✅ Verify all features work
4. ✅ Run security checks
5. ✅ Test performance
6. ✅ Document any issues
7. ✅ Deploy to Cloud Run
8. ✅ Monitor post-deployment
9. ✅ Set up alerts
10. ✅ Plan rollback strategy
