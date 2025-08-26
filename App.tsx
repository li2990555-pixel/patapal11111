
import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import DailyRecordScreen from './screens/DailyRecordScreen';
import MoodRecordScreen from './screens/MoodRecordScreen';
import PetNurturingScreen from './screens/PetNurturingScreen';
import DiaryScreen from './screens/DiaryScreen';
import CompanionScreen from './screens/CompanionScreen';
import BottomNavBar from './components/BottomNavBar';
import FloatingPata from './components/FloatingPata';
import SettingsIcon from './components/icons/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import { Screen, Task, UserDiaryEntry, ChatMessage } from './types';
import { MOOD_MAP } from './constants/moods';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.LOGIN);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [taskForMoodLogging, setTaskForMoodLogging] = useState<{ id: number; text: string } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodHistory, setMoodHistory] = useState<{ [date: string]: string[] }>({});
  const [pataBackground, setPataBackground] = useState<string | null>(null);
  const [memoryPataBackground, setMemoryPataBackground] = useState<string | null>(null);
  const [userDiary, setUserDiary] = useState<UserDiaryEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loginData, setLoginData] = useState({ consecutiveDays: 0, totalDays: 0 });
  const [floatingPataMessage, setFloatingPataMessage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogin = useCallback((username: string, isAutoLogin = false) => {
    if (!isAutoLogin) {
      const firstLoginDate = localStorage.getItem('pata_first_login_date');
      if (!firstLoginDate) {
        localStorage.setItem('pata_first_login_date', new Date().toISOString());
      }
      
      const loginDataStr = localStorage.getItem('pata_login_data') || '{}';
      const savedLoginData = JSON.parse(loginDataStr);
      const today = new Date();
      today.setHours(0,0,0,0);

      const lastLogin = savedLoginData.lastLogin ? new Date(savedLoginData.lastLogin) : null;
      if(lastLogin) lastLogin.setHours(0,0,0,0);
      
      let consecutiveDays = savedLoginData.consecutiveDays || 0;
      let totalDays = savedLoginData.totalDays || 0;

      if (lastLogin) {
          const diffTime = today.getTime() - lastLogin.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (today.getTime() !== lastLogin.getTime()) { // Only update if it's a new day
            if (diffDays === 1) {
                consecutiveDays++;
            } else if (diffDays > 1) {
                consecutiveDays = 1;
            }
            totalDays++;
          }
      } else {
          consecutiveDays = 1;
          totalDays = 1;
      }
      
      const newLoginData = { lastLogin: today.toISOString().split('T')[0], consecutiveDays, totalDays };
      localStorage.setItem('pata_login_data', JSON.stringify(newLoginData));
      setLoginData({ consecutiveDays, totalDays });
    }
    
    setCurrentUser(username);
    setIsAuthenticated(true);
    setCurrentScreen(Screen.DAILY_RECORD);
    if (!isAutoLogin) {
        setFloatingPataMessage(`欢迎回来, ${username}!`);
    }
  }, []);

  useEffect(() => {
    const savedCreds = localStorage.getItem('pata_credentials');
    if (savedCreds) {
      try {
        const { username } = JSON.parse(savedCreds);
        if (username) {
          handleLogin(username, true);
        }
      } catch (error) {
        console.error("Failed to parse credentials, clearing them.", error);
        localStorage.removeItem('pata_credentials');
      }
    }
  }, [handleLogin]);

  useEffect(() => {
    try {
        const savedMoods = localStorage.getItem('pata_mood_history');
        if (savedMoods) {
            const parsedMoods = JSON.parse(savedMoods);
            Object.keys(parsedMoods).forEach(key => {
                if(typeof parsedMoods[key] === 'string') {
                    parsedMoods[key] = [parsedMoods[key]];
                }
            });
            setMoodHistory(parsedMoods);
        }
        const savedTasks = localStorage.getItem('pata_tasks');
        if (savedTasks) {
            setTasks(JSON.parse(savedTasks));
        }

        const savedMemoryItem = localStorage.getItem('pata_memory');
        const today = new Date().toISOString().split('T')[0];

        if (savedMemoryItem) {
            const savedMemory = JSON.parse(savedMemoryItem);
            if (savedMemory && typeof savedMemory.date === 'string' && savedMemory.date === today) {
                setMemoryPataBackground(savedMemory.background);
            } else {
                setMemoryPataBackground(null);
            }
        } else {
            if (localStorage.getItem('pata_memory_background')) {
                localStorage.removeItem('pata_memory_background');
            }
            setMemoryPataBackground(null);
        }
        
        const savedUserDiary = localStorage.getItem('pata_user_diary');
        if (savedUserDiary) {
            setUserDiary(JSON.parse(savedUserDiary));
        }
        
        const savedChatMessages = localStorage.getItem('pata_chat_messages');
        if (savedChatMessages) {
            setChatMessages(JSON.parse(savedChatMessages));
        }

        const savedLoginData = localStorage.getItem('pata_login_data');
        if (savedLoginData) {
            const data = JSON.parse(savedLoginData);
            setLoginData({ consecutiveDays: data.consecutiveDays || 0, totalDays: data.totalDays || 0 });
        }


    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setMemoryPataBackground(null); // Reset on error
    }
  }, []);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysMoodIds = moodHistory[today] || [];
    
    let newBackground: string | null = null;

    if (todaysMoodIds.length === 1) {
      const mood = MOOD_MAP[todaysMoodIds[0]];
      if (mood) {
        newBackground = `linear-gradient(to bottom right, ${mood.fromColor}, ${mood.toColor})`;
      }
    } else if (todaysMoodIds.length > 1) {
      const colors = todaysMoodIds
        .map(id => MOOD_MAP[id]?.toColor)
        .filter(Boolean);
      if (colors.length > 0) {
        newBackground = `linear-gradient(to bottom right, ${colors.join(', ')})`;
      }
    }
    
    setPataBackground(newBackground);
  }, [moodHistory]);

  useEffect(() => {
      localStorage.setItem('pata_mood_history', JSON.stringify(moodHistory));
  }, [moodHistory]);
  
  useEffect(() => {
      localStorage.setItem('pata_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('pata_user_diary', JSON.stringify(userDiary));
  }, [userDiary]);

  useEffect(() => {
    localStorage.setItem('pata_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);
  
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const memoryToSave = {
        background: pataBackground,
        date: today,
    };
    localStorage.setItem('pata_memory', JSON.stringify(memoryToSave));
    setMemoryPataBackground(pataBackground);
  }, [pataBackground]);

  const handleFlowFinish = useCallback((task: { id: number; text: string }) => {
    setTaskForMoodLogging(task);
    setCurrentScreen(Screen.MOOD_RECORD);
  }, []);

  const handleMoodSaved = useCallback((moodId: string) => {
    if (taskForMoodLogging) {
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskForMoodLogging.id ? { ...t, moodId, completed: true } : t
        )
      );
    }
    const today = new Date().toISOString().split('T')[0];
    setMoodHistory(prev => {
        const currentMoods = prev[today] || [];
        if (!currentMoods.includes(moodId)) {
            return { ...prev, [today]: [...currentMoods, moodId] };
        }
        return prev;
    });
    setTaskForMoodLogging(null);
    setCurrentScreen(Screen.DAILY_RECORD);
  }, [taskForMoodLogging]);
  
  const handleClearCache = () => {
    const confirmed = window.confirm('你确定要清除所有本地数据吗？此操作不可恢复。');
    if (confirmed) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.DAILY_RECORD:
        return <DailyRecordScreen tasks={tasks} setTasks={setTasks} onFlowFinish={handleFlowFinish} pataBackground={pataBackground} />;
      case Screen.MOOD_RECORD:
        return <MoodRecordScreen completedTask={taskForMoodLogging} onMoodSaved={handleMoodSaved} pataBackground={pataBackground} />;
      case Screen.PET_NURTURING:
        return <PetNurturingScreen moodHistory={moodHistory} tasks={tasks} userDiary={userDiary} loginData={loginData} pataBackground={pataBackground} setFloatingPataMessage={setFloatingPataMessage} />;
      case Screen.DIARY:
        return <DiaryScreen userDiary={userDiary} setUserDiary={setUserDiary} tasks={tasks} moodHistory={moodHistory} />;
      case Screen.COMPANION:
        return <CompanionScreen pataBackground={pataBackground} chatMessages={chatMessages} setChatMessages={setChatMessages} currentUser={currentUser} />;
      default:
        return <DailyRecordScreen tasks={tasks} setTasks={setTasks} onFlowFinish={handleFlowFinish} pataBackground={pataBackground} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} pataBackground={memoryPataBackground} />;
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-slate-50 max-w-md mx-auto flex flex-col pb-20">
      <header className="absolute top-4 right-4 z-20">
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="打开设置">
          <SettingsIcon />
        </button>
      </header>
      <main className="flex-grow h-full overflow-y-auto">
        {renderScreen()}
      </main>
      <BottomNavBar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />
      <FloatingPata pataBackground={pataBackground} message={floatingPataMessage} setMessage={setFloatingPataMessage} />
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onClearCache={handleClearCache} />}
    </div>
  );
};

export default App;