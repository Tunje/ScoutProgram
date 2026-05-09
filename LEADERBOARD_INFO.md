# Leaderboard System

## Overview

The leaderboard shows real-time scores for all groups in a project, automatically calculating points from scanned controls.

## Features

### 🏆 Ranking System

**Podium Positions:**
- **1st Place**: Gold trophy 🥇 (yellow background)
- **2nd Place**: Silver medal 🥈 (gray background)
- **3rd Place**: Bronze award 🥉 (bronze background)
- **Other positions**: Numbered (#4, #5, etc.)

### 📊 Scoring

**Points Calculation:**
- Only **Points-type controls** award points
- Each scan adds the control's point value to the group's total
- Real-time updates as groups scan controls

**Ranking Logic:**
1. **Primary**: Total points (highest first)
2. **Tiebreaker**: Last scan time (earliest first - rewards faster completion)

### 📈 Statistics

**Group Cards Show:**
- Position/Medal
- Group name and kår
- Total points (large display)
- Number of scans
- Time of last scan

**Overall Statistics:**
- Total number of groups
- Total scans across all groups
- Total points awarded

## How It Works

### Real-Time Updates

The leaderboard automatically updates when:
- A group scans a control
- Points are awarded
- New groups register

### Accessing the Leaderboard

**From Admin Site:**
1. Open a project
2. Click the yellow "**View Leaderboard**" button
3. See live rankings

**Direct URL:**
```
/project/{projectId}/leaderboard
```

## Example Display

```
┌─────────────────────────────────────────┐
│ 🏆  Eagles                              │
│     Kår: Kåren Blå                      │
│                                    250  │
│                                  points │
│ ─────────────────────────────────────── │
│ 15 scans | Last scan: 14:32:15         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🥈  Wolves                              │
│     Kår: Kåren Röd                      │
│                                    240  │
│                                  points │
│ ─────────────────────────────────────── │
│ 14 scans | Last scan: 14:35:22         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🥉  Bears                               │
│     Kår: Kåren Grön                     │
│                                    230  │
│                                  points │
│ ─────────────────────────────────────── │
│ 13 scans | Last scan: 14:33:45         │
└─────────────────────────────────────────┘
```

## Control Types & Points

### Points Controls ✅
- Award points when scanned
- Example: "Checkpoint 1" = 10 points
- **Counted in leaderboard**

### Timer Controls ⏱️
- Start/stop/checkpoint timers
- No points awarded
- **Not counted in leaderboard**
- Could be used for time-based events

### Display Controls 💬
- Show messages only
- No points awarded
- **Not counted in leaderboard**
- Used for instructions/encouragement

## Use Cases

### Competition Mode
- Create only Points controls
- Groups compete for highest score
- Winner determined by total points

### Timed Events
- Use Timer controls for start/finish
- Points controls for checkpoints
- Leaderboard shows checkpoint completion

### Mixed Events
- Combine all control types
- Points for main challenges
- Timers for races
- Display for guidance

## Tips for Admins

### Setting Up Points
- Balance point values across controls
- Higher points for harder challenges
- Consider bonus points for special achievements

### Monitoring Progress
- Check leaderboard regularly
- See which groups are active
- Identify groups that need help

### Fair Competition
- Ensure all groups have equal access to controls
- Set clear rules about re-scanning
- Consider time limits if needed

## Future Enhancements

Potential features:
- [ ] Export leaderboard to PDF/CSV
- [ ] Historical view (show progress over time)
- [ ] Filter by kår
- [ ] Show individual scan details
- [ ] Projected winner based on current pace
- [ ] Achievements/badges
- [ ] Public leaderboard URL (read-only)

## Technical Details

### Data Source
- Reads from `scans` collection in Firestore
- Filters by `projectId`
- Joins with `groups` collection
- Real-time listeners for live updates

### Performance
- Efficient queries with Firestore indexes
- Client-side score calculation
- Minimal re-renders with React hooks

### Security
- Only shows claimed groups
- Requires authentication to view
- Admin-only access (can be changed)

---

**The leaderboard makes your scout event competitive and exciting! 🎯**
