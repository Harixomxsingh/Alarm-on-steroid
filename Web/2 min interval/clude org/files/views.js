// View Rendering Functions
const app = document.getElementById('app');

function renderHome() {
    app.innerHTML = `
        <div class="space-y-12 py-10 animate-in fade-in duration-500">
            <div class="text-center">
                <p class="text-zinc-600 uppercase tracking-[0.3em] text-[10px] font-black mb-4">Internal Chronos</p>
                <h1 id="main-clock-display" class="text-8xl font-thin tracking-tighter tabular-nums text-white">--:--:--</h1>
            </div>

            <div class="glass-card rounded-[3rem] p-8 shadow-2xl transition-all hover:border-zinc-700 ${state.isEditing ? '' : 'armed-pulse'}">
                <div class="flex justify-between items-center mb-10">
                    <div class="flex items-center space-x-3">
                        <div class="bg-blue-600/20 p-3 rounded-2xl">
                            <i class="fa-solid fa-clock text-blue-500"></i>
                        </div>
                        <span class="font-bold text-lg">Momentum</span>
                    </div>
                    <span class="text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20">
                        ${state.isEditing ? 'Editing' : 'Armed'}
                    </span>
                </div>

                ${state.isEditing ? renderTimeEditor() : renderAlarmDisplay()}

                <div class="mt-10 pt-8 border-t border-zinc-800/50 flex justify-between items-center">
                    <div class="flex items-center space-x-3">
                        <i class="fa-solid fa-trophy text-amber-500 text-xl"></i>
                        <span class="text-3xl font-black tracking-tighter text-white">${state.streak}</span>
                    </div>
                    <div class="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Daily Lock: ${state.alarmTime}
                    </div>
                </div>
            </div>
        </div>
    `;
    updateDynamicElements();
}

function renderTimeEditor() {
    return `
        <div class="space-y-8">
            <div class="flex items-center justify-center space-x-6">
                <!-- Hours Input -->
                <div class="flex flex-col items-center">
                    <button onclick="changeTimeValue('hours', 1)" class="p-2 text-zinc-700 hover:text-white">
                        <i class="fa-solid fa-chevron-up text-xl"></i>
                    </button>
                    <div class="bg-zinc-800 w-24 h-24 flex items-center justify-center rounded-3xl border border-zinc-700 overflow-hidden">
                        <input 
                            type="number" 
                            value="${padNumber(state.tempHours)}" 
                            oninput="manualTimeEntry('hours', this.value)"
                            class="time-input-field text-6xl" 
                            min="0" 
                            max="23"
                        >
                    </div>
                    <button onclick="changeTimeValue('hours', -1)" class="p-2 text-zinc-700 hover:text-white">
                        <i class="fa-solid fa-chevron-down text-xl"></i>
                    </button>
                </div>
                
                <div class="text-4xl font-black text-zinc-800 pb-10">:</div>
                
                <!-- Minutes Input -->
                <div class="flex flex-col items-center">
                    <button onclick="changeTimeValue('minutes', 1)" class="p-2 text-zinc-700 hover:text-white">
                        <i class="fa-solid fa-chevron-up text-xl"></i>
                    </button>
                    <div class="bg-zinc-800 w-24 h-24 flex items-center justify-center rounded-3xl border border-zinc-700 overflow-hidden">
                        <input 
                            type="number" 
                            value="${padNumber(state.tempMinutes)}" 
                            oninput="manualTimeEntry('minutes', this.value)"
                            class="time-input-field text-6xl" 
                            min="0" 
                            max="59"
                        >
                    </div>
                    <button onclick="changeTimeValue('minutes', -1)" class="p-2 text-zinc-700 hover:text-white">
                        <i class="fa-solid fa-chevron-down text-xl"></i>
                    </button>
                </div>
            </div>
            
            <div class="text-center text-zinc-600 text-[10px] uppercase font-black tracking-widest">
                Type or use arrows
            </div>
            
            <button 
                onclick="saveAlarmTime()" 
                class="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase tracking-widest text-xs btn-active shadow-lg shadow-blue-900/40"
            >
                Confirm Alarm
            </button>
        </div>
    `;
}

function renderAlarmDisplay() {
    return `
        <div onclick="toggleEdit()" class="cursor-pointer bg-black/40 p-10 rounded-[2.5rem] border-2 border-dashed border-zinc-800 hover:border-blue-500/30 text-center group transition-all">
            <div class="text-7xl font-black tracking-tighter group-hover:scale-105 transition-transform text-white">
                ${state.alarmTime}
            </div>
            <div class="mt-4 text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                <i class="fa-solid fa-keyboard"></i> Set Time
            </div>
        </div>
    `;
}

function renderAlarm() {
    app.innerHTML = `
        <div class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div class="absolute inset-0 bg-blue-600/5 animate-pulse"></div>
            
            <div class="relative z-10 mb-16">
                <div class="w-32 h-32 bg-blue-600/10 rounded-full flex items-center justify-center mb-10 mx-auto border-4 border-blue-500/20 animate-bounce">
                    <i class="fa-solid fa-volume-high text-blue-500 text-5xl"></i>
                </div>
                <h2 class="text-7xl font-black italic uppercase tracking-tighter mb-4 text-white">
                    Phase ${state.verificationStage + 1}
                </h2>
                <p class="text-zinc-500 font-black tracking-[0.5em] text-xs uppercase">
                    Verification Active
                </p>
            </div>

            <div class="relative z-10 w-full max-w-sm glass-card rounded-[3.5rem] p-12 shadow-2xl">
                <div class="text-8xl font-black mb-14 tracking-tighter text-white">
                    ${state.mathTask.question}
                </div>
                <input 
                    type="number" 
                    id="mathInput" 
                    autofocus 
                    class="w-full bg-zinc-800 text-white text-6xl p-8 rounded-[2rem] border-2 border-transparent focus:border-blue-500 outline-none text-center mb-10 shadow-inner" 
                    placeholder="?"
                >
                <button 
                    onclick="handleTaskSubmit()" 
                    class="w-full bg-white text-black font-black py-8 rounded-[2rem] uppercase tracking-widest text-sm btn-active"
                >
                    Verify
                </button>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const input = document.getElementById('mathInput');
        if (input) {
            input.focus();
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleTaskSubmit();
            });
        }
    }, 200);
}

function renderWait() {
    app.innerHTML = `
        <div class="flex flex-col items-center justify-center space-y-16 py-10 text-center animate-in slide-in-from-bottom-10 duration-500">
            <div class="relative">
                <div class="w-72 h-72 border-[20px] border-zinc-900 rounded-full flex items-center justify-center">
                    <div class="w-56 h-56 border-[8px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span id="countdown-timer" class="text-4xl font-black text-white countdown-glow tabular-nums mb-1">
                        0:00
                    </span>
                    <span class="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">
                        Next Window
                    </span>
                </div>
            </div>
            
            <div class="space-y-6">
                <h2 class="text-6xl font-black italic uppercase tracking-tighter text-white">
                    Stay Focused
                </h2>
                <p class="text-zinc-500 text-sm font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-loose">
                    Phase ${state.verificationStage} clear. Stand by for next prompt.
                </p>
            </div>
        </div>
    `;
    updateDynamicElements();
}

function renderSuccess() {
    app.innerHTML = `
        <div class="space-y-12 py-10 max-w-md mx-auto animate-in fade-in duration-1000">
            <header class="flex justify-between items-center">
                <div class="space-y-2">
                    <h1 class="text-6xl font-black italic uppercase tracking-tighter leading-none text-white">
                        Victory
                    </h1>
                    <p class="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">
                        Establish Momentum
                    </p>
                </div>
                <div class="bg-amber-500/10 text-amber-500 p-6 rounded-[2rem] border border-amber-500/20 text-center">
                    <i class="fa-solid fa-trophy block mb-2 text-2xl"></i>
                    <span class="text-4xl font-black tracking-tighter">${state.streak}</span>
                </div>
            </header>

            <div class="space-y-8">
                <div class="glass-card p-10 rounded-[3.5rem] relative overflow-hidden">
                    <div class="flex items-center gap-3 text-blue-500 mb-8 font-black uppercase text-[10px] tracking-widest">
                        <i class="fa-solid fa-brain"></i> 1% Insight
                    </div>
                    <p class="text-2xl font-bold italic leading-relaxed relative z-10 text-white">
                        "${state.dailyInsight}"
                    </p>
                </div>

                <div class="glass-card p-10 rounded-[3.5rem]">
                    <div class="flex items-center gap-3 text-amber-500 mb-8 font-black uppercase text-[10px] tracking-widest">
                        <i class="fa-solid fa-book-open"></i> Articulation
                    </div>
                    <h3 class="text-5xl font-black uppercase tracking-tighter mb-4 text-white">
                        ${state.dailyWord.word}
                    </h3>
                    <p class="text-zinc-500 italic text-xl mb-8">
                        ${state.dailyWord.def}
                    </p>
                    <div class="bg-black/50 p-8 rounded-3xl border-l-[10px] border-amber-500 italic text-zinc-400">
                        "${state.dailyWord.ex}"
                    </div>
                </div>

                <button 
                    onclick="resetApp()" 
                    class="w-full bg-white text-black font-black py-10 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs btn-active shadow-2xl"
                >
                    Reset System
                </button>
            </div>
        </div>
    `;
}

function render() {
    state.lastView = state.view;
    
    switch (state.view) {
        case 'IDLE':
            renderHome();
            break;
        case 'RINGING':
            renderAlarm();
            break;
        case 'VERIFICATION':
            renderWait();
            break;
        case 'SUCCESS':
            renderSuccess();
            break;
    }
}
