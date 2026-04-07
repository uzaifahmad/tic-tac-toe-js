# Quick Start Deployment Guide

## Before You Deploy

1. **Set up Firebase Security Rules** in your Firebase Console:
   ```json
   {
     "rules": {
       "rooms": {
         "$roomId": {
           ".read": true,
           ".write": true,
           "board": {
             ".validate": "newData.val().length === 9"
           },
           "turn": {
             ".validate": "newData.val() === 'X' || newData.val() === 'O'"
           },
           "status": {
             ".validate": "newData.val() === 'waiting' || newData.val() === 'playing' || newData.val() === 'won' || newData.val() === 'draw'"
           }
         }
       }
     }
   }
   ```

2. **Get your Firebase credentials** from your Firebase project settings

## Choose Your Hosting

### 🌟 Easiest: GitHub Pages + GitHub Actions

```bash
# 1. Set GitHub Secrets (Repository Settings → Secrets)
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_DATABASE_URL
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID

# 2. Push to main branch
git add .
git commit -m "Add deployment configuration"
git push origin main

# 3. GitHub Actions will automatically deploy to github.io
# Your site will be live at: https://yourusername.github.io/tic-tac-toe-js
```

---

### ⭐ Recommended: Netlify (Most Beginner Friendly)

```bash
# 1. Go to netlify.com and sign up with GitHub
# 2. Click "New site from Git"
# 3. Select your tic-tac-toe-js repository
# 4. In Site settings → Build & deploy → Environment:
#    Add all 7 Firebase credentials as environment variables
# 5. Netlify will automatically deploy!
# Your site will be live at: https://[your-site].netlify.app
```

---

### 🚀 Modern: Vercel

```bash
# 1. Go to vercel.com and sign up with GitHub
# 2. Click "Import Project"
# 3. Select your tic-tac-toe-js repository
# 4. In Environment Variables section:
#    Add all 7 Firebase credentials
# 5. Vercel will automatically deploy!
# Your site will be live at: https://[your-project].vercel.app
```

---

### 💻 Simple: GitHub Pages (Manual)

If you want to use public credentials (okay for this project):

```bash
# 1. Edit config.js with your Firebase credentials
# 2. git add config.js
# 3. git rm --cached config.example.js
# 4. git commit -m "Add Firebase config"
# 5. git push origin main
# 6. Go to GitHub Settings → Pages → Deploy from main branch
# Your site will be live at: https://yourusername.github.io/tic-tac-toe-js
```

---

## Test Your Deployment

Once live:

1. **Test Friend Mode** - Should work immediately
2. **Test AI Mode** - Should work immediately
3. **Test Online Mode** - Create room, share code with a friend
4. **Check Firebase** - Monitor usage in Firebase Console

---

## Troubleshooting

### Game loads but online multiplayer doesn't work
- Check Firebase credentials in config.js
- Verify Firebase Security Rules are set
- Check browser console for errors (F12)

### Deployment fails on Netlify/Vercel
- Make sure all 7 environment variables are set
- Check that scripts/build-config.js exists
- Try redeploying from platform UI

### config.js is missing
- Run `npm run build` locally to test
- Make sure build script ran during deployment

---

## I Recommend: Netlify

1. ✅ Free tier generous for hobby projects
2. ✅ Environment secrets management built-in
3. ✅ Automatic HTTPS
4. ✅ Easy rollback
5. ✅ Good UI for beginners
6. ✅ One-click deployment from GitHub

**Next Steps**: Go to [netlify.com](https://netlify.com) and connect your GitHub repo!
