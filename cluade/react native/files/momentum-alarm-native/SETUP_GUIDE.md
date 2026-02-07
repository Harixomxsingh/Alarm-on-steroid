# 📱 Complete Setup Guide - Momentum Alarm

## 🎯 Goal
Get this alarm app running on your iPhone and Android phone so you can test it in the real world.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Required Software

**On Your Computer:**

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Choose LTS version
   - Verify: `node --version` (should show v16+)

2. **Install Git** (for GitHub)
   - Download from: https://git-scm.com/
   - Verify: `git --version`

**On Your Phone(s):**

1. **Install Expo Go**
   - **iOS**: https://apps.apple.com/app/expo-go/id982107779
   - **Android**: https://play.google.com/store/apps/details?id=host.exp.exponent

---

### Step 2: Get the Code Running

**Open Terminal/Command Prompt:**

```bash
# Navigate to the project folder
cd momentum-alarm-native

# Install dependencies (takes 2-3 minutes)
npm install

# Start the development server
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

### Step 3: Run on Your Phone

**iOS (iPhone):**
1. Open Camera app
2. Point at QR code
3. Tap notification "Open in Expo Go"
4. App launches!

**Android:**
1. Open Expo Go app
2. Tap "Scan QR Code"
3. Point at QR code
4. App launches!

---

## 🧪 Testing the Alarm

### Quick Test (Don't wait for tomorrow!)

1. **Set alarm for 1 minute from now**
   - If current time is 10:30, set alarm for 10:31
   
2. **Wait 60 seconds**
   - Lock your phone
   - Put it down
   
3. **Alarm should trigger!**
   - Solve 3 math problems
   - Wait 60 seconds between each
   - Complete all 3 stages

### What to Test:

✅ Does alarm sound even when phone is locked?
✅ Is volume comfortable (not too loud)?
✅ Does vibration work?
✅ Can you solve math problems quickly?
✅ Does it work in Do Not Disturb mode?
✅ Does streak tracking work?

---

## 📤 Upload to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Momentum Alarm - React Native app"

# Create new repository on GitHub.com
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/momentum-alarm.git
git branch -M main
git push -u origin main
```

---

## 📦 Build Standalone Apps (Advanced)

### For Testing Without Computer:

**Install EAS CLI:**
```bash
npm install -g eas-cli
```

**Login to Expo:**
```bash
eas login
# Create account at https://expo.dev if needed
```

**Build Android APK:**
```bash
eas build -p android --profile preview
```
- Takes 10-20 minutes
- Downloads APK file
- Install directly on Android phone

**Build iOS (Requires Apple Developer Account - $99/year):**
```bash
eas build -p ios --profile preview
```

---

## 🔧 Common Issues & Fixes

### "npm install" fails
```bash
# Clear cache
npm cache clean --force
# Try again
npm install
```

### Can't see QR code
```bash
# Press 'r' to restart
# Or start fresh
npm start --clear
```

### Phone won't connect
- Make sure phone and computer are on **same WiFi**
- Disable VPN if using one
- Try restarting the Expo server

### Alarm doesn't ring when phone is locked
- **iPhone**: 
  - Settings → Notifications → Expo Go → Allow Notifications
  - Settings → Expo Go → Background App Refresh → ON
  
- **Android**: 
  - Settings → Apps → Expo Go → Battery → Unrestricted
  - Settings → Apps → Expo Go → Notifications → ON

### Wrong permissions
```bash
# iOS simulator only
npx expo run:ios

# Android emulator
npx expo run:android
```

---

## 🎨 Customization Ideas

Once it's working, you can customize:

1. **Challenge Types**
   - Add typing tests
   - Add trivia questions
   - Add memory games

2. **Difficulty Levels**
   - Easy mode (2+2)
   - Hard mode (47×13)
   - Adaptive difficulty

3. **Sound Options**
   - Upload custom alarm.mp3
   - Multiple alarm tones
   - Gradual volume increase

4. **Features**
   - Recurring alarms (weekdays only)
   - Multiple alarms
   - Shake to snooze prevention
   - Photo verification

---

## 📊 Next Steps After Testing

**If it works well:**
1. ✅ Build standalone APK/IPA
2. ✅ Install on phone permanently
3. ✅ Use it daily to wake up
4. ✅ Track your streak!

**If it needs improvement:**
1. 📝 Note what needs fixing
2. 🔧 Make changes to App.js
3. 🔄 Restart Expo server (automatically reloads)
4. 🧪 Test again

---

## 🆘 Get Help

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Stack Overflow**: Tag questions with `expo` and `react-native`

---

## 📱 Development Workflow

**Daily Development:**
```bash
# Start server
npm start

# Make changes to App.js
# Expo will auto-reload on phone

# Test immediately
```

**Before Bed Test:**
```bash
# Set alarm for tomorrow morning
# Close Expo, build standalone app for real testing
```

---

**Ready to wake up early? Let's go! 💪**
