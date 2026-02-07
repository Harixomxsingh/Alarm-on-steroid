# Momentum Alarm

A sophisticated alarm clock application designed to build momentum through progressive verification challenges.

## Features

- **Smart Alarm System**: Set a daily alarm that requires mental engagement to dismiss
- **Progressive Verification**: Complete 3 math challenges at intervals to prove you're fully awake
- **Streak Tracking**: Build momentum by consistently waking up and completing challenges
- **Daily Insights**: Receive productivity insights and vocabulary building content
- **Elegant Dark UI**: Modern glass-morphic design with smooth animations

## File Structure

```
momentum-alarm/
├── index.html          # Main HTML structure
├── styles.css          # All CSS styles and animations
├── config.js           # Configuration constants and data
├── audio.js            # Audio playback functionality
├── state.js            # State management and logic
├── views.js            # UI rendering functions
└── app.js              # Main application controller
```

## How to Use

### Local Development

1. Simply open `index.html` in a modern web browser
2. No build process or server required
3. All dependencies are loaded from CDN

### Deploying to Web Application

1. Upload all files to your web server
2. Ensure all files are in the same directory
3. Access through `index.html`

### Setting the Alarm

1. Click on the displayed time on the home screen
2. Use arrows or type directly to set hours and minutes
3. Click "Confirm Alarm" to save

### Verification Process

1. When alarm triggers, solve the math problem
2. Complete 3 verification stages
3. Each stage is separated by a 2-minute interval
4. After completing all stages, view your daily insight and vocabulary word

## Customization

### Changing Verification Interval

Edit in `config.js`:
```javascript
VERIFICATION_INTERVAL_SECONDS: 120, // Change to desired seconds
```

### Adding More Insights

Edit the `INSIGHTS` array in `config.js`:
```javascript
const INSIGHTS = [
    "Your new insight here...",
    // Add more...
];
```

### Adding More Vocabulary Words

Edit the `WORDS` array in `config.js`:
```javascript
const WORDS = [
    { 
        word: "Example", 
        def: "Definition here", 
        ex: "Usage example here" 
    },
    // Add more...
];
```

## Browser Compatibility

- Chrome/Edge (Recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

## Storage

The app uses localStorage to persist:
- Alarm time setting
- Current streak count

## Technologies Used

- Vanilla JavaScript (ES6+)
- TailwindCSS (via CDN)
- Font Awesome Icons
- Web Audio API for sounds

## License

Free to use and modify for personal and commercial projects.
