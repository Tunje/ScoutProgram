# Quick Start Guide

## 🚀 Your Scout Points System is Ready!

Both applications are now running:

- **Admin Site**: http://localhost:5173
- **Scanner App**: http://localhost:5174

## First Steps

### 1. Open the Admin Site (http://localhost:5173)

The admin dashboard will load. You can now:

1. **Create Your First Project**
   - Click "New Project"
   - Enter a name like "Summer Camp 2024"
   - Click "Create"

2. **Add Groups/Patrols**
   - Click on your project
   - Click "Add Group"
   - Add groups like "Eagles", "Wolves", "Bears", etc.

3. **Create Controls**
   - Click "New Control"
   - Fill in the details:
     - **Name**: e.g., "Checkpoint 1"
     - **Type**: Choose Points, Timer, or Display
     - **Display Text**: Message shown when scanned
     - **Points**: If type is Points, set the value
   - Click "Create Control"
   - A QR code will be generated!

4. **Print QR Codes**
   - After creating a control, you'll see the QR code
   - Click "Print QR Code" or right-click to save
   - Print and place at physical locations

### 2. Open the Scanner App (http://localhost:5174)

1. **Create an Account**
   - Click "Don't have an account? Sign up"
   - Enter email and password
   - Click "Sign Up"

2. **Select Project**
   - You'll see all active projects
   - Click on the project you created

3. **Select Group**
   - Choose which group/patrol you're scanning for
   - The selected group will be highlighted

4. **Start Scanning**
   - Click "Start Scanning"
   - Allow camera access when prompted
   - Point camera at QR code
   - Scan is registered automatically!

## Testing the System

### Quick Test Workflow:

1. **Admin Site**:
   - Create project "Test Project"
   - Add group "Test Group"
   - Create a Points control worth 10 points
   - Keep the QR code visible on screen

2. **Scanner App** (on phone or second browser):
   - Sign in
   - Select "Test Project"
   - Select "Test Group"
   - Start scanning
   - Scan the QR code from admin site
   - See success message with points!

3. **Back to Admin Site**:
   - View the leaderboard (coming soon)
   - See the scan was registered

## Control Types Explained

### Points Control
- Awards fixed points when scanned
- Example: "Checkpoint 1 - 10 points"
- Use for: Activity completion, challenges

### Timer Control
- Start/Stop/Checkpoint timers
- Example: "Start Line" (start timer), "Finish Line" (stop timer)
- Use for: Races, timed activities

### Display Control
- Shows custom message only
- Example: "Great job! Move to next station"
- Use for: Instructions, encouragement

## Tips

- **Multiple Scans**: Each group can scan every control
- **Group Selection**: Leaders can switch between groups without re-scanning
- **Real-time**: All scans are saved to Firebase instantly
- **Offline**: Scanner needs internet to save scans

## Troubleshooting

**Camera not working?**
- Check browser permissions
- Use HTTPS in production (required for camera)
- Try a different browser

**QR code not scanning?**
- Ensure good lighting
- Hold camera steady
- Make sure QR code is in focus
- Check that control belongs to selected project

**Can't see projects?**
- Make sure project status is "active"
- Check Firebase console for errors
- Verify Firestore database is created

## Next Steps

1. Create your real projects and groups
2. Design and create controls for your event
3. Print QR codes and place them
4. Give scanner app access to leaders
5. Run your event!

## Need Help?

Check the main README.md for:
- Detailed setup instructions
- Database structure
- Deployment guide
- Security configuration

---

**Have fun with your Scout Points System! 🎯**
