
import React, { useState, useMemo } from 'react';
import { MOOD_MAP } from '../constants/moods';
import PataSlime from './PataSlime';
import { Task } from '../types';

interface CombinedCalendarProps {
  moodHistory: { [date: string]: string[] };
  tasks: Task[];
  onDateSelect: (date: string) => void;
}

const CombinedCalendar: React.FC<CombinedCalendarProps> = ({ moodHistory, tasks, onDateSelect }) => {
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };
    
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); 
    const daysInMonth = endOfMonth.getDate();

    const days = [];
    // Pad start of month
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-12"></div>);
    }

    // Render days
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateString = formatDate(dayDate);
        
        const moodIds = moodHistory[dateString] || [];
        const hasTasks = tasksByDate.has(dateString) && (tasksByDate.get(dateString)?.length ?? 0) > 0;
        const isClickable = moodIds.length > 0 || hasTasks;
        
        const isToday = formatDate(new Date()) === dateString;
        
        let background: string | null = null;
        if (moodIds.length === 1) {
            const mood = MOOD_MAP[moodIds[0]];
            if (mood) {
                background = `linear-gradient(to bottom right, ${mood.fromColor}, ${mood.toColor})`;
            }
        } else if (moodIds.length > 1) {
            const colors = moodIds.map(id => MOOD_MAP[id]?.toColor).filter(Boolean);
            if (colors.length > 0) {
                background = `linear-gradient(to bottom right, ${colors.join(', ')})`;
            }
        }

        days.push(
            <button 
                key={i} 
                onClick={() => isClickable && onDateSelect(dateString)}
                disabled={!isClickable}
                aria-label={isClickable ? `查看 ${dateString} 的回顾` : `${dateString} 没有记录`}
                className={`flex flex-col justify-start items-center w-10 h-12 rounded-lg pt-1 relative transition-colors ${
                    isToday ? 'bg-violet-100' : ''
                } ${
                    isClickable ? 'cursor-pointer hover:bg-slate-100' : 'cursor-default'
                }`}
            >
                <span className={`text-sm ${isToday ? 'font-bold text-violet-600' : isClickable ? 'text-slate-700' : 'text-slate-400'}`}>
                    {i}
                </span>
                {background && (
                    <div className="mt-1">
                        <PataSlime size="xxs" background={background} />
                    </div>
                )}
                {hasTasks && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-violet-400 rounded-full"></div>}
            </button>
        );
    }

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

    return (
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">时光日历</h2>
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100" aria-label="上个月">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="font-bold text-lg text-slate-800" aria-live="polite">
                    {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                </div>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100" aria-label="下个月">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-500 font-medium mb-2" aria-hidden="true">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1 place-items-center">
                {days}
            </div>
        </div>
    );
};

export default CombinedCalendar;