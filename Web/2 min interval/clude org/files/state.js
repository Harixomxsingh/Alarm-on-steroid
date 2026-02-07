// State Management
const state = {
    view: 'IDLE',
    lastView: null,
    currentTime: new Date(),
    alarmTime: localStorage.getItem(CONFIG.STORAGE_KEYS.ALARM_TIME) || "08:00",
    lastFiredMinute: '',
    streak: parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.STREAK)) || 0,
    verificationStage: 0,
    nextAlarmTime: null,
    mathTask: { question: '', answer: 0 },
    isEditing: false,
    tempHours: 8,
    tempMinutes: 0,
    dailyInsight: getRandomItem(INSIGHTS),
    dailyWord: getRandomItem(WORDS)
};

// State Helper Functions
function generateMathTask() {
    const num1 = Math.floor(Math.random() * 50) + 10;
    const num2 = Math.floor(Math.random() * 50) + 10;
    state.mathTask = {
        question: `${num1} + ${num2}`,
        answer: num1 + num2
    };
}

function triggerAlarm() {
    state.view = 'RINGING';
    generateMathTask();
}

function handleTaskSubmit() {
    const input = document.getElementById('mathInput');
    if (!input) return;
    
    const userAnswer = parseInt(input.value);
    
    if (userAnswer === state.mathTask.answer) {
        state.verificationStage++;
        
        if (state.verificationStage >= CONFIG.VERIFICATION_STAGES) {
            state.view = 'SUCCESS';
            state.streak++;
            localStorage.setItem(CONFIG.STORAGE_KEYS.STREAK, state.streak);
            playVictorySound();
        } else {
            state.view = 'VERIFICATION';
            const nextTime = new Date();
            nextTime.setSeconds(nextTime.getSeconds() + CONFIG.VERIFICATION_INTERVAL_SECONDS);
            state.nextAlarmTime = nextTime;
        }
        render();
    } else {
        input.classList.add('border-red-500');
        input.value = '';
        setTimeout(() => input.classList.remove('border-red-500'), 500);
    }
}

function resetApp() {
    state.view = 'IDLE';
    state.verificationStage = 0;
    state.nextAlarmTime = null;
    state.lastFiredMinute = '';
    render();
}

function toggleEdit() {
    initAudio();
    state.isEditing = true;
    const [hours, minutes] = state.alarmTime.split(':');
    state.tempHours = parseInt(hours);
    state.tempMinutes = parseInt(minutes);
    render();
}

function changeTimeValue(type, delta) {
    if (type === 'hours') {
        state.tempHours = (state.tempHours + delta + 24) % 24;
    } else {
        state.tempMinutes = (state.tempMinutes + delta + 60) % 60;
    }
    render();
}

function manualTimeEntry(type, value) {
    let number = parseInt(value);
    if (isNaN(number)) return;
    
    if (type === 'hours') {
        number = Math.max(0, Math.min(23, number));
        state.tempHours = number;
    } else {
        number = Math.max(0, Math.min(59, number));
        state.tempMinutes = number;
    }
}

function saveAlarmTime() {
    state.alarmTime = `${padNumber(state.tempHours)}:${padNumber(state.tempMinutes)}`;
    localStorage.setItem(CONFIG.STORAGE_KEYS.ALARM_TIME, state.alarmTime);
    state.isEditing = false;
    state.lastFiredMinute = '';
    render();
}

// Expose functions to global scope
window.handleTaskSubmit = handleTaskSubmit;
window.resetApp = resetApp;
window.toggleEdit = toggleEdit;
window.changeTimeValue = changeTimeValue;
window.manualTimeEntry = manualTimeEntry;
window.saveAlarmTime = saveAlarmTime;
