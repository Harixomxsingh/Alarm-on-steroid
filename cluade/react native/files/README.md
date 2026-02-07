# 🔥 Momentum Alarm - React Native

**An alarm on steroids that forces you to wake up through progressive challenges!**

## 🎯 Features

- ⏰ **Smart Alarm System** - Set your wake-up time
- 🧮 **3-Stage Math Challenges** - Must solve to turn off alarm
- ⚡ **60-Second Intervals** - Keeps you alert between stages
- 🏆 **Streak Tracking** - Track your consistency
- 💡 **Daily Insights** - Motivational wisdom each morning
- 📚 **Vocabulary Builder** - Learn a new word daily
- 📱 **Works on Lock Screen** - Alarm triggers even when phone is locked
- 🔊 **Medium Volume** - Won't damage speakers
- 📳 **Vibration Support** - Haptic feedback
- 🌙 **DND Override** - Works in Do Not Disturb mode

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your phone (from App Store / Play Store)

### Setup Steps

1. **Clone or download this project**
   ```bash
   cd momentum-alarm-native
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device**
   
   **For iOS:**
   - Install "Expo Go" from App Store
   - Scan QR code with Camera app
   - Or press `i` in terminal to open iOS simulator
   
   **For Android:**
   - Install "Expo Go" from Play Store
   - Scan QR code with Expo Go app
   - Or press `a` in terminal to open Android emulator

## 📱 Building for Production

### Create Standalone APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build -p android --profile preview
```

### Create IPA (iOS)

```bash
# Build for iOS
eas build -p ios --profile preview
```

The build will be available in your Expo account dashboard.

## 🎮 How to Use

1. **Set Alarm Time**
   - Tap on the time display
   - Use arrows to set hours and minutes
   - Tap "CONFIRM ALARM"

2. **When Alarm Triggers**
   - Solve the math problem to proceed
   - You'll go through 3 phases
   - Each phase has a 60-second wait period
   - Complete all 3 to turn off alarm

3. **Success!**
   - See your daily insight and vocabulary
   - View your streak
   - Reset for tomorrow

## 🔧 Customization

### Change Challenge Difficulty
In `App.js`, modify the `generateMathTask()` function:

```javascript
// Make it harder
a = Math.floor(Math.random() * 100) + 50; // Bigger numbers
b = Math.floor(Math.random() * 50) + 25;
```

### Change Alarm Volume
In `App.js`, find `playAlarmSound()`:

```javascript
{ 
  shouldPlay: true, 
  isLooping: true,
  volume: 0.7 // Change this (0.0 - 1.0)
}
```

### Change Wait Time Between Stages
In `App.js`, find `handleTaskSubmit()`:

```javascript
const next = new Date(Date.now() + 60000); // Change 60000 (60 seconds)
```

## 🚀 Uploading to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Momentum Alarm app"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/momentum-alarm.git
git branch -M main
git push -u origin main
```

## 📝 Project Structure

```
momentum-alarm-native/
├── App.js              # Main application code
├── app.json           # Expo configuration
├── package.json       # Dependencies
├── babel.config.js    # Babel configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🐛 Troubleshooting

**Alarm not ringing?**
- Make sure notifications are enabled in phone settings
- Check that app has permission to run in background
- Ensure volume is not muted

**Can't install on phone?**
- Make sure Expo Go is installed
- Check that phone and computer are on same WiFi
- Try restarting the Expo server

**Build failing?**
- Run `npm install` again
- Clear cache: `expo start -c`
- Check Expo version compatibility

## 🎨 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **AsyncStorage** - Local storage
- **Expo Notifications** - Push notifications
- **Expo Audio** - Sound playback
- **Expo Haptics** - Vibration feedback

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Built with determination to wake up early! 💪

---

**Need help?** Open an issue on GitHub or check Expo documentation.
