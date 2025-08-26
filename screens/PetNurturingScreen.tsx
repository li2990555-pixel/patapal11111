
import React, { useMemo, useState } from 'react';
import PataSlime from '../components/PataSlime';
import CombinedCalendar from '../components/CombinedCalendar';
import DailyDetailModal from '../components/DailyDetailModal';
import { Task, UserDiaryEntry } from '../types';
import Calendar from '../components/Calendar';
import InfoTooltipModal from '../components/InfoTooltipModal';

interface ProgressBarProps {
  label: string;
  value: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-3">
      <div
        className={`${color} h-3 rounded-full transition-all duration-500`}
        style={{ width: `${Math.floor(value)}%` }}
      ></div>
    </div>
  </div>
);

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-1.5 text-sm rounded-full transition-all w-full ${isActive ? 'bg-white shadow font-semibold text-violet-600' : 'text-slate-500 hover:bg-slate-200'}`}>
        {label}
    </button>
);


interface PetNurturingScreenProps {
  moodHistory: { [date: string]: string[] };
  tasks: Task[];
  userDiary: UserDiaryEntry[];
  loginData: { consecutiveDays: number; totalDays: number; };
  pataBackground: string | null;
  setFloatingPataMessage: (message: string | null) => void;
}

const PetNurturingScreen: React.FC<PetNurturingScreenProps> = ({
  moodHistory,
  tasks,
  userDiary,
  loginData,
  pataBackground,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'vitality' | 'lightSpot' | 'imprint' | null>(null);
  const [infoModalType, setInfoModalType] = useState<'vitality' | 'lightSpot' | 'imprint' | null>(null);
  
  type FilterType = 'today' | 'week' | 'year' | 'custom';
  const [flowFilter, setFlowFilter] = useState<FilterType>('today');
  const [customFlowRange, setCustomFlowRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const [diaryFilter, setDiaryFilter] = useState<FilterType>('today');
  const [customDiaryRange, setCustomDiaryRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  
  const [calendarFor, setCalendarFor] = useState<{ modal: 'flow' | 'diary', type: 'start' | 'end' } | null>(null);

  const rawTotals = useMemo(() => {
    const INITIAL_GROWTH_VALUE = 10;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- Vitality ---
    // Growth: Based on total login days and consecutive day bonuses.
    const vitalityBonus = (loginData.consecutiveDays >= 30 ? 10 : (loginData.consecutiveDays >= 7 ? 5 : 0));
    const baseVitality = loginData.totalDays + vitalityBonus;

    // Decay: A small, flat decay for each day of inactivity.
    const loginInfo = JSON.parse(localStorage.getItem('pata_login_data') || '{}');
    const lastLoginDate = loginInfo.lastLogin ? new Date(loginInfo.lastLogin) : today;
    lastLoginDate.setHours(0, 0, 0, 0);
    const daysSinceLastLogin = (today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
    const vitalityDecay = Math.max(0, daysSinceLastLogin) * 0.5; // -0.5 points per day missed.
    const vitality = Math.max(INITIAL_GROWTH_VALUE, baseVitality - vitalityDecay);

    // --- Light Spot ---
    // Growth: Based on the number of diary entries.
    const baseLightSpot = userDiary.length * 2;
    
    // Decay: Based on days since the last diary entry was written.
    let lightSpotDecay = 0;
    if (userDiary.length > 0) {
      const lastDiaryDateStr = userDiary.reduce((latest, entry) => (entry.date > latest ? entry.date : latest), userDiary[0].date);
      const lastDiaryDate = new Date(lastDiaryDateStr);
      lastDiaryDate.setHours(0, 0, 0, 0);
      const daysSinceLastDiary = (today.getTime() - lastDiaryDate.getTime()) / (1000 * 60 * 60 * 24);
      lightSpotDecay = Math.max(0, daysSinceLastDiary - 1) * 1; // -1 point per day missed, with a 1-day grace period.
    } else {
      const firstLoginStr = localStorage.getItem('pata_first_login_date');
      if (firstLoginStr) {
        const firstLoginDate = new Date(firstLoginStr);
        firstLoginDate.setHours(0, 0, 0, 0);
        const daysSinceFirstLogin = (today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24);
        lightSpotDecay = Math.max(0, daysSinceFirstLogin) * 1;
      }
    }
    const lightSpot = Math.max(INITIAL_GROWTH_VALUE, baseLightSpot - lightSpotDecay);

    // --- Imprint ---
    // Growth: Based on total flow (focus) time.
    const totalFlowSeconds = tasks.reduce((sum, task) => sum + (task.flowDuration || 0), 0);
    const totalFlowMinutes = totalFlowSeconds / 60;
    const baseImprint = Math.floor(totalFlowMinutes / 10) * 2;

    // Decay: Based on days since the last flow session.
    let imprintDecay = 0;
    const tasksWithFlow = tasks.filter(t => t.flowDuration && t.flowDuration > 0);
    if (tasksWithFlow.length > 0) {
        const lastFlowTask = tasksWithFlow.reduce((latest, task) => (task.id > latest.id ? task : latest), tasksWithFlow[0]);
        const lastFlowDate = new Date(lastFlowTask.id);
        lastFlowDate.setHours(0, 0, 0, 0);
        const daysSinceLastFlow = (today.getTime() - lastFlowDate.getTime()) / (1000 * 60 * 60 * 24);
        imprintDecay = Math.max(0, daysSinceLastFlow - 1) * 0.5; // -0.5 points per day missed, with a 1-day grace period.
    } else {
        const firstLoginStr = localStorage.getItem('pata_first_login_date');
        if (firstLoginStr) {
            const firstLoginDate = new Date(firstLoginStr);
            firstLoginDate.setHours(0, 0, 0, 0);
            const daysSinceFirstLogin = (today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24);
            imprintDecay = Math.max(0, daysSinceFirstLogin) * 0.5;
        }
    }
    const imprint = Math.max(INITIAL_GROWTH_VALUE, baseImprint - imprintDecay);

    return { 
      vitality: Math.floor(vitality), 
      lightSpot: Math.floor(lightSpot), 
      imprint: Math.floor(imprint) 
    };
  }, [loginData, userDiary, tasks]);
  
  const growthLevel = useMemo(() => {
    return Math.floor(rawTotals.vitality / 100) +
           Math.floor(rawTotals.lightSpot / 100) +
           Math.floor(rawTotals.imprint / 100);
  }, [rawTotals]);
  
  const displayAttributes = useMemo(() => ({
    vitality: rawTotals.vitality % 100,
    lightSpot: rawTotals.lightSpot % 100,
    imprint: rawTotals.imprint % 100,
  }), [rawTotals]);
  
  const totalFlowDuration = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let filteredTasks: Task[] = [];

    switch (flowFilter) {
      case 'today':
        filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.id);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });
        break;
      case 'week':
        filteredTasks = tasks.filter(task => {
          const taskDate = new Date(task.id);
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
        break;
      case 'year':
        filteredTasks = tasks.filter(task => new Date(task.id).getFullYear() === today.getFullYear());
        break;
      case 'custom':
        let { start, end } = customFlowRange;
        if (start && end && new Date(start) > new Date(end)) {
            [start, end] = [end, start];
        }
        
        const startDate = start ? new Date(start) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);

        const endDate = end ? new Date(end) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        if (startDate && endDate) {
            filteredTasks = tasks.filter(task => {
                const taskDate = new Date(task.id);
                return taskDate >= startDate && taskDate <= endDate;
            });
        }
        break;
    }

    return filteredTasks.reduce((sum, task) => sum + (task.flowDuration || 0), 0);
  }, [tasks, flowFilter, customFlowRange]);

  const totalDiaryEntries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    let filteredDiary: UserDiaryEntry[] = [];

    switch (diaryFilter) {
      case 'today':
        const todayStr = today.toISOString().split('T')[0];
        filteredDiary = userDiary.filter(entry => entry.date === todayStr);
        break;
      case 'week':
        filteredDiary = userDiary.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startOfWeek && entryDate <= endOfWeek;
        });
        break;
      case 'year':
        filteredDiary = userDiary.filter(entry => new Date(entry.date).getFullYear() === today.getFullYear());
        break;
      case 'custom':
        let { start, end } = customDiaryRange;
        if (start && end && new Date(start) > new Date(end)) {
            [start, end] = [end, start];
        }
        
        const startDate = start ? new Date(start) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);

        const endDate = end ? new Date(end) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        if (startDate && endDate) {
            filteredDiary = userDiary.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate >= startDate && entryDate <= endDate;
            });
        }
        break;
    }
    return filteredDiary.length;
  }, [userDiary, diaryFilter, customDiaryRange]);

  const formatDuration = (totalSeconds: number) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return { hours: 0, minutes: 0 };
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return { hours, minutes };
  };

  const { hours, minutes } = formatDuration(totalFlowDuration);

  const scale = Math.min(0.3 + growthLevel * 0.1, 1.0);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
        const taskDate = task.deadline || new Date(task.id).toISOString().split('T')[0];
        if (!map.has(taskDate)) {
            map.set(taskDate, []);
        }
        map.get(taskDate)!.push(task);
    });
    return map;
  }, [tasks]);
  
  const selectedTasks = selectedDate ? tasksByDate.get(selectedDate) || [] : [];
  const selectedMoods = selectedDate ? moodHistory[selectedDate] || [] : [];
  
  const handleAttributeClick = (type: 'vitality' | 'lightSpot' | 'imprint') => {
    const hideTooltip = localStorage.getItem(`pata_hide_tooltip_${type}`);
    if (hideTooltip === 'true') {
      setActiveModal(type);
    } else {
      setInfoModalType(type);
    }
  };

  const handleInfoModalClose = (dontRemind: boolean) => {
    if (infoModalType) {
      if (dontRemind) {
        localStorage.setItem(`pata_hide_tooltip_${infoModalType}`, 'true');
      }
      // Open the stats/details modal immediately after closing the info modal.
      setActiveModal(infoModalType);
      setInfoModalType(null);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="text-center mt-6 mb-8">
        <p className="text-slate-500">你和pata互相看见了对方。</p>
      </div>

      <div 
        className="relative w-64 h-64 flex items-center justify-center transition-transform duration-500"
        style={{ transform: `scale(${scale})` }}
      >
        <div
          className="absolute animate-pulse-aura"
          style={{
            width: '100%',
            height: '100%',
            opacity: displayAttributes.lightSpot / 100,
          }}
        />
        <PataSlime 
            size="lg" 
            background={pataBackground} 
            imprint={displayAttributes.vitality}
        />
      </div>


      <div className="w-full max-w-sm space-y-6 bg-white p-6 rounded-2xl shadow-lg mt-8">
        <div className="cursor-pointer transition-transform transform hover:scale-105" onClick={() => handleAttributeClick('vitality')}>
          <ProgressBar label="活力" value={displayAttributes.vitality} color="bg-green-400" />
        </div>
        <div className="cursor-pointer transition-transform transform hover:scale-105" onClick={() => handleAttributeClick('lightSpot')}>
          <ProgressBar label="光点" value={displayAttributes.lightSpot} color="bg-yellow-400" />
        </div>
        <div className="cursor-pointer transition-transform transform hover:scale-105" onClick={() => handleAttributeClick('imprint')}>
          <ProgressBar label="心迹" value={displayAttributes.imprint} color="bg-rose-400" />
        </div>
      </div>
      
      {activeModal === 'vitality' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
            <div onClick={(e) => e.stopPropagation()} className="animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                <CombinedCalendar 
                    moodHistory={moodHistory}
                    tasks={tasks}
                    onDateSelect={(date) => {
                        setActiveModal(null);
                        setSelectedDate(date);
                    }}
                />
            </div>
        </div>
      )}

      {activeModal === 'lightSpot' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm animate-fade-in-up" style={{animationDuration: '0.3s'}} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-4">碎碎念次数</h3>
                 <div className="flex justify-between items-center bg-slate-100 rounded-full p-1 mb-4">
                    <FilterButton label="当天" isActive={diaryFilter === 'today'} onClick={() => setDiaryFilter('today')} />
                    <FilterButton label="本周" isActive={diaryFilter === 'week'} onClick={() => setDiaryFilter('week')} />
                    <FilterButton label="今年" isActive={diaryFilter === 'year'} onClick={() => setDiaryFilter('year')} />
                    <FilterButton label="自定义" isActive={diaryFilter === 'custom'} onClick={() => setDiaryFilter('custom')} />
                </div>
                {diaryFilter === 'custom' && (
                    <div className="flex justify-center items-center gap-2 mb-4 animate-fade-in-up">
                        <button onClick={() => setCalendarFor({modal: 'diary', type: 'start'})} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                            {customDiaryRange.start || '开始日期'}
                        </button>
                        <span className="text-slate-400">-</span>
                        <button onClick={() => setCalendarFor({modal: 'diary', type: 'end'})} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                            {customDiaryRange.end || '结束日期'}
                        </button>
                    </div>
                )}
                <div className="text-center py-2">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-yellow-500 tabular-nums">{totalDiaryEntries}</span>
                        <span className="text-lg text-slate-500 font-medium">次</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">总记录次数</p>
                </div>
            </div>
        </div>
      )}

      {activeModal === 'imprint' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActiveModal(null)}>
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm animate-fade-in-up" style={{animationDuration: '0.3s'}} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800 mb-4">心流时长</h3>
                <div className="flex justify-between items-center bg-slate-100 rounded-full p-1 mb-4">
                    <FilterButton label="当天" isActive={flowFilter === 'today'} onClick={() => setFlowFilter('today')} />
                    <FilterButton label="本周" isActive={flowFilter === 'week'} onClick={() => setFlowFilter('week')} />
                    <FilterButton label="今年" isActive={flowFilter === 'year'} onClick={() => setFlowFilter('year')} />
                    <FilterButton label="自定义" isActive={flowFilter === 'custom'} onClick={() => setFlowFilter('custom')} />
                </div>
                {flowFilter === 'custom' && (
                    <div className="flex justify-center items-center gap-2 mb-4 animate-fade-in-up">
                        <button onClick={() => setCalendarFor({modal: 'flow', type: 'start'})} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                            {customFlowRange.start || '开始日期'}
                        </button>
                        <span className="text-slate-400">-</span>
                        <button onClick={() => setCalendarFor({modal: 'flow', type: 'end'})} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200 transition">
                            {customFlowRange.end || '结束日期'}
                        </button>
                    </div>
                )}
                 <div className="text-center py-2">
                    <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-rose-500 tabular-nums">{hours}</span>
                        <span className="text-lg text-slate-500 font-medium">小时</span>
                        <span className="text-4xl font-bold text-rose-500 ml-2 tabular-nums">{minutes}</span>
                        <span className="text-lg text-slate-500 font-medium">分钟</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">总专注时长</p>
                </div>
            </div>
        </div>
      )}
      
      {selectedDate && (
        <DailyDetailModal
          date={selectedDate}
          tasks={selectedTasks}
          moods={selectedMoods}
          onClose={() => setSelectedDate(null)}
        />
      )}

      {calendarFor && (
        <Calendar
            selectedDate={
                calendarFor.modal === 'flow'
                    ? (calendarFor.type === 'start' ? customFlowRange.start : customFlowRange.end) || ''
                    : (calendarFor.type === 'start' ? customDiaryRange.start : customDiaryRange.end) || ''
            }
            onSelectDate={(date) => {
                if (calendarFor.modal === 'flow') {
                    setCustomFlowRange(prev => ({ ...prev, [calendarFor.type]: date }));
                } else {
                    setCustomDiaryRange(prev => ({ ...prev, [calendarFor.type]: date }));
                }
                setCalendarFor(null);
            }}
            onClose={() => setCalendarFor(null)}
        />
      )}

      {infoModalType && (
        <InfoTooltipModal
          type={infoModalType}
          onClose={handleInfoModalClose}
        />
      )}
    </div>
  );
};

export default PetNurturingScreen;