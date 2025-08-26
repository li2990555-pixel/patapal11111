
import React, { useMemo, useState } from 'react';
import { Task, Priority } from '../types';
import { MOOD_MAP } from '../constants/moods';
import { PRIORITY_MAP } from '../constants/priorities';
import PieChart, { PieChartData } from './PieChart';

interface DailyDetailModalProps {
  date: string;
  tasks: Task[];
  moods: string[]; // mood IDs for the day
  onClose: () => void;
}

const formatFlowTime = (timeInSeconds: number) => {
    if (!timeInSeconds) return '';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
};

const DailyDetailModal: React.FC<DailyDetailModalProps> = ({ date, tasks, moods, onClose }) => {
    const [chartMode, setChartMode] = useState<'mood' | 'priority'>('mood');
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    const moodObjects = moods.map(id => MOOD_MAP[id]).filter(Boolean);

    const completedTasksWithMood = useMemo(() => tasks.filter(t => t.completed && t.moodId), [tasks]);

    const moodChartData = useMemo((): PieChartData[] => {
        if (completedTasksWithMood.length === 0) return [];
        const counts = completedTasksWithMood.reduce((acc, task) => {
            if (task.moodId) {
                acc[task.moodId] = (acc[task.moodId] || 0) + 1;
            }
            return acc;
        }, {} as { [key: string]: number });

        return Object.entries(counts).map(([moodId, value]) => {
            const mood = MOOD_MAP[moodId];
            return { id: moodId, label: mood?.title || '未知', value, color: mood?.toColor || '#cccccc' };
        });
    }, [completedTasksWithMood]);

    const priorityChartData = useMemo((): PieChartData[] => {
        if (tasks.length === 0) return [];
        const counts = tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        return Object.entries(counts).map(([priority, value]) => {
            const priorityInfo = PRIORITY_MAP[priority as Priority];
            return { id: priority, label: priorityInfo?.label || '未知', value, color: priorityInfo?.hex || '#cccccc' };
        });
    }, [tasks]);

    const filteredTasks = useMemo(() => {
        if (!selectedFilter) return tasks;
        if (chartMode === 'mood') {
            return tasks.filter(t => t.moodId === selectedFilter);
        } else {
            return tasks.filter(t => t.priority === selectedFilter);
        }
    }, [tasks, selectedFilter, chartMode]);
    
    const currentFilterLabel = useMemo(() => {
        if (!selectedFilter) return '';
        const data = chartMode === 'mood' ? moodChartData : priorityChartData;
        return data.find(d => d.id === selectedFilter)?.label || '';
    }, [selectedFilter, chartMode, moodChartData, priorityChartData]);

    const dataForChart = chartMode === 'mood' ? moodChartData : priorityChartData;

    return (
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
        >
            <div 
                className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fade-in-up max-h-[80vh] flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 id="detail-modal-title" className="text-xl font-bold text-slate-800">{date} 的回顾</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="关闭">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 space-y-6">
                    {moodObjects.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">当日心情</h3>
                            <div className="flex flex-wrap gap-2">
                                {moodObjects.map(mood => (
                                    <span key={mood.id} className={`px-3 py-1 text-sm font-medium text-white rounded-full ${mood.color}`}>{mood.title}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-6">
                        <h3 className="font-semibold text-slate-700 mb-3">任务分析</h3>
                        <div className="flex items-center bg-slate-100 rounded-full p-1 self-start mb-4">
                            <button onClick={() => { setChartMode('mood'); setSelectedFilter(null); }} className={`px-3 py-1 text-sm rounded-full transition-all ${chartMode === 'mood' ? 'bg-white shadow font-semibold' : 'text-slate-500'}`}>按情绪</button>
                            <button onClick={() => { setChartMode('priority'); setSelectedFilter(null); }} className={`px-3 py-1 text-sm rounded-full transition-all ${chartMode === 'priority' ? 'bg-white shadow font-semibold' : 'text-slate-500'}`}>按象限</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <PieChart data={dataForChart} onSliceClick={(id) => setSelectedFilter(id)} />
                            <div className="flex-grow space-y-1 text-sm self-start">
                                {dataForChart.map(item => (
                                    <button key={item.id} onClick={() => setSelectedFilter(item.id)} className="w-full flex items-center gap-2 text-left p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent" disabled={item.value === 0}>
                                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-600 font-medium truncate">{item.label}</span>
                                        <span className="ml-auto text-slate-500 pl-1">{item.value}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-slate-700">当日任务</h3>
                            {selectedFilter && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full">
                                    <span className="truncate max-w-[120px]">筛选: {currentFilterLabel}</span>
                                    <button onClick={() => setSelectedFilter(null)} className="w-4 h-4 rounded-full bg-violet-200 hover:bg-violet-300 flex items-center justify-center flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        {filteredTasks.length > 0 ? (
                            <ul className="space-y-3">
                                {filteredTasks.map(task => {
                                    const taskMood = task.moodId ? MOOD_MAP[task.moodId] : null;
                                    return (
                                        <li key={task.id} className="p-3 bg-slate-50 rounded-lg animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-slate-400'}`}>
                                                    {task.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.text}</p>
                                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                                                        {task.flowDuration && task.flowDuration > 0 && (
                                                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{formatFlowTime(task.flowDuration)}</span>
                                                        )}
                                                        {(task.pauseCount ?? 0) > 0 && (
                                                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm4 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" /></svg>暂停 {task.pauseCount} 次</span>
                                                        )}
                                                        {taskMood && (
                                                            <span className="flex items-center gap-1.5"><div className={`w-2.5 h-2.5 rounded-full ${taskMood.color}`}></div>{taskMood.title}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center text-slate-500 py-6">{selectedFilter ? '该分类下没有任务。' : '这一天没有记录任务。'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyDetailModal;