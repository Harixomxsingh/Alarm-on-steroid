import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  AlarmClock, 
  CheckCircle2, 
  Brain, 
  Trophy, 
  RefreshCcw, 
  Settings2, 
  Volume2, 
  ChevronRight,
  BookOpen,
  Lightbulb,
  Bell,
  ChevronUp,
  ChevronDown,
  Save
} from 'lucide-react';

// --- Constants & Mock Data ---
const ALARM_STAGES = {
  IDLE: 'IDLE',
  RINGING: 'RINGING',
  VERIFICATION: 'VERIFICATION',
  SUCCESS: 'SUCCESS'
};

const INSIGHTS = [
  "The 1% Rule: Small improvements accumulate into massive results through the power of compounding.",
  "Deep Work: Focus on cognitively demanding tasks for extended periods without distraction.",
  "First Principles: Break down complex problems into basic elements and reassemble them from scratch.",
  "Eat the Frog: Tackle your most difficult and important task first thing in the morning.",
  "Pareto Principle: 80% of your results come from 20% of your activities. Identify and focus on them."
];

const WORDS = [
  { word: "Luminous", def: "Full of or shedding light; bright or shining.", ex: "The luminous moon illuminated the dark path." },
  { word: "Resilient", def: "Able to withstand or recover quickly from difficult conditions.", ex: "She showed a resilient spirit after the setback." },
  { word: "Cognizant", def: "Having knowledge or being aware of.", ex: "We must be cognizant of the potential risks involved." },
  { word: "Efficacy", def: "The ability to produce a desired or intended result.", ex: "The efficacy of the new treatment was highly praised." },
  { word: "Pragmatic", def: "Dealing with things sensibly and realistically.", ex: "His pragmatic approach to problem-solving saved time." }
];

