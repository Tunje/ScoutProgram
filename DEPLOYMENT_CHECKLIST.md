# Deployment Checklist for Netlify

## ✅ Pre-Deployment Checklist

### Code Quality
- [x] All TypeScript lint errors fixed
- [x] Unused variables removed
- [x] Firebase configuration set up
- [x] Environment variables configured
- [x] Netlify configuration files created

### Files Ready
- [x] `admin/netlify.toml` - Netlify config for admin site
- [x] `scanner/netlify.toml` - Netlify config for scanner site
- [x] `admin/.env` - Firebase environment variables
- [x] `scanner/.env` - Firebase environment variables
- [x] `.gitignore` files created

## 📋 Deployment Steps

### 1. Prepare Git Repository

```bash
cd c:\Users\simon\PROGRAMING\Scoutapp
git init
git add .
git commit -m "Initial commit: Scout Points Registration System"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/scout-points.git
git push -u origin main
```

### 2. Deploy Admin Site to Netlify

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - **Site name**: `scout-admin` (or your choice)
   - **Base directory**: `admin`
   - **Build command**: `npm run build`
   - **Publish directory**: `admin/dist`
5. Add environment variables (from `admin/.env`):
   ```
   VITE_FIREBASE_API_KEY=AIzaSyB5cei3yHomoAd83CKcR2tWZD2-eCR0aG8
   VITE_FIREBASE_AUTH_DOMAIN=scoutprogram-1ed29.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=scoutprogram-1ed29
   VITE_FIREBASE_STORAGE_BUCKET=scoutprogram-1ed29.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=991586377103
   VITE_FIREBASE_APP_ID=1:991586377103:web:317f6982a3c5d4d8367ffa
   VITE_FIREBASE_MEASUREMENT_ID=G-02QNR36348
   ```
6. Click "Deploy site"

### 3. Deploy Scanner Site to Netlify

1. Click "Add new site" again
2. Select the same repository
3. Configure:
   - **Site name**: `scout-scanner` (or your choice)
   - **Base directory**: `scanner`
   - **Build command**: `npm run build`
   - **Publish directory**: `scanner/dist`
4. Add the same environment variables
5. Click "Deploy site"

### 4. Update QR Code URLs

After deployment, note your scanner URL (e.g., `https://scout-scanner.netlify.app`)

Edit `admin/src/pages/ControlCreator.tsx` around line 72:

```typescript
// Replace this line:
const qrCodeUrl = `${window.location.origin}/scan/${projectId}?control=${qrCodeData}`;

// With your actual scanner URL:
const qrCodeUrl = `https://scout-scanner.netlify.app/scan/${projectId}?control=${qrCodeData}`;
```

Then commit and push:

```bash
git add admin/src/pages/ControlCreator.tsx
git commit -m "Update QR code URL to production scanner"
git push
```

Netlify will automatically redeploy the admin site.

## 🧪 Testing Deployment

### Admin Site Test
1. Visit your admin site URL
2. Create a new project
3. Add a group
4. Create a control
5. Verify QR code generates correctly

### Scanner Site Test
1. Visit your scanner site URL
2. Sign up with a test account
3. Select the project you created
4. Select a group
5. Try scanning the QR code (use phone camera or another device)

### End-to-End Test
1. Create control in admin → Generate QR code
2. Display QR code on screen
3. Open scanner on phone
4. Scan QR code
5. Verify scan registers in Firebase
6. Check admin site for scan data (when leaderboard is implemented)

## 🔒 Security Notes

### Firebase Security Rules

Add these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all operations
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // More specific rules (optional, for better security)
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /controls/{controlId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /scans/{scanId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false; // Scans cannot be modified
    }
  }
}
```

### Environment Variables
- ✅ Firebase config is safe to commit (client-side)
- ✅ Security enforced through Firestore rules
- ✅ Authentication required for all operations

## 📱 Mobile Considerations

### Scanner App on Mobile
- Works on any modern mobile browser
- No app store submission needed
- Can be added to home screen (PWA-like)
- Camera access requires HTTPS (Netlify provides this)

### Adding to Home Screen
**iOS Safari:**
1. Open scanner site
2. Tap Share button
3. Tap "Add to Home Screen"

**Android Chrome:**
1. Open scanner site
2. Tap menu (3 dots)
3. Tap "Add to Home screen"

## 🎯 Post-Deployment

### Custom Domains (Optional)
1. Purchase domain (e.g., `scoutpoints.com`)
2. In Netlify: Domain settings → Add custom domain
3. Configure DNS:
   - `admin.scoutpoints.com` → Admin site
   - `scan.scoutpoints.com` → Scanner site

### Monitoring
- Check Netlify dashboard for build status
- Monitor Firebase usage in Firebase Console
- Review Firebase Authentication for user activity

## 🚨 Troubleshooting

### Build Fails
- Check Netlify build logs
- Verify `package.json` exists in base directory
- Ensure all dependencies are in `package.json`

### Environment Variables Not Working
- Must start with `VITE_` prefix
- Redeploy after adding variables
- Check for typos in variable names

### Camera Not Working
- Requires HTTPS (Netlify provides this automatically)
- Check browser permissions
- Try different browser

### QR Codes Not Scanning
- Verify scanner URL in QR code is correct
- Check that control belongs to selected project
- Ensure good lighting when scanning

## 📊 Monitoring & Analytics

Firebase provides built-in analytics. Check:
- Firebase Console → Analytics
- Number of users
- Active projects
- Scan frequency

## 💰 Cost Estimate

**Netlify Free Tier:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- **Cost: $0**

**Firebase Free Tier (Spark Plan):**
- 50,000 reads/day
- 20,000 writes/day
- 1GB storage
- **Cost: $0**

For typical scout events, free tiers should be sufficient!

## ✅ Final Checklist

Before going live:
- [ ] Both sites deployed successfully
- [ ] Environment variables configured
- [ ] QR code URL updated to production
- [ ] Firebase security rules enabled
- [ ] Test account created
- [ ] End-to-end test completed
- [ ] Mobile camera access tested
- [ ] Documentation shared with team

## 🎉 You're Ready!

Your Scout Points Registration System is now live and ready to use!

**Admin Site**: Manage projects, groups, and controls
**Scanner Site**: Scan QR codes and register points

Share the scanner URL with your leaders and start your event! 🚀
