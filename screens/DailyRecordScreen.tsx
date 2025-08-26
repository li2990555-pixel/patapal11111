
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PataSlime from '../components/PataSlime';
import { Task, Priority } from '../types';
import PlayIcon from '../components/icons/PlayIcon';
import PauseIcon from '../components/icons/PauseIcon';
import Calendar from '../components/Calendar';
import CalendarIcon from '../components/icons/CalendarIcon';
import { MOOD_MAP } from '../constants/moods';

const ClockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const formatFlowTime = (timeInSeconds: number) => {
    if (!timeInSeconds) return '';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

const TaskItem: React.FC<{ task: Task; onToggleComplete: (id: number) => void; onStartFlow: (task: Task) => void; }> = ({ task, onToggleComplete, onStartFlow }) => {
  const mood = task.moodId ? MOOD_MAP[task.moodId] : null;
  return (
    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 transition-transform transform hover:scale-[1.02]">
      <button
        onClick={() => onToggleComplete(task.id)}
        className={`w-5 h-5 rounded border-2 flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-white border-slate-800'
            : 'bg-white border-slate-800'
        }`}
        aria-pressed={task.completed}
        aria-labelledby={`task-text-${task.id}`}
        >
        {task.completed && (
            <svg className="w-3 h-3 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        )}
       </button>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
            <span id={`task-text-${task.id}`} className={`text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.text}</span>
            {mood && <div className={`w-3 h-3 rounded-full ${mood.color}`} title={`Mood: ${mood.title}`}></div>}
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
            {task.deadline && (
                <span>截止: {task.deadline}</span>
            )}
            {task.flowDuration && task.flowDuration > 0 && (
                <span className="flex items-center gap-1">
                    <ClockIcon /> {formatFlowTime(task.flowDuration)}
                </span>
            )}
        </div>
      </div>
       {!task.completed && (
            <button 
              onClick={() => onStartFlow(task)}
              className="p-2 rounded-full text-violet-500 hover:bg-violet-100 transition-colors flex-shrink-0"
              aria-label={`为 ${task.text} 开始心流`}
            >
              <PlayIcon />
            </button>
        )}
    </div>
  );
};

const TaskSection: React.FC<{ title: string; tasks: Task[]; color: string; onToggleComplete: (id: number) => void; onStartFlow: (task: Task) => void; }> = ({ title, tasks, color, onToggleComplete, onStartFlow }) => (
  <div className={`${color} p-4 rounded-2xl shadow-lg min-h-[150px]`}>
    <h3 className="font-bold text-white text-lg mb-2 px-1">
        {title}
    </h3>
    <div className="space-y-2">
      {tasks.length > 0 ? (
        tasks.map(task => <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onStartFlow={onStartFlow} />)
      ) : (
        <div className="text-center py-4">
          <p className="text-white/80 text-sm">这里空空如也~</p>
        </div>
      )}
    </div>
  </div>
);

const PriorityToggle: React.FC<{
  label: string;
  option1: string;
  option2: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}> = ({ label, option1, option2, value, onToggle }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{label}</span>
        <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button onClick={() => onToggle(true)} className={`px-3 py-1 text-sm rounded-full transition-all ${value ? 'bg-white shadow font-semibold' : 'text-slate-500'}`}>
                {option1}
            </button>
            <button onClick={() => onToggle(false)} className={`px-3 py-1 text-sm rounded-full transition-all ${!value ? 'bg-white shadow font-semibold' : 'text-slate-500'}`}>
                {option2}
            </button>
        </div>
    </div>
);


const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};


const FlowModeView: React.FC<{ task: Task; onFinish: (duration: number, pauseCount: number) => void; pataBackground: string | null; }> = ({ task, onFinish, pataBackground }) => {
    const [flowTime, setFlowTime] = useState(0);
    const [isFlowing, setIsFlowing] = useState(true);
    const [pauseCount, setPauseCount] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (isFlowing) {
            interval = setInterval(() => {
                setFlowTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isFlowing]);

    const handleTogglePause = () => {
        if (isFlowing) {
            const newPauseCount = pauseCount + 1;
            setPauseCount(newPauseCount);
            setIsFlowing(false); 

            if (newPauseCount >= 3) {
                setTimeout(() => onFinish(flowTime, newPauseCount), 1200);
            }
        } else {
            if (pauseCount < 3) {
                setIsFlowing(true);
            }
        }
    };

    const pausesLeft = 3 - pauseCount;
    const handleFinish = () => onFinish(flowTime, pauseCount);

    return (
        <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-between p-6 z-50 animate-fade-in">
             <button onClick={handleFinish} className="absolute top-6 left-6 text-sm text-slate-400 hover:text-white transition-colors">
                &larr; 退出心流
            </button>

            <div className="text-center w-full mt-16">
                <p className="text-slate-400 mb-2">正在专注</p>
                <h1 className="text-3xl font-bold break-words">{task.text}</h1>
            </div>

            <div className="font-mono text-7xl md:text-8xl font-bold my-8 tracking-wider">
                {formatTime(flowTime)}
            </div>

            <div className="flex flex-col items-center w-full">
                 <p className={`text-sm mb-4 transition-colors ${pausesLeft <= 1 ? 'text-rose-400 font-semibold animate-pulse' : 'text-amber-400'}`}>
                    {pausesLeft > 0 ? `剩余暂停次数: ${pausesLeft}` : '暂停次数已用完！心流即将结束...'}
                </p>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleTogglePause}
                        className={`flex items-center justify-center gap-2 w-32 px-4 py-3 rounded-full font-semibold text-sm transition ${isFlowing ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'} ${pausesLeft <= 0 && !isFlowing ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={pausesLeft <= 0 && !isFlowing}
                    >
                        {isFlowing ? <PauseIcon /> : <PlayIcon />}
                        {isFlowing ? '暂停' : '继续'}
                    </button>
                    <button 
                        onClick={handleFinish}
                        className="w-32 px-4 py-3 rounded-full font-semibold text-sm bg-violet-500 hover:bg-violet-600 text-white transition"
                    >
                        完成
                    </button>
                </div>
                <div className="mt-12">
                    <PataSlime size="sm" background={pataBackground} />
                </div>
            </div>
        </div>
    );
};

interface DailyRecordScreenProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onFlowFinish: (task: { id: number; text: string }) => void;
  pataBackground: string | null;
}

interface PlanModeViewProps {
  tasks: Task[];
  newTaskText: string;
  isNewTaskImportant: boolean;
  isNewTaskUrgent: boolean;
  newTaskDeadline: string;
  onTaskTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIsImportantToggle: (value: boolean) => void;
  onIsUrgentToggle: (value: boolean) => void;
  onCalendarOpen: () => void;
  onAddTask: () => void;
  onToggleComplete: (id: number) => void;
  onStartFlow: (task: Task) => void;
}

const PlanModeView: React.FC<PlanModeViewProps> = ({
  tasks,
  newTaskText,
  isNewTaskImportant,
  isNewTaskUrgent,
  newTaskDeadline,
  onTaskTextChange,
  onIsImportantToggle,
  onIsUrgentToggle,
  onCalendarOpen,
  onAddTask,
  onToggleComplete,
  onStartFlow,
}) => {
    const sortTasks = (tasks: Task[]) => tasks.sort((a, b) => Number(a.completed) - Number(b.completed));
    const urgentImportantTasks = sortTasks(tasks.filter(t => t.priority === Priority.URGENT_IMPORTANT));
    const importantNotUrgentTasks = sortTasks(tasks.filter(t => t.priority === Priority.IMPORTANT_NOT_URGENT));
    const urgentNotImportantTasks = sortTasks(tasks.filter(t => t.priority === Priority.URGENT_NOT_IMPORTANT));
    const notImportantNotUrgentTasks = sortTasks(tasks.filter(t => t.priority === Priority.NOT_IMPORTANT_NOT_URGENT));

    return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">今日计划</h2>

        <div className="bg-white p-4 rounded-xl shadow-md mb-6 space-y-4">
          <div>
            <input
              type="text"
              placeholder="有什么新计划？"
              value={newTaskText}
              onChange={onTaskTextChange}
              className="w-full px-4 py-3 bg-slate-100 text-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none transition"
            />
          </div>
           <div className='space-y-3 px-1'>
            <PriorityToggle label="重要性" option1="重要" option2="不重要" value={isNewTaskImportant} onToggle={onIsImportantToggle} />
            <PriorityToggle label="紧急性" option1="紧急" option2="不紧急" value={isNewTaskUrgent} onToggle={onIsUrgentToggle} />
           </div>
           <button
              onClick={onCalendarOpen}
              className="w-full px-4 py-3 bg-slate-100 border-transparent rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none transition text-slate-700 flex items-center justify-between"
          >
              <span className={newTaskDeadline ? 'text-slate-700' : 'text-slate-400'}>
                  {newTaskDeadline ? `截止日期: ${newTaskDeadline}` : '设置截止日期 (可选)'}
              </span>
              <CalendarIcon />
          </button>
          <div className="flex justify-end">
            <button
              onClick={onAddTask}
              disabled={!newTaskText.trim()}
              className="px-6 py-2 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              添加任务
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <TaskSection title="重要不紧急" tasks={importantNotUrgentTasks} color="bg-amber-500/90" onToggleComplete={onToggleComplete} onStartFlow={onStartFlow} />
            <TaskSection title="重要紧急" tasks={urgentImportantTasks} color="bg-rose-500/90" onToggleComplete={onToggleComplete} onStartFlow={onStartFlow} />
            <TaskSection title="不重要不紧急" tasks={notImportantNotUrgentTasks} color="bg-sky-500/90" onToggleComplete={onToggleComplete} onStartFlow={onStartFlow} />
            <TaskSection title="不重要紧急" tasks={urgentNotImportantTasks} color="bg-purple-500/90" onToggleComplete={onToggleComplete} onStartFlow={onStartFlow} />
        </div>
      </div>
    </div>
  )};

const DailyRecordScreen: React.FC<DailyRecordScreenProps> = ({ tasks, setTasks, onFlowFinish, pataBackground }) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [isNewTaskImportant, setIsNewTaskImportant] = useState(true);
  const [isNewTaskUrgent, setIsNewTaskUrgent] = useState(false);
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [flowTask, setFlowTask] = useState<Task | null>(null);

  const handleTaskTextchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTaskText(e.target.value);
  };
  
  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;

    const getPriority = (isImportant: boolean, isUrgent: boolean): Priority => {
        if (isImportant && isUrgent) return Priority.URGENT_IMPORTANT;
        if (isImportant && !isUrgent) return Priority.IMPORTANT_NOT_URGENT;
        if (!isImportant && isUrgent) return Priority.URGENT_NOT_IMPORTANT;
        return Priority.NOT_IMPORTANT_NOT_URGENT;
    };

    const newTask: Task = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      priority: getPriority(isNewTaskImportant, isNewTaskUrgent),
      deadline: newTaskDeadline || undefined,
    };
    
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTaskText('');
    setNewTaskDeadline('');
  };

  const handleToggleComplete = (taskId: number) => {
    setTasks(currentTasks => 
        currentTasks.map(t => 
            t.id === taskId ? { ...t, completed: !t.completed } : t
        )
    );
  };
  
  const handleStartFlow = (task: Task) => {
    setFlowTask(task);
  };
  
  const handleFlowFinish = (duration: number, pauseCount: number) => {
    if (!flowTask) return;
    const finishedTask = { ...flowTask };
    setTasks(prevTasks =>
        prevTasks.map(t =>
            t.id === finishedTask.id
                ? { ...t, flowDuration: (t.flowDuration || 0) + duration, pauseCount: (t.pauseCount || 0) + pauseCount }
                : t
        )
    );
    onFlowFinish({ id: finishedTask.id, text: finishedTask.text });
    setFlowTask(null);
  };

  if (flowTask) {
    return <FlowModeView task={flowTask} onFinish={handleFlowFinish} pataBackground={pataBackground} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto">
            <PlanModeView
              tasks={tasks}
              newTaskText={newTaskText}
              isNewTaskImportant={isNewTaskImportant}
              isNewTaskUrgent={isNewTaskUrgent}
              newTaskDeadline={newTaskDeadline}
              onTaskTextChange={handleTaskTextchange}
              onIsImportantToggle={setIsNewTaskImportant}
              onIsUrgentToggle={setIsNewTaskUrgent}
              onCalendarOpen={() => setIsCalendarOpen(true)}
              onAddTask={handleAddTask}
              onToggleComplete={handleToggleComplete}
              onStartFlow={handleStartFlow}
            />
        </div>
      </div>

      {isCalendarOpen && (
        <Calendar
            selectedDate={newTaskDeadline}
            onSelectDate={(date) => {
                setNewTaskDeadline(date);
                setIsCalendarOpen(false);
            }}
            onClose={() => setIsCalendarOpen(false)}
        />
    )}
    </div>
  );
};

export default DailyRecordScreen;