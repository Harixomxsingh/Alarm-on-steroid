// Configuration and Constants
const CONFIG = {
    VERIFICATION_STAGES: 3,
    VERIFICATION_INTERVAL_SECONDS: 120, // 2 minutes
    STORAGE_KEYS: {
        ALARM_TIME: 'momentum-alarm',
        STREAK: 'momentum-streak'
    }
};

const INSIGHTS = [
    "The 1% Rule: Small improvements accumulate into massive results through compounding.",
    "Deep Work: Focus on cognitively demanding tasks without distraction.",
    "First Principles: Break down complex problems into basic elements.",
    "Eat the Frog: Tackle your most difficult task first thing in the morning.",
    "Pareto Principle: 80% of results come from 20% of activities.",
    "Compound Effect: Small, smart choices + Consistency + Time = Radical difference.",
    "Two-Minute Rule: If it takes less than two minutes, do it now.",
    "Kaizen: Continuous improvement through small, incremental changes.",
    "Focus Formula: Clarity of purpose + Elimination of distractions = Peak performance.",
    "Habit Stacking: Attach new habits to existing ones for better consistency."
];

const WORDS = [
    { 
        word: "Luminous", 
        def: "Full of or shedding light; bright or shining.", 
        ex: "The luminous moon illuminated the path." 
    },
    { 
        word: "Resilient", 
        def: "Able to recover quickly from difficult conditions.", 
        ex: "She showed a resilient spirit after the setback." 
    },
    { 
        word: "Cognizant", 
        def: "Having knowledge or being aware of.", 
        ex: "Be cognizant of the potential risks involved." 
    },
    { 
        word: "Efficacy", 
        def: "The ability to produce a desired or intended result.", 
        ex: "The efficacy of the treatment was widely praised." 
    },
    { 
        word: "Tenacious", 
        def: "Persistent in maintaining or adhering to something valued.", 
        ex: "Her tenacious pursuit of excellence inspired others." 
    },
    { 
        word: "Prudent", 
        def: "Acting with care and thought for the future.", 
        ex: "It would be prudent to save for unexpected expenses." 
    },
    { 
        word: "Auspicious", 
        def: "Conducive to success; favorable.", 
        ex: "They chose an auspicious day to begin their venture." 
    },
    { 
        word: "Meticulous", 
        def: "Showing great attention to detail; very careful.", 
        ex: "His meticulous planning ensured the project's success." 
    }
];

// Utility Functions
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function padNumber(num, length = 2) {
    return num.toString().padStart(length, '0');
}
