# Production Deployment Checklist & Best Practices

## Pre-Deployment Verification

### Code Quality
- [ ] All code committed to git
- [ ] Run linting and tests locally
- [ ] Code review completed
- [ ] No debug/console.log statements in production code
- [ ] Environment variables properly configured

### Security
- [ ] All sensitive keys stored in Secret Manager (not in code/env files)
- [ ] CORS origins properly configured
- [ ] API keys rotated
- [ ] Service accounts have minimal required permissions
- [ ] Dockerfile runs as non-root user

### Testing
- [ ] Load testing completed
- [ ] Health check endpoints tested
- [ ] Fallback mechanisms verified
- [ ] Error handling tested with network failures
- [ ] API endpoints validated with production URLs

## Deployment Process

### 1. Environment Configuration
```bash
# Verify current configuration
gcloud config get-value project
gcloud config list --all

# Ensure all required APIs are enabled
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  cloudkms.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Secret Management
```bash
# List all secrets
gcloud secrets list

# Create or update a secret
echo -n "your-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-
# OR update existing
echo -n "your-api-key" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant Cloud Run service account access to secrets
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member=serviceAccount:civicguide-deploy@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### 3. Deployment Commands

#### Using deploy-production.ps1 (Recommended)
```powershell
# Regular deployment
.\deploy-production.ps1 -ProjectID promptwars-495019 -Region us-central1

# Dry run to see what would be deployed
.\deploy-production.ps1 -ProjectID promptwars-495019 -Region us-central1 -DryRun

# Skip Docker build if images are already built
.\deploy-production.ps1 -ProjectID promptwars-495019 -Region us-central1 -SkipBuild
```

#### Manual gcloud Deployment
```bash
# Deploy agent service
gcloud run deploy civicguide-agent \
  --source agent-service \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 100 \
  --min-instances 1 \
  --set-env-vars "ENVIRONMENT=production,FIREBASE_PROJECT_ID=promptwars-495019" \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest"

# Deploy web service
gcloud run deploy civicguide-web \
  --source web \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 2 \
  --max-instances 100 \
  --min-instances 1 \
  --set-env-vars "AGENT_SERVICE_URL=https://civicguide-agent-...run.app" \
  --set-secrets "NEXT_PUBLIC_FIREBASE_API_KEY=NEXT_PUBLIC_FIREBASE_API_KEY:latest"
```

## Post-Deployment Verification

### Health Checks
```bash
# Agent service
curl https://civicguide-agent-<hash>.run.app/health
curl https://civicguide-agent-<hash>.run.app/ready
curl https://civicguide-agent-<hash>.run.app/live

# Web service (may redirect or require authentication)
curl -I https://civicguide-web-<hash>.run.app
```

### Monitoring & Logging
```bash
# View real-time logs
gcloud run logs read civicguide-agent --region us-central1 --follow

# View last 50 entries
gcloud run logs read civicguide-agent --region us-central1 --limit 50

# Check service details
gcloud run services describe civicguide-agent --region us-central1

# View metrics in Cloud Monitoring
gcloud monitoring time-series list \
  --filter 'resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count"'
```

### Test API Endpoints
```bash
# Test agent service chat endpoint
curl -X POST https://civicguide-agent-<hash>.run.app/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I register to vote?",
    "userId": "test-user",
    "location": "Delhi",
    "agentMode": "guide"
  }'

# Test health endpoint
curl https://civicguide-agent-<hash>.run.app/health

# Test readiness probe
curl https://civicguide-agent-<hash>.run.app/ready
```

## Production Configuration Details

### Agent Service (civicguide-agent)
- **Memory**: 1 GB (adjustable based on load testing)
- **CPU**: 2 (for Python processing)
- **Min Instances**: 1 (always ready)
- **Max Instances**: 100 (scales to handle peak load)
- **Timeout**: 3600 seconds (for long-running requests)
- **Health Check**: `/health` endpoint (30s interval)
- **Readiness Probe**: `/ready` endpoint (checks initialization)
- **Liveness Probe**: `/live` endpoint (basic process check)

