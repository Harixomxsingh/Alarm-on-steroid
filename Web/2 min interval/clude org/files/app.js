// Main Application Logic

function updateDynamicElements() {
    // Update the main clock display
    const clockElement = document.getElementById('main-clock-display');
    if (clockElement) {
        const hours = padNumber(state.currentTime.getHours());
        const minutes = padNumber(state.currentTime.getMinutes());
        const seconds = padNumber(state.currentTime.getSeconds());
        clockElement.innerHTML = `${hours}:${minutes}<span class="text-2xl text-zinc-800 font-bold ml-2">:${seconds}</span>`;
    }

    // Update countdown timer
    const countdownElement = document.getElementById('countdown-timer');
    if (countdownElement && state.nextAlarmTime) {
        const timeDifference = state.nextAlarmTime - state.currentTime;
        const totalSeconds = Math.max(0, Math.floor(timeDifference / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        countdownElement.innerText = `${minutes}:${padNumber(seconds)}`;
    }
}

function updateTime() {
    state.currentTime = new Date();
    const currentHours = padNumber(state.currentTime.getHours());
    const currentMinutes = padNumber(state.currentTime.getMinutes());
    const currentTimeString = `${currentHours}:${currentMinutes}`;

    // Check if alarm should trigger
    if (state.view === 'IDLE' && 
        currentTimeString === state.alarmTime && 
        state.lastFiredMinute !== currentTimeString) {
        state.lastFiredMinute = currentTimeString;
        triggerAlarm();
    }

    // Check for verification interval alarm
    if (state.view === 'VERIFICATION' && 
        state.nextAlarmTime && 
        state.currentTime >= state.nextAlarmTime) {
        triggerAlarm();
    }

    // Update dynamic elements without full re-render
    updateDynamicElements();
    
    // Only re-render if view state changed
    if (state.view !== state.lastView) {
        render();
    }

    // Play alarm sound if ringing
    if (state.view === 'RINGING') {
        playAlarmSound();
    }
}

// Initialize the application
function init() {
    render();
    setInterval(updateTime, 1000);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
