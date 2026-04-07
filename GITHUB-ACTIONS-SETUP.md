# GitHub Actions → Netlify Deployment Setup

## Why Use GitHub Actions for Netlify?
- ✅ More control over build process
- ✅ Generate config.js from GitHub secrets
- ✅ Automatic deployment on every push to main
- ✅ Works with protected branches
- ✅ Full CI/CD control

## Setup Steps

### 1. Get Netlify Auth Token

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Get your auth token
# It's stored in ~/.netlify/state.json (don't share this!)
```

Or get it from Netlify UI:
- Go to https://app.netlify.com
- User menu → Apps and authorizations → Personal access tokens
- Create new token → copy it

### 2. Get Netlify Site ID

```bash
# In your project directory
netlify status

# Look for "Site ID: xxxxx"
```

Or from Netlify UI:
- Go to your site → Site settings → General → Site information → Site ID

### 3. Add GitHub Secrets

Go to your GitHub repo:
1. **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add these 9 secrets:

```
FIREBASE_API_KEY           = (from Firebase console)
FIREBASE_AUTH_DOMAIN       = (from Firebase console)
FIREBASE_DATABASE_URL      = (from Firebase console)
FIREBASE_PROJECT_ID        = (from Firebase console)
FIREBASE_STORAGE_BUCKET    = (from Firebase console)
FIREBASE_MESSAGING_SENDER_ID = (from Firebase console)
FIREBASE_APP_ID            = (from Firebase console)
NETLIFY_AUTH_TOKEN         = (from step 1 above)
NETLIFY_SITE_ID            = (from step 2 above)
```

**⚠️ Important**: Treat these like passwords. Never share or commit them!

### 4. Test the Workflow

```bash
git add .github/workflows/deploy-netlify.yml
git commit -m "ci: Add GitHub Actions Netlify deployment"
git push origin main
```

Then:
1. Go to your GitHub repo → **Actions** tab
2. Watch the workflow run
3. It should:
   - Generate config.js from secrets
   - Deploy to Netlify
   - Show deployment URL when done

## Monitoring Deployments

### GitHub
- **Actions** tab → See all workflow runs
- Click a run to see logs
- See deployment status (success/failed)

### Netlify
- **Deployments** tab → See all deployed versions
- Logs available for each deployment
- Can rollback to previous version

## What Happens on Each Push

```
Push to main
    ↓
GitHub Actions triggered
    ↓
Generate config.js from secrets
    ↓
Deploy to Netlify
    ↓
Site live at your Netlify URL
```

## Troubleshooting

### Deployment fails: "NETLIFY_AUTH_TOKEN not found"
- Check GitHub Secrets are added correctly
- Secret name must match exactly (case-sensitive)
- Try re-creating the secret

### Deployment fails: "NETLIFY_SITE_ID not found"
- Verify Site ID from Netlify
- Check it's in GitHub Secrets

### Firebase config not working
- Check all 7 Firebase secrets are added
- Verify values match your Firebase project
- Check workflow logs for env var errors

### Build fails
- Check `npm run build` works locally: `node scripts/build-config.js`
- Check config.js was generated
- View GitHub Actions logs for error details

## Disabling Netlify Auto-Deploy (Optional)

If you want ONLY GitHub Actions to deploy (not Netlify's native integration):

1. Go to Netlify → Site settings → Build & deploy → Deploy contexts
2. Set: "Production branch deploy" → **None**
3. GitHub Actions will now be your only deployment method

## Switching Back to Netlify Auto-Deploy

If you want both (GitHub Actions + Netlify auto-deploy):
- Keep current setup - both will work
- Netlify will auto-deploy on push
- GitHub Actions will also deploy (may cause conflicts)

**Recommended**: Use GitHub Actions only to avoid double deployments

---

## Summary

Your deployment flow is now:
1. Write code locally
2. `git push origin main`
3. GitHub Actions automatically builds and deploys to Netlify
4. Site updates within 1-2 minutes
5. Check Netlify or GitHub Actions logs for status

🚀 **You're all set!** Push a change to test it out.
