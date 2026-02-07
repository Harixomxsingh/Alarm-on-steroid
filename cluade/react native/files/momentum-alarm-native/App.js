import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  AppState,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const { width, height } = Dimensions.get('window');

// Configure notifications to show even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const INSIGHTS = [
  "The 1% Rule: Small improvements accumulate into massive results through compounding.",
  "Deep Work: Focus on cognitively demanding tasks without distraction.",
  "First Principles: Break down complex problems into basic elements.",
  "Eat the Frog: Tackle your most difficult task first thing in the morning.",
  "Pareto Principle: 80% of results come from 20% of activities."
];

const WORDS = [
  { word: "Luminous", def: "Full of or shedding light; bright or shining.", ex: "The luminous moon illuminated the path." },
  { word: "Resilient", def: "Able to recover quickly from difficult conditions.", ex: "She showed a resilient spirit." },
  { word: "Cognizant", def: "Having knowledge or being aware of.", ex: "Be cognizant of the potential risks." },
  { word: "Efficacy", def: "The ability to produce a desired or intended result.", ex: "The efficacy of the treatment was praised." }
];

export default function App() {
  const [view, setView] = useState('IDLE');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState('08:00');
  const [streak, setStreak] = useState(0);
  const [verificationStage, setVerificationStage] = useState(0);
  const [nextAlarmTime, setNextAlarmTime] = useState(null);
  const [timerRemaining, setTimerRemaining] = useState(60);
  const [mathTask, setMathTask] = useState({ q: '', a: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [tempH, setTempH] = useState(8);
  const [tempM, setTempM] = useState(0);
  const [dailyInsight] = useState(INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)]);
  const [dailyWord] = useState(WORDS[Math.floor(Math.random() * WORDS.length)]);

  const soundRef = useRef(null);
  const intervalRef = useRef(null);
  const lastFiredMinute = useRef('');
  const appState = useRef(AppState.currentState);

  // Request notification permissions
  useEffect(() => {
    registerForPushNotificationsAsync();
    loadSettings();
  }, []);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      checkAlarm(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [alarmTime, view]);

  // Countdown timer for wait state
  useEffect(() => {
    if (view === 'WAIT' && nextAlarmTime) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((nextAlarmTime - now) / 1000);
        setTimerRemaining(Math.max(0, diff));
        
        if (now >= nextAlarmTime) {
          triggerAlarm();
        }
      }, 1000);

      return () => clearInterval(intervalRef.current);
    }
  }, [view, nextAlarmTime]);

  // Keep screen awake during alarm
  useEffect(() => {
    if (view === 'ALARM') {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
  }, [view]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground
        if (view === 'ALARM') {
          playAlarmSound();
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription?.remove();
    };
  }, [view]);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications to use alarm features!');
      return;
    }
  };

  const loadSettings = async () => {
    try {
      const savedAlarm = await AsyncStorage.getItem('momentum-alarm');
      const savedStreak = await AsyncStorage.getItem('momentum-streak');
      
      if (savedAlarm) {
        setAlarmTime(savedAlarm);
        const [h, m] = savedAlarm.split(':');
        setTempH(parseInt(h));
        setTempM(parseInt(m));
      }
      if (savedStreak) setStreak(parseInt(savedStreak));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveAlarmTime = async (time) => {
    try {
      await AsyncStorage.setItem('momentum-alarm', time);
    } catch (error) {
      console.error('Error saving alarm time:', error);
    }
  };

  const saveStreak = async (newStreak) => {
    try {
      await AsyncStorage.setItem('momentum-streak', newStreak.toString());
    } catch (error) {
      console.error('Error saving streak:', error);
    }
  };

  const checkAlarm = (now) => {
    const nowH = now.getHours().toString().padStart(2, '0');
    const nowM = now.getMinutes().toString().padStart(2, '0');
    const nowStr = `${nowH}:${nowM}`;

    if (view === 'IDLE' && nowStr === alarmTime && lastFiredMinute.current !== nowStr) {
      lastFiredMinute.current = nowStr;
      triggerAlarm();
    }
  };

  const generateMathTask = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 50) + 10;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * 50) + 30;
        b = Math.floor(Math.random() * 30) + 10;
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * 12) + 2;
        b = Math.floor(Math.random() * 12) + 2;
        answer = a * b;
        break;
    }

    setMathTask({ q: `${a} ${op} ${b}`, a: answer });
  };

  const playAlarmSound = async () => {
    try {
      // Stop any existing sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode for alarm
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create alarm sound (using system sound for now)
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' }, // You'll replace this
        { 
          shouldPlay: true, 
          isLooping: true,
          volume: 0.7 // Medium volume as requested
        }
      );
      
      soundRef.current = sound;
      
      // Vibrate continuously
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Schedule notification as backup
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Wake Up Challenge!',
          body: `Phase ${verificationStage + 1} - Solve the math problem to continue`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Show immediately
      });
      
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };

  const stopAlarmSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping alarm sound:', error);
    }
  };

  const triggerAlarm = async () => {
    setView('ALARM');
    generateMathTask();
    setUserAnswer('');
    await playAlarmSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleTaskSubmit = async () => {
    const answer = parseInt(userAnswer);
    
    if (answer === mathTask.a) {
      // Correct answer
      await stopAlarmSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (verificationStage < 2) {
        // Move to wait state
        setVerificationStage(verificationStage + 1);
        const next = new Date(Date.now() + 60000); // 60 seconds
        setNextAlarmTime(next);
        setTimerRemaining(60);
        setView('WAIT');
      } else {
        // All stages complete!
        const newStreak = streak + 1;
        setStreak(newStreak);
        await saveStreak(newStreak);
        setView('SUCCESS');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      // Wrong answer - vibrate and keep alarm going
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setUserAnswer('');
      Alert.alert('❌ Incorrect', 'Try again!', [{ text: 'OK' }]);
    }
  };

  const resetApp = () => {
    setView('IDLE');
    setVerificationStage(0);
    setNextAlarmTime(null);
    lastFiredMinute.current = '';
    stopAlarmSound();
  };

  const confirmTimeChange = () => {
    const newTime = `${tempH.toString().padStart(2, '0')}:${tempM.toString().padStart(2, '0')}`;
    setAlarmTime(newTime);
    saveAlarmTime(newTime);
    setIsEditing(false);
    lastFiredMinute.current = '';
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // RENDER FUNCTIONS
  const renderIdle = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Momentum</Text>
          <Text style={styles.subtitle}>ESTABLISH DISCIPLINE</Text>
        </View>
        <View style={styles.clockContainer}>
          <Text style={styles.clock}>
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </Text>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.timeEditContainer}>
          <View style={styles.timePickerRow}>
            <View style={styles.timePicker}>
              <TouchableOpacity 
                onPress={() => setTempH((tempH + 1) % 24)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.timeDigit}>{tempH.toString().padStart(2, '0')}</Text>
              <TouchableOpacity 
                onPress={() => setTempH((tempH - 1 + 24) % 24)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.timeSeparator}>:</Text>
            
            <View style={styles.timePicker}>
              <TouchableOpacity 
                onPress={() => setTempM((tempM + 1) % 60)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>▲</Text>
              </TouchableOpacity>
              <Text style={styles.timeDigit}>{tempM.toString().padStart(2, '0')}</Text>
              <TouchableOpacity 
                onPress={() => setTempM((tempM - 1 + 60) % 60)}
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={confirmTimeChange}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>CONFIRM ALARM</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          style={styles.alarmDisplay}
        >
          <Text style={styles.alarmTime}>{alarmTime}</Text>
          <Text style={styles.setTimeText}>⌨ SET TIME</Text>
        </TouchableOpacity>
      )}

      <View style={styles.streakContainer}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakIcon}>🏆</Text>
          <Text style={styles.streakNumber}>{streak}</Text>
        </View>
        <Text style={styles.dailyLock}>DAILY LOCK: {alarmTime}</Text>
      </View>
    </ScrollView>
  );

  const renderAlarm = () => (
    <View style={styles.alarmContainer}>
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'rgba(0, 0, 0, 0.9)']}
        style={styles.alarmGradient}
      />
      
      <View style={styles.alarmContent}>
        <View style={styles.alarmIconContainer}>
          <Text style={styles.alarmIcon}>🔊</Text>
        </View>
        
        <Text style={styles.phaseTitle}>PHASE {verificationStage + 1}</Text>
        <Text style={styles.verificationText}>VERIFICATION ACTIVE</Text>
        
        <View style={styles.mathContainer}>
          <Text style={styles.mathQuestion}>{mathTask.q}</Text>
          <TextInput
            style={styles.mathInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="numeric"
            placeholder="?"
            placeholderTextColor="#444"
            autoFocus
            onSubmitEditing={handleTaskSubmit}
          />
          <TouchableOpacity 
            onPress={handleTaskSubmit}
            style={styles.verifyButton}
          >
            <Text style={styles.verifyButtonText}>VERIFY</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderWait = () => (
    <View style={styles.waitContainer}>
      <View style={styles.countdownCircle}>
        <View style={styles.spinnerOuter}>
          <View style={styles.spinnerInner} />
        </View>
        <View style={styles.countdownContent}>
          <Text style={styles.countdownTime}>
            {Math.floor(timerRemaining / 60)}:{(timerRemaining % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.nextWindowText}>NEXT WINDOW</Text>
        </View>
      </View>
      
      <Text style={styles.stayFocusedTitle}>STAY FOCUSED</Text>
      <Text style={styles.waitSubtext}>
        Phase {verificationStage} clear. Stand by for next prompt.
      </Text>
    </View>
  );

  const renderSuccess = () => (
    <ScrollView contentContainerStyle={styles.successContainer}>
      <View style={styles.successHeader}>
        <View>
          <Text style={styles.victoryTitle}>VICTORY</Text>
          <Text style={styles.victorySubtext}>ESTABLISH MOMENTUM</Text>
        </View>
        <View style={styles.trophyBadge}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.trophyNumber}>{streak}</Text>
        </View>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.cardLabel}>🧠 1% INSIGHT</Text>
        <Text style={styles.insightText}>"{dailyInsight}"</Text>
      </View>

      <View style={styles.wordCard}>
        <Text style={styles.cardLabel}>📖 ARTICULATION</Text>
        <Text style={styles.wordTitle}>{dailyWord.word}</Text>
        <Text style={styles.wordDef}>{dailyWord.def}</Text>
        <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>"{dailyWord.ex}"</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={resetApp}
        style={styles.resetButton}
      >
        <Text style={styles.resetButtonText}>RESET SYSTEM</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Main render
  return (
    <View style={styles.app}>
      <StatusBar style="light" />
      {view === 'IDLE' && renderIdle()}
      {view === 'ALARM' && renderAlarm()}
      {view === 'WAIT' && renderWait()}
      {view === 'SUCCESS' && renderSuccess()}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    fontStyle: 'italic',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 8,
  },
  clockContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clock: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  timeEditContainer: {
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    borderRadius: 40,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 40,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timePicker: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  timeDigit: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    marginVertical: 10,
  },
  timeSeparator: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    marginHorizontal: 20,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 24,
    borderRadius: 30,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  alarmDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 40,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#333',
    marginBottom: 40,
  },
  alarmTime: {
    fontSize: 72,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -3,
  },
  setTimeText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streakIcon: {
    fontSize: 24,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  dailyLock: {
    fontSize: 10,
    color: '#666',
    fontWeight: '900',
    letterSpacing: 3,
  },
  alarmContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  alarmGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  alarmContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  alarmIconContainer: {
    width: 128,
    height: 128,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 40,
  },
  alarmIcon: {
    fontSize: 60,
  },
  phaseTitle: {
    fontSize: 56,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#fff',
    letterSpacing: -2,
    marginBottom: 16,
  },
  verificationText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 64,
  },
  mathContainer: {
    width: '100%',
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    borderRadius: 56,
    padding: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  mathQuestion: {
    fontSize: 80,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 56,
    letterSpacing: -3,
  },
  mathInput: {
    backgroundColor: '#18181B',
    color: '#fff',
    fontSize: 56,
    padding: 32,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'transparent',
    textAlign: 'center',
    marginBottom: 40,
  },
  verifyButton: {
    backgroundColor: '#fff',
    paddingVertical: 32,
    borderRadius: 32,
  },
  verifyButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  waitContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  countdownCircle: {
    width: 288,
    height: 288,
    borderWidth: 20,
    borderColor: '#18181B',
    borderRadius: 144,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 64,
    position: 'relative',
  },
  spinnerOuter: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderWidth: 8,
    borderColor: '#3B82F6',
    borderTopColor: 'transparent',
    borderRadius: 112,
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
  },
  countdownContent: {
    alignItems: 'center',
  },
  countdownTime: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  nextWindowText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 2,
  },
  stayFocusedTitle: {
    fontSize: 56,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#fff',
    letterSpacing: -2,
    marginBottom: 24,
  },
  waitSubtext: {
    fontSize: 14,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 300,
  },
  successContainer: {
    flexGrow: 1,
    padding: 40,
    paddingTop: 60,
  },
  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 48,
  },
  victoryTitle: {
    fontSize: 56,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#fff',
    letterSpacing: -2,
  },
  victorySubtext: {
    fontSize: 10,
    color: '#666',
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 8,
  },
  trophyBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 32,
    alignItems: 'center',
  },
  trophyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  trophyNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  insightCard: {
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    padding: 40,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 32,
  },
  wordCard: {
    backgroundColor: 'rgba(15, 15, 15, 0.8)',
    padding: 40,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 32,
  },
  cardLabel: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 32,
  },
  insightText: {
    fontSize: 24,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#fff',
    lineHeight: 38,
  },
  wordTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
    marginBottom: 16,
  },
  wordDef: {
    fontSize: 20,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 32,
    lineHeight: 32,
  },
  exampleBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 32,
    borderRadius: 24,
    borderLeftWidth: 10,
    borderLeftColor: '#F59E0B',
  },
  exampleText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  resetButton: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    borderRadius: 40,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  resetButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
});
