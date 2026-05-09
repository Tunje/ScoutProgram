# Deploying to Netlify

## Prerequisites

1. GitHub account (or GitLab/Bitbucket)
2. Netlify account (free tier is fine)
3. Your code pushed to a Git repository

## Step 1: Push to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
cd c:\Users\simon\PROGRAMING\Scoutapp
git init
git add .
git commit -m "Initial commit - Scout Points System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy Admin Site

### Option A: Netlify UI (Recommended)

1. Go to [Netlify](https://www.netlify.com/) and sign in
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider (GitHub)
4. Select your repository
5. Configure build settings:
   - **Base directory**: `admin`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin/dist`
6. Add environment variables (click "Show advanced"):
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_AUTH_DOMAIN`: Your auth domain
   - `VITE_FIREBASE_PROJECT_ID`: Your project ID
   - `VITE_FIREBASE_STORAGE_BUCKET`: Your storage bucket
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your sender ID
   - `VITE_FIREBASE_APP_ID`: Your app ID
   - `VITE_FIREBASE_MEASUREMENT_ID`: Your measurement ID
7. Click "Deploy site"

### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy admin site
cd admin
netlify deploy --prod
```

## Step 3: Deploy Scanner App

Repeat the same process for the scanner app:

1. Click "Add new site" → "Import an existing project"
2. Select the same repository
3. Configure build settings:
   - **Base directory**: `scanner`
   - **Build command**: `npm run build`
   - **Publish directory**: `scanner/dist`
4. Add the same environment variables
5. Click "Deploy site"

## Step 4: Update QR Code URLs

After deployment, you'll get URLs like:
- Admin: `https://scout-admin-xyz.netlify.app`
- Scanner: `https://scout-scanner-xyz.netlify.app`

**Important**: Update the QR code generation in the admin app:

Edit `admin/src/pages/ControlCreator.tsx` line ~72:

```typescript
// Change from:
const qrCodeUrl = `${window.location.origin}/scan/${projectId}?control=${qrCodeData}`;

// To:
const qrCodeUrl = `https://YOUR-SCANNER-URL.netlify.app/scan/${projectId}?control=${qrCodeData}`;
```

Replace `YOUR-SCANNER-URL` with your actual scanner app URL.

## Step 5: Configure Custom Domains (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow instructions to configure DNS

Example domains:
- Admin: `admin.scoutpoints.com`
- Scanner: `scan.scoutpoints.com`

## Environment Variables

Both apps need these Firebase environment variables in Netlify:

```
VITE_FIREBASE_API_KEY=AIzaSyB5cei3yHomoAd83CKcR2tWZD2-eCR0aG8
VITE_FIREBASE_AUTH_DOMAIN=scoutprogram-1ed29.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scoutprogram-1ed29
VITE_FIREBASE_STORAGE_BUCKET=scoutprogram-1ed29.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=991586377103
VITE_FIREBASE_APP_ID=1:991586377103:web:317f6982a3c5d4d8367ffa
VITE_FIREBASE_MEASUREMENT_ID=G-02QNR36348
```

## Continuous Deployment

Once set up, Netlify will automatically:
- Deploy when you push to main branch
- Create preview deployments for pull requests
- Show build logs and errors

## Troubleshooting

### Build fails with "command not found"
- Make sure `package.json` is in the base directory
- Check that build command is `npm run build`

### Environment variables not working
- Ensure they start with `VITE_` prefix
- Redeploy after adding variables

### 404 errors on refresh
- The `netlify.toml` file handles this with redirects
- Make sure it's in the correct directory

### Camera not working on scanner
- HTTPS is required for camera access
- Netlify provides HTTPS by default
- Check browser permissions

## Testing Deployment

1. Visit your admin site URL
2. Create a test project and control
3. Generate QR code
4. Visit scanner site URL
5. Sign in and scan the QR code

## Cost

Netlify free tier includes:
- 100GB bandwidth/month
- 300 build minutes/month
- Automatic HTTPS
- Continuous deployment

This should be more than enough for most scout events!

## Alternative: Single Deployment

If you prefer, you can deploy both apps from a single Netlify site using a monorepo setup. However, deploying them separately (as described above) is simpler and recommended.

---

**Your apps are now live and accessible from anywhere! 🚀**