const APP_ID = 'momentum-persistence-alarm';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [appState, setAppState] = useState(ALARM_STAGES.IDLE);
  const [alarmTime, setAlarmTime] = useState(() => localStorage.getItem(`${APP_ID}-alarm`) || "08:00");
  const [streak, setStreak] = useState(() => Number(localStorage.getItem(`${APP_ID}-streak`)) || 0);
  const [verificationStage, setVerificationStage] = useState(0);
  const [nextAlarmTime, setNextAlarmTime] = useState(null);
  const [task, setTask] = useState({ question: '', answer: 0 });
  const [userInput, setUserInput] = useState('');
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [dailyContent, setDailyContent] = useState({ insight: '', word: {} });

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempHours, setTempHours] = useState(8);
  const [tempMins, setTempMins] = useState(0);

  const audioContext = useRef(null);

  useEffect(() => {
    const randomInsight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setDailyContent({ insight: randomInsight, word: randomWord });
    const [h, m] = alarmTime.split(':').map(Number);
    setTempHours(h);
    setTempMins(m);
    const ticker = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(ticker);
  }, []);

  const playSound = (type) => {
    try {
      if (!audioContext.current) audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioContext.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.5);
        });
      }
    } catch (e) {}
  };

  const generateTask = useCallback(() => {
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * 50) + 10;
    setTask({ question: `${a} + ${b}`, answer: a + b });
    setUserInput('');
  }, []);

  useEffect(() => {
    const nowStr = currentTime.getHours().toString().padStart(2, '0') + ":" + 
                   currentTime.getMinutes().toString().padStart(2, '0');
    if (appState === ALARM_STAGES.IDLE && nowStr === alarmTime && currentTime.getSeconds() < 1) {
      setAppState(ALARM_STAGES.RINGING);
      generateTask();
    }

    if (appState === ALARM_STAGES.VERIFICATION && nextAlarmTime) {
      if (currentTime >= nextAlarmTime) {
        setAppState(ALARM_STAGES.RINGING);
        generateTask();
        setTimerRemaining(60);
      }
    }
  }, [currentTime, alarmTime, appState, nextAlarmTime, generateTask]);

  useEffect(() => {
    let interval;
    if (appState === ALARM_STAGES.RINGING) {
      interval = setInterval(() => playSound('alarm'), 1000);
    }
    return () => clearInterval(interval);
  }, [appState]);

  useEffect(() => {
    if (appState === ALARM_STAGES.RINGING && verificationStage > 0) {
      const timer = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            setAppState(ALARM_STAGES.VERIFICATION);
            scheduleNextAlarm(1);
            setVerificationStage(1);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [appState, verificationStage]);

  const scheduleNextAlarm = (stage) => {
    const offsetMinutes = stage === 1 ? 4 : 5;
    const nextDate = new Date();
    nextDate.setMinutes(nextDate.getMinutes() + offsetMinutes);
    nextDate.setSeconds(nextDate.getSeconds() + Math.floor(Math.random() * 30));
    setNextAlarmTime(nextDate);
  };

  const handleSolveTask = () => {
    if (parseInt(userInput) === task.answer) {
      if (verificationStage === 0) {
        setAppState(ALARM_STAGES.VERIFICATION);
        setVerificationStage(1);
        scheduleNextAlarm(1);
      } else if (verificationStage === 1) {
        setAppState(ALARM_STAGES.VERIFICATION);
        setVerificationStage(2);
        scheduleNextAlarm(2);
      } else {
        setAppState(ALARM_STAGES.SUCCESS);
        playSound('victory');
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem(`${APP_ID}-streak`, newStreak);
      }
    } else {
      setUserInput('');
    }
  };

  const saveCustomTime = () => {
    const newTime = `${tempHours.toString().padStart(2, '0')}:${tempMins.toString().padStart(2, '0')}`;
    setAlarmTime(newTime);
    localStorage.setItem(`${APP_ID}-alarm`, newTime);
    setIsEditingTime(false);
  };

  const resetAll = () => {
    localStorage.clear();
    setStreak(0);
    setAppState(ALARM_STAGES.IDLE);
    setAlarmTime("08:00");
    setVerificationStage(0);
    setTempHours(8);
    setTempMins(0);
  };

  const HomeView = () => (
    <div className="flex flex-col items-center justify-center space-y-10 py-12 px-6">
      <div className="text-center">
        <h2 className="text-zinc-600 uppercase tracking-widest text-[10px] font-black mb-2">System Time (24H)</h2>
        <div className="text-7xl font-light tracking-tighter text-white tabular-nums flex items-baseline justify-center">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          <span className="text-xl text-zinc-700 font-medium ml-2">:{currentTime.getSeconds().toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/10 p-2.5 rounded-2xl">
              <AlarmClock className="text-blue-500 w-5 h-5" />
            </div>
            <h3 className="text-white font-bold tracking-tight">Momentum Alarm</h3>
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
            24H Mode
          </div>
        </div>

        {isEditingTime ? (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <button onClick={() => setTempHours(h => (h + 1) % 24)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <ChevronUp size={24} />
                </button>
                <div className="flex flex-col items-center">
                   <div className="text-5xl font-black text-white bg-zinc-800 w-20 h-20 flex items-center justify-center rounded-2xl">
                    {tempHours.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold mt-2 uppercase">Hours</span>
                </div>
                <button onClick={() => setTempHours(h => (h - 1 + 24) % 24)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <ChevronDown size={24} />
                </button>
              </div>
              <div className="text-4xl font-black text-zinc-700 pb-6">:</div>
              <div className="flex flex-col items-center space-y-2">
                <button onClick={() => setTempMins(m => (m + 1) % 60)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <ChevronUp size={24} />
                </button>
                <div className="flex flex-col items-center">
                  <div className="text-5xl font-black text-white bg-zinc-800 w-20 h-20 flex items-center justify-center rounded-2xl">
                    {tempMins.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold mt-2 uppercase">Mins</span>
                </div>
                <button onClick={() => setTempMins(m => (m - 1 + 60) % 60)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <ChevronDown size={24} />
                </button>
              </div>
            </div>
            
            <div className="text-center pb-2">
               <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                Setting for: <span className="text-white">{tempHours.toString().padStart(2, '0')}:{tempMins.toString().padStart(2, '0')}</span>
               </p>
            </div>

            <button 
              onClick={saveCustomTime}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/20"
            >
              <Save size={18} />
              <span className="uppercase tracking-widest text-xs">Set 24H Alarm</span>
            </button>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingTime(true)}
            className="group cursor-pointer bg-zinc-800/30 hover:bg-zinc-800/50 p-8 rounded-3xl border-2 border-transparent hover:border-blue-500/30 transition-all text-center relative"
          >
            <div className="text-6xl font-black text-white tracking-tighter tabular-nums mb-2 group-hover:scale-105 transition-transform">
              {alarmTime}
            </div>
            <div className="flex items-center justify-center space-x-2 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
              <Settings2 size={12} />
              <span>Tap to Adjust Time</span>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800/50 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="text-amber-500 w-4 h-4" />
            <span className="text-white font-black text-lg">{streak}</span>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-tighter">Streak</span>
          </div>
          <div className="flex items-center space-x-1 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            <Bell size={12} className="text-blue-500" />
            <span>Ready</span>
          </div>
        </div>
      </div>

      <p className="text-zinc-700 text-[10px] max-w-[220px] text-center uppercase leading-loose font-bold tracking-[0.15em]">
        24-hour verification loop prevents AM/PM setting errors.
      </p>
    </div>
  );

  const AlarmView = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-blue-600/10 animate-pulse"></div>
      <div className="relative z-10 mb-12">
        <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-blue-500 animate-ping">
          <Volume2 className="text-blue-500 w-10 h-10" />
        </div>
        <h2 className="text-5xl font-black text-white mb-2 uppercase tracking-tighter italic">Wake Up</h2>
        <p className="text-zinc-500 font-black tracking-[0.3em] text-xs uppercase">Verification {verificationStage + 1} / 3</p>
        {verificationStage > 0 && (
          <div className="mt-4 text-rose-500 font-black text-xl tabular-nums">
            00:{timerRemaining.toString().padStart(2, '0')}
          </div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-sm bg-zinc-900 rounded-[2.5rem] p-10 border border-zinc-800 shadow-2xl">
        <div className="text-6xl font-black text-white mb-10 tracking-tighter">
          {task.question}
        </div>
        <input 
          type="number"
          autoFocus
          inputMode="numeric"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSolveTask()}
          placeholder="?"
          className="w-full bg-zinc-800 text-white text-5xl p-6 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:ring-0 text-center mb-8 placeholder-zinc-700"
        />
        <button 
          onClick={handleSolveTask}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-2xl transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs"
        >
          <span>Confirm Consciousness</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  const VerificationWaitingView = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-12">
      <div className="relative">
        <div className="w-48 h-48 border-[12px] border-blue-500/5 rounded-full flex items-center justify-center">
          <div className="w-36 h-36 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <CheckCircle2 className="text-blue-500 w-16 h-16" />
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Hold Fast</h2>
        <p className="text-zinc-500 max-w-xs mx-auto text-sm font-medium leading-relaxed uppercase tracking-wider">
          Stage {verificationStage} complete. The system is monitoring for relapse. Stay awake.
        </p>
      </div>
      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-[10px] text-zinc-600 font-black uppercase tracking-widest">
          <span>Loop Integrity</span>
          <span>{Math.round((verificationStage / 3) * 100)}%</span>
        </div>
        <div className="flex space-x-3">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-3 flex-1 rounded-full transition-all duration-1000 ${s <= verificationStage ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-zinc-800'}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Full Momentum</h1>
          <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Cognitive State: Optimized</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 px-5 py-3 rounded-2xl flex items-center space-x-2 border border-amber-500/20">
          <Trophy className="w-5 h-5" />
          <span className="font-black text-xl">{streak}</span>
        </div>
      </header>

      <div className="grid gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 p-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
            <Lightbulb size={140} />
          </div>
          <div className="flex items-center space-x-2 text-blue-500 mb-6 font-black uppercase text-[10px] tracking-widest">
            <Brain size={14} />
            <span>1% Insight</span>
          </div>
          <p className="text-white text-2xl font-bold leading-tight relative z-10 italic">
            "{dailyContent.insight}"
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem]">
          <div className="flex items-center space-x-2 text-amber-500 mb-6 font-black uppercase text-[10px] tracking-widest">
            <BookOpen size={14} />
            <span>Vocabulary Builder</span>
          </div>
          <h3 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">{dailyContent.word.word}</h3>
          <p className="text-zinc-500 italic mb-6 text-lg">{dailyContent.word.def}</p>
          <div className="bg-zinc-950 p-6 rounded-2xl text-zinc-400 text-sm border-l-4 border-amber-500 italic font-medium">
            "{dailyContent.word.ex}"
          </div>
        </div>

        <button 
          onClick={() => {
            setAppState(ALARM_STAGES.IDLE);
            setVerificationStage(0);
          }}
          className="w-full bg-white text-black font-black py-7 rounded-3xl transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.3em] text-xs hover:scale-[0.98] active:scale-95 shadow-xl"
        >
          <RefreshCcw size={18} />
          <span>Reset System</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed top-8 right-8 z-40">
        <button 
          onClick={() => confirm("Reset all persistence data?") && resetAll()}
          className="p-3.5 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-700 hover:text-zinc-400 transition-all hover:rotate-90"
        >
          <Settings2 size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <main className="flex-grow flex flex-col justify-center">
          {appState === ALARM_STAGES.IDLE && <HomeView />}
          {appState === ALARM_STAGES.RINGING && <AlarmView />}
          {appState === ALARM_STAGES.VERIFICATION && <VerificationWaitingView />}
          {appState === ALARM_STAGES.SUCCESS && <SuccessView />}
        </main>
      </div>
    </div>
  );
}
