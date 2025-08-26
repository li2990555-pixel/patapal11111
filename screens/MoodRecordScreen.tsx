
import React, { useState } from 'react';
import PataSlime from '../components/PataSlime';
import { Mood } from '../types';
import { MOODS } from '../constants/moods';

const MoodCard: React.FC<{ mood: Mood; isSelected: boolean; onClick: () => void; }> = ({ mood, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 bg-white rounded-2xl shadow-md text-center space-y-2 transition-all duration-200 transform hover:-translate-y-1 flex flex-col items-center justify-center ${
      isSelected ? 'ring-4 ring-violet-400 scale-105' : 'hover:shadow-lg'
    }`}
  >
    <PataSlime size="sm" background={`linear-gradient(to bottom right, ${mood.fromColor}, ${mood.toColor})`} />
    <div className="font-bold text-slate-800 mt-3">{mood.title}</div>
  </button>
);

interface MoodRecordScreenProps {
  completedTask: { id: number; text: string } | null;
  onMoodSaved: (moodId: string) => void;
  pataBackground: string | null;
}

const MoodRecordScreen: React.FC<MoodRecordScreenProps> = ({ completedTask, onMoodSaved, pataBackground }) => {
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMoodId(mood.id);
    // Short delay to show selection feedback before navigating away
    setTimeout(() => {
      onMoodSaved(mood.id);
    }, 300);
  };

  const title = completedTask
    ? `完成了“${completedTask.text}”`
    : '你现在感觉怎么样？';
  const subtitle = completedTask
    ? '感觉很棒吧！记录一下此刻的心情~'
    : '你的感受都是正常的。告诉Pata吧。';

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="text-center my-6">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-slate-500 mt-1">{subtitle}</p>
      </div>

      <div className="mb-8">
        <PataSlime size="md" background={pataBackground} />
      </div>
      
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8">
        {MOODS.map(mood => (
          <MoodCard 
            key={mood.id} 
            mood={mood} 
            isSelected={selectedMoodId === mood.id}
            onClick={() => handleMoodSelect(mood)}
          />
        ))}
      </div>
    </div>
  );
};

export default MoodRecordScreen;