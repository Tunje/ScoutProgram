# Scout Points Registration System

A project-based scout points system with an admin React site for control management and a mobile-friendly scanner app for leaders to register group points via QR codes.

## Project Structure

```
Scoutapp/
├── admin/          # Admin web application
├── scanner/        # Scanner mobile application
└── README.md
```

## Features

### Admin Site
- Create and manage multiple projects
- Register groups/patrols to projects
- Create three types of controls:
  - **Points Controls**: Award specific points when scanned
  - **Timer Controls**: Start/stop/checkpoint timers
  - **Display Controls**: Show custom messages
- Generate QR codes for each control
- Real-time leaderboard (coming soon)

### Scanner App
- Firebase authentication
- Select active project
- Select group/patrol before scanning
- QR code scanner with camera
- Real-time feedback on scans
- Support for all control types

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- Firebase project with:
  - Authentication (Email/Password enabled)
  - Firestore Database
  - Web app registered

### Installation

1. **Install dependencies for Admin app:**
   ```bash
   cd admin
   npm install
   ```

2. **Install dependencies for Scanner app:**
   ```bash
   cd scanner
   npm install
   ```

### Running the Applications

**Admin Site:**
```bash
cd admin
npm run dev
```
The admin site will be available at `http://localhost:5173`

**Scanner App:**
```bash
cd scanner
npm run dev
```
The scanner app will be available at `http://localhost:5174`

## Usage Workflow

1. **Create a Project** (Admin Site)
   - Open admin site
   - Click "New Project"
   - Enter project name

2. **Add Groups** (Admin Site)
   - Open the project
   - Click "Add Group"
   - Enter group names (e.g., "Patrol 1", "Patrol 2")

3. **Create Controls** (Admin Site)
   - Click "New Control"
   - Configure control settings:
     - Name (e.g., "Checkpoint 1")
     - Type (Points/Timer/Display)
     - Display text
     - Points value (if Points type)
   - Save to generate QR code
   - Print or download QR code

4. **Place QR Codes** (Physical)
   - Print the generated QR codes
   - Place them at control points in the real world

5. **Scan Controls** (Scanner App)
   - Leaders log in to scanner app
   - Select the active project
   - Select which group they're scanning for
   - Tap "Start Scanning"
   - Scan the QR code
   - System registers the scan and shows feedback

6. **View Results** (Admin Site)
   - Open project in admin site
   - View leaderboard with real-time points

## Firebase Configuration

Both apps use the same Firebase configuration stored in `.env` files:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Database Structure

### Collections

**projects/**
- `name`: string
- `createdAt`: timestamp
- `status`: 'active' | 'archived'

**groups/**
- `projectId`: string
- `name`: string
- `color`: string (hex color)
- `createdAt`: timestamp

**controls/**
- `projectId`: string
- `name`: string
- `type`: 'timer' | 'points' | 'display'
- `displayText`: string
- `pointsValue`: number (optional)
- `timerConfig`: object (optional)
- `createdAt`: timestamp

**scans/**
- `projectId`: string
- `groupId`: string
- `controlId`: string
- `scannedBy`: string (user ID)
- `scannedAt`: timestamp
- `pointsAwarded`: number (optional)
- `timerData`: object (optional)

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **QR Generation**: qrcode.react
- **QR Scanning**: html5-qrcode
- **Backend**: Firebase (Firestore + Auth)

## Building for Production

**Admin:**
```bash
cd admin
npm run build
```

**Scanner:**
```bash
cd scanner
npm run build
```

Build output will be in the `dist/` folder of each app.

## Deployment

Both apps can be deployed to:
- Firebase Hosting
- Netlify
- Vercel
- Any static hosting service

## Security Notes

- Firebase configuration in `.env` files is safe to commit (client-side config)
- Security is enforced through Firestore security rules
- Only authenticated users can access data
- Consider adding Firestore rules to restrict write access

## Future Enhancements

- [ ] Real-time leaderboard with live updates
- [ ] Export results to CSV/PDF
- [ ] Photo upload at controls
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Advanced statistics
- [ ] Duplicate scan prevention
- [ ] Time-based control windows

## Support

For issues or questions, please check the Firebase console for errors and ensure:
- Authentication is enabled
- Firestore database is created
- Camera permissions are granted (for scanner)
- QR codes contain valid URLs

## License

MIT
