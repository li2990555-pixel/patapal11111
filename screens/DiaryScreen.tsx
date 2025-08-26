import React, { useState, useEffect } from 'react';
import { UserDiaryEntry, Task } from '../types';
import { MOOD_MAP } from '../constants/moods';
import { GoogleGenAI } from '@google/genai';

const DiaryEntryCard: React.FC<{ entry: UserDiaryEntry }> = ({ entry }) => {
    const isPataEntry = entry.author === 'pata';
    const emoji = isPataEntry ? '🐾' : '💭';
    const cardBg = isPataEntry ? 'bg-violet-50' : 'bg-white';
    const authorName = isPataEntry ? 'Pata' : '我';

    return (
      <div className={`${cardBg} p-5 rounded-2xl shadow-md transition-transform transform hover:scale-[1.02] hover:shadow-lg animate-fade-in-up`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <span className="font-bold text-slate-700">{authorName}</span>
          </div>
          <span className="text-sm text-slate-500">{entry.date}</span>
        </div>
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
      </div>
    );
};

interface DiaryScreenProps {
    userDiary: UserDiaryEntry[];
    setUserDiary: React.Dispatch<React.SetStateAction<UserDiaryEntry[]>>;
    tasks: Task[];
    moodHistory: { [date: string]: string[] };
}

const DiaryScreen: React.FC<DiaryScreenProps> = ({
    userDiary,
    setUserDiary,
    tasks,
    moodHistory,
}) => {
    const [activeTab, setActiveTab] = useState<'user' | 'pata'>('user');
    const [newUserEntry, setNewUserEntry] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const userDiaryEntries = userDiary.filter(entry => entry.author !== 'pata');
    const pataDiaryEntries = userDiary.filter(entry => entry.author === 'pata');

    useEffect(() => {
        const generatePataDiaryIfNeeded = async () => {
            if (activeTab === 'pata') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const hasEntryForYesterday = pataDiaryEntries.some(entry => entry.date === yesterdayStr);

                if (hasEntryForYesterday || isGenerating) {
                    return;
                }
                
                const yesterdaysTasks = tasks.filter(t => {
                    const taskDate = new Date(t.id).toISOString().split('T')[0];
                    return taskDate === yesterdayStr && t.completed;
                });
                const yesterdaysMoodIds = moodHistory[yesterdayStr] || [];
                const yesterdaysMoods = yesterdaysMoodIds.map(id => MOOD_MAP[id]?.title).filter(Boolean);
                const yesterdaysUserDiary = userDiary.filter(entry => entry.date === yesterdayStr && entry.author !== 'pata');

                if (yesterdaysTasks.length === 0 && yesterdaysMoods.length === 0 && yesterdaysUserDiary.length === 0) {
                    return;
                }

                setIsGenerating(true);
                try {
                    if (!process.env.API_KEY) {
                        throw new Error("API Key not found for diary generation.");
                    }
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    
                    const completedTasksText = yesterdaysTasks.length > 0
                        ? `完成了这些任务：${yesterdaysTasks.map(t => `“${t.text}”`).join('，')}。`
                        : "好像没有完成什么任务呢。";
                    
                    const moodsText = yesterdaysMoods.length > 0
                        ? `心情是这样的：${yesterdaysMoods.join('，')}。`
                        : "没有记录心情。";
                    
                    const userThoughtsText = yesterdaysUserDiary.length > 0
                        ? `他/她还写下了这些想法：${yesterdaysUserDiary.map(e => `“${e.content}”`).join('；')}。`
                        : "他/她昨天没有留下什么文字。";

                    const prompt = `昨天我的好朋友${completedTasksText} ${moodsText} ${userThoughtsText} 根据这些信息，帮我以昨天的视角写一篇日记吧！`;

                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: prompt,
                        config: {
                            systemInstruction: "你是Pata，一个可爱、治愈系的史莱姆宠物。请你以Pata的第一人称视角，写一篇非常简短（不超过80个字）、温暖、充满关怀的日记，记录下你的好朋友（用户）昨天一天的生活。语气要温柔、体贴，可以带一点点可爱的孩子气。",
                            temperature: 0.8,
                            topP: 0.9,
                        },
                    });
                    
                    const generatedContent = response.text.trim();

                    if (generatedContent) {
                        const newEntry: UserDiaryEntry = {
                            id: Date.now(),
                            date: yesterdayStr,
                            content: generatedContent,
                            author: 'pata',
                        };
                        setUserDiary(prevDiary => 
                            [newEntry, ...prevDiary].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id)
                        );
                    }
                } catch (error) {
                    console.error("Failed to generate diary:", error);
                } finally {
                    setIsGenerating(false);
                }
            }
        };

        generatePataDiaryIfNeeded();
    }, [activeTab, tasks, moodHistory, userDiary, setUserDiary, isGenerating, pataDiaryEntries]);


    const handleSaveUserEntry = () => {
        if (newUserEntry.trim() === '') return;

        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const newEntry: UserDiaryEntry = {
            id: Date.now(),
            date: `${year}-${month}-${day}`,
            content: newUserEntry.trim(),
            author: 'user',
        };

        setUserDiary(prev => 
            [newEntry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.id - a.id)
        );
        setNewUserEntry('');
    };
    
    const renderUserTab = () => (
        <div className="flex flex-col h-full animate-fade-in-up">
            <div className="bg-white p-4 rounded-2xl shadow-md mb-4 flex-shrink-0">
                <textarea
                    value={newUserEntry}
                    onChange={(e) => setNewUserEntry(e.target.value)}
                    placeholder="今天有什么想说的吗？"
                    className="w-full h-24 p-2 bg-slate-100 text-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none transition resize-none"
                    aria-label="写下你的碎碎念"
                />
                <div className="flex justify-end items-center gap-3 mt-3">
                    <button
                        onClick={handleSaveUserEntry}
                        disabled={!newUserEntry.trim()}
                        className="px-5 py-2 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                        保存碎碎念
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {userDiaryEntries.length > 0 ? (
                    userDiaryEntries.map((entry) => (
                        <DiaryEntryCard key={entry.id} entry={entry} />
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-500">还没有任何记录哦，快写下第一条吧！</p>
                    </div>
                )}
            </div>
        </div>
    );
    
    const renderPataTab = () => {
        return (
             <div className="space-y-4 animate-fade-in-up">
                {isGenerating && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Pata 正在回忆昨天发生的事情...</p>
                    </div>
                )}
                
                {!isGenerating && pataDiaryEntries.length > 0 && pataDiaryEntries.map((entry) => (
                    <DiaryEntryCard key={entry.id} entry={entry} />
                ))}

                {!isGenerating && pataDiaryEntries.length === 0 && (
                     <div className="text-center py-10">
                        <p className="text-slate-500">
                            Pata还没有写过日记呢。
                            <br />
                            完成一些任务、记录一些心情，明天再来看看吧！
                        </p>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="p-4 flex flex-col h-full">
            <div className="text-center mt-6 mb-8">
                <h1 className="text-2xl font-bold text-slate-800">心情日记</h1>
                <p className="text-slate-500">记录着我们共同成长的点点滴滴。</p>
            </div>

            <div className="flex justify-center mb-6 space-x-2">
                <button 
                    onClick={() => setActiveTab('user')} 
                    className={`px-6 py-2.5 font-semibold rounded-full transition-colors duration-300 ${activeTab === 'user' ? 'bg-violet-500 text-white shadow-md' : 'bg-slate-200 text-slate-600'}`}
                    aria-pressed={activeTab === 'user'}
                >
                    我的碎碎念
                </button>
                <button 
                    onClick={() => setActiveTab('pata')} 
                    className={`px-6 py-2.5 font-semibold rounded-full transition-colors duration-300 ${activeTab === 'pata' ? 'bg-violet-500 text-white shadow-md' : 'bg-slate-200 text-slate-600'}`}
                    aria-pressed={activeTab === 'pata'}
                >
                    Pata的日记
                </button>
            </div>

            <div className="flex-grow overflow-y-auto pb-4 pr-2">
                {activeTab === 'user' ? renderUserTab() : renderPataTab()}
            </div>
        </div>
    );
};

export default DiaryScreen;
