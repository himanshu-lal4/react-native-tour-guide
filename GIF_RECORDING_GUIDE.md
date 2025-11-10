# GIF Recording Guide

## 🎬 Platform-Specific Demo Guide

This guide will help you record two distinct GIF demos - one for iOS and one for Android.

---

## 🍎 iOS GIF Recording

### Visual Style

- **Background**: Light gray (#F2F2F7)
- **Primary Color**: iOS Blue (#007AFF)
- **Accent Color**: iOS Green (#34C759)
- **Design**: Sleek, minimal with shadows
- **Border Radius**: Rounded (12-16px)

### Tour Steps (5 total)

1. **Welcome to iOS! 👋** (Rectangle)
   - Button: "Begin Tour"
   - Blue iOS button with shadow

2. **Perfect Circles ⭕** (Circle)
   - Red circular button (#FF3B30)
   - Shows circular spotlight

3. **Smart Scrolling 🍎** (Rectangle + Auto-scroll)
   - White bordered button
   - Demonstrates automatic scrolling

4. **Icon Spotlight 🎯** (Circle)
   - Orange circular icon (#FF9500)
   - Another circular spotlight example

5. **All Done! 🎉** (Rectangle)
   - Green button (#34C759)
   - Final step

### Button Text

- Next: "Continue"
- Previous: "Back"
- Done: "Done"

---

## 🤖 Android GIF Recording

### Visual Style

- **Background**: Light gray (#FAFAFA)
- **Primary Color**: Material Purple (#6200EE)
- **Accent Color**: Material Teal (#03DAC6)
- **Design**: Material Design with elevation
- **Border Radius**: Sharp (4-8px)

### Tour Steps (5 total)

1. **Welcome to Android! 🤖** (Rectangle)
   - Button: "Start Tour"
   - Purple Material button with elevation

2. **Circular Spotlight ⭕** (Circle)
   - Purple circular FAB (#BB86FC)
   - ➕ icon
   - Shows circular spotlight

3. **Auto-Scroll Feature 📜** (Rectangle + Auto-scroll)
   - Teal button (#03DAC6)
   - Demonstrates automatic scrolling

4. **Floating Action 🎯** (Circle)
   - Yellow circular FAB (#FFB300)
   - ⚡ icon
   - Another circular spotlight example

5. **Tour Complete! 🎉** (Rectangle)
   - Dark teal button (#018786)
   - Final step

### Button Text

- Next: "Next"
- Previous: "Previous"
- Done: "Finish"

---

## 📝 Recording Checklist

### Before Recording

- [ ] Run `npm run build` to compile latest changes
- [ ] Start the example app: `cd example && npm start`
- [ ] Run on iOS simulator or Android emulator
- [ ] Clear any previous tour data if needed
- [ ] Set up screen recording software

### iOS Recording

- [ ] Open iOS simulator (iPhone 14 Pro recommended)
- [ ] Tap "Begin Tour" button
- [ ] Navigate through all 5 steps
- [ ] Show both rectangle and circular spotlights
- [ ] Demonstrate auto-scroll on step 3
- [ ] Complete the tour

### Android Recording

- [ ] Open Android emulator (Pixel 6 recommended)
- [ ] Tap "Start Tour" button
- [ ] Navigate through all 5 steps
- [ ] Show both rectangle and circular spotlights
- [ ] Demonstrate auto-scroll on step 3
- [ ] Complete the tour

### Post-Recording

- [ ] Convert to GIF (optimize to < 5MB)
- [ ] Name files: `ios-demo.gif` and `android-demo.gif`
- [ ] Add to README.md

---

## 🎯 Key Differences to Highlight

### iOS Demo Should Show:

- Smooth rounded corners
- Subtle shadows
- iOS blue color (#007AFF)
- "Continue" / "Done" buttons
- Circular buttons with emoji: ⭕ and 🎯

### Android Demo Should Show:

- Material elevation effects
- Sharp corners (4px radius)
- Material purple/teal colors
- "Next" / "Finish" buttons
- Circular FABs with emoji: ➕ and ⚡

---

## 🔧 Technical Details

### Scroll Functionality

The tour now includes:

- ✅ Automatic detection of off-screen elements
- ✅ Smart scrolling to bring elements into view
- ✅ Safe zone calculation (120px offset for navigation)
- ✅ Smooth animations (400ms)

### Spotlight Precision

- ✅ Default padding: 0px (tight fit)
- ✅ Customizable per step (4px for rectangles, 8px for circles in demo)
- ✅ Circle shape uses `Math.max` to ensure full element visibility

---

## 📱 Running the Example

```bash
# Build the library
npm run build

# Navigate to example
cd example

# Install dependencies (if needed)
npm install

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 🎨 Color Reference

### iOS Colors

- Primary: `#007AFF` (iOS Blue)
- Success: `#34C759` (iOS Green)
- Circular 1: `#FF3B30` (iOS Red)
- Circular 2: `#FF9500` (iOS Orange)
- Background: `#F2F2F7`

### Android Colors

- Primary: `#6200EE` (Material Purple)
- Secondary: `#03DAC6` (Material Teal)
- Accent: `#018786` (Teal Dark)
- Circular 1: `#BB86FC` (Purple Light)
- Circular 2: `#FFB300` (Amber)
- Background: `#FAFAFA`

---

Good luck with your recordings! 🎬✨