### Web Service (civicguide-web)
- **Memory**: 1 GB (Next.js is memory-hungry)
- **CPU**: 2
- **Min Instances**: 1
- **Max Instances**: 100
- **Timeout**: 3600 seconds
- **Health Check**: `/api/health` endpoint
- **Readiness Probe**: `/api/ready` endpoint

## Environment Variables

### Agent Service
```
GEMINI_API_KEY=<from Secret Manager>
FIREBASE_PROJECT_ID=promptwars-495019
FIREBASE_SERVICE_ACCOUNT_JSON=<from Secret Manager>
ALLOWED_ORIGINS=http://localhost:3000,https://civicguide-web-*.run.app
GEMINI_MODEL=gemini-2.0-flash-lite
ALLOWED_GEMINI_MODELS=gemini-2.0-flash-lite,gemini-2.0-flash,gemini-2.5-flash,gemini-1.5-flash
ENABLE_GEMINI=true
ENVIRONMENT=production
```

### Web Service
```
AGENT_SERVICE_URL=https://civicguide-agent-<hash>.run.app
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_FIREBASE_API_KEY=<from Secret Manager>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=promptwars-495019
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=promptwar-cddf1.firebaseapp.com
```

## Troubleshooting

### Service Won't Start
1. Check logs: `gcloud run logs read <service-name> --limit 50`
2. Verify environment variables: `gcloud run services describe <service-name>`
3. Check Secret Manager access: Ensure service account has `secretmanager.secretAccessor` role
4. Verify Dockerfile: Test build locally with `docker build -t test-image -f Dockerfile .`

### Health Check Failing
1. Verify endpoint is accessible: `curl https://<service-url>/health`
2. Check for startup errors: `gcloud run logs read <service-name> --limit 10`
3. Increase health check timeout if needed during deployment

### High Error Rate
1. Check logs for error patterns
2. Review Gemini API rate limits
3. Check database connection status
4. Verify environment variables are correctly set

### Scaling Issues
- Monitor Cloud Run metrics in Cloud Console
- Adjust min/max instances based on traffic patterns
- Consider using Cloud Scheduler for traffic spikes

## Rollback Procedure

### To Previous Revision
```bash
# Get previous revision URL
gcloud run revisions list --service=civicguide-agent --region us-central1

# Update traffic to point to previous revision
gcloud run services update-traffic civicguide-agent \
  --region us-central1 \
  --to-revisions REVISION_NAME=100

# Or redeploy from git
git revert HEAD
git push origin main
# Then re-run deployment
```

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Request Count**: Number of requests per second
2. **Request Latency**: P50, P95, P99 latencies
3. **Error Rate**: Percentage of 5xx errors
4. **CPU Usage**: Should stay under 70%
5. **Memory Usage**: Should stay under 70%

### Set Up Alerts
```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate Alert" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

## Security Best Practices

- [ ] Regularly rotate API keys
- [ ] Audit Secret Manager access logs
- [ ] Enable VPC Service Controls if needed
- [ ] Use IAM roles with least privilege
- [ ] Enable Binary Authorization for container images
- [ ] Regularly scan container images for vulnerabilities
- [ ] Keep dependencies updated
- [ ] Monitor Cloud Audit Logs for unusual activity

## Cost Optimization

- Use Cloud Run's pay-per-use pricing model effectively
- Set appropriate min/max instances
- Monitor and analyze costs in Cloud Console
- Consider Cloud Functions for lightweight endpoints
- Cache responses where applicable
- Use Cloud CDN for static content

## Documentation Links

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Cloud Monitoring](https://cloud.google.com/monitoring/docs)
- [Cloud Audit Logs](https://cloud.google.com/logging/docs/audit)
