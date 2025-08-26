
import React, { useState } from 'react';
import PataSlime from './PataSlime';

interface InfoTooltipModalProps {
  type: 'vitality' | 'lightSpot' | 'imprint';
  onClose: (dontRemind: boolean) => void;
}

const TOOLTIP_CONTENT = {
  vitality: {
    title: '什么是“活力”？',
    description: '“活力”代表着你与Pata的连接紧密程度。坚持每日登录可以提升活力值。点击这里可以打开“时光日历”，在日历上选择有记录的日期，就能回顾当天的心情和任务。记得常来看看我哦！',
  },
  lightSpot: {
    title: '什么是“光点”？',
    description: '“光点”是你内心世界的光芒。每当你写下一篇“碎碎念”，记录下自己的想法和感受，光点就会增加。它是你向内探索、自我关怀的见证。',
  },
  imprint: {
    title: '什么是“心迹”？',
    description: '“心迹”是你专注和努力的痕迹。每完成一次“心流”专注，你都会留下深刻的心迹。它记录了你为目标奋斗的每一分钟，是成长的最佳证明。',
  },
};

const InfoTooltipModal: React.FC<InfoTooltipModalProps> = ({ type, onClose }) => {
  const [dontRemind, setDontRemind] = useState(false);
  const content = TOOLTIP_CONTENT[type];

  const handleClose = () => {
    onClose(dontRemind);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <PataSlime size="sm" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-2">{content.title}</h2>
        <p className="text-slate-500 mb-6">{content.description}</p>
        
        <div className="flex items-center justify-center mb-6">
          <input
            type="checkbox"
            id="dont-remind"
            checked={dontRemind}
            onChange={(e) => setDontRemind(e.target.checked)}
            className="h-4 w-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500"
          />
          <label htmlFor="dont-remind" className="ml-2 text-sm text-slate-600">不再提醒</label>
        </div>

        <button
          onClick={handleClose}
          className="w-full mt-2 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-transform transform hover:scale-105"
        >
          我知道啦
        </button>
      </div>
    </div>
  );
};

export default InfoTooltipModal;