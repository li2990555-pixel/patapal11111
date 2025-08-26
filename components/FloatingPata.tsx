
import React, { useState, useEffect } from 'react';
import PataSlime from './PataSlime';

const messages = [
  "今天也要加油哦！",
  "有什么需要帮忙的吗？",
  "记得要多喝水！",
  "休息一下吧，别太累了。",
  "你做得很好！",
  "我在这里陪着你。",
];

interface FloatingPataProps {
  pataBackground: string | null;
  message: string | null;
  setMessage: (message: string | null) => void;
}

const FloatingPata: React.FC<FloatingPataProps> = ({ pataBackground, message, setMessage }) => {
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [isPataAnimating, setIsPataAnimating] = useState(false);

  // Show a message when the component mounts if no message is already set
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      if (message === null) {
        setMessage("你好！准备好开始新的一天了吗？");
      }
    }, 1500);
    return () => clearTimeout(initialTimer);
  }, []); // Run only once

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (message) {
      setIsBubbleVisible(true);
      timer = setTimeout(() => {
        setIsBubbleVisible(false);
        // We don't clear the message here to avoid re-triggering effects
        // The parent component is responsible for the message state
      }, 4000); // Hide after 4 seconds
    }
    return () => clearTimeout(timer);
  }, [message]); // Depend on the message prop
  
  const handleClick = () => {
    if (isPataAnimating) return;
    
    // Show a new random message
    let newMessage = messages[Math.floor(Math.random() * messages.length)];
    // Avoid showing the same message twice in a row
    while (newMessage === message) {
        newMessage = messages[Math.floor(Math.random() * messages.length)];
    }
    setMessage(newMessage);

    // Add a little jump animation on click
    setIsPataAnimating(true);
    setTimeout(() => setIsPataAnimating(false), 500);
  };


  return (
    <div className="fixed bottom-24 right-4 z-50 animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="relative">
            {isBubbleVisible && message && (
                <div 
                    className="absolute bottom-full right-0 mb-3 w-max max-w-[220px] px-4 py-2 bg-white text-slate-700 rounded-xl shadow-lg text-sm transition-all duration-300 animate-fade-in-up origin-bottom-right"
                    // Adding key makes it re-animate on message change
                    key={message}
                >
                    <p>{message}</p>
                    {/* Speech bubble tail */}
                    <div className="absolute right-[16px] -bottom-[8px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white"></div>
                </div>
            )}
            <button 
                onClick={handleClick} 
                className={`transition-transform duration-500 ease-out transform-gpu ${isPataAnimating ? '-translate-y-3 scale-110' : 'translate-y-0 scale-100'}`}
                aria-label="和Pata互动"
            >
                <PataSlime size="sm" background={pataBackground} />
            </button>
        </div>
    </div>
  );
};

export default FloatingPata;