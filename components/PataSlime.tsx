
import React from 'react';

interface PataSlimeProps {
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
  background?: string | null;
  imprint?: number; // 0-100
}

const PataSlime: React.FC<PataSlimeProps> = ({ size = 'md', background, imprint = 50 }) => {
  const sizeClasses = {
    xxs: 'w-5 h-5',
    xs: 'w-8 h-8',
    sm: 'w-20 h-20',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  const showFeatures = size !== 'xs' && size !== 'xxs';
  const neutralStyle = 'bg-white/40 backdrop-blur-sm border border-white/60';

  // A more robust check for a valid background gradient string to prevent rendering issues.
  const isValidBackground = typeof background === 'string' && background.startsWith('linear-gradient');

  // Default duration is 8s. Map imprint (0-100) to a duration (e.g., 12s - 4s).
  // imprint 0 -> 12s (slow), imprint 50 -> 8s (default), imprint 100 -> 4s (fast)
  const animationDuration = 12 - (imprint / 100) * 8;

  return (
    <div
      className={`relative rounded-full ${sizeClasses[size]} animate-blob`}
      style={{
        background: isValidBackground ? background : 'transparent',
        animationDuration: `${animationDuration}s`,
      }}
    >
      <div
        className={`absolute inset-0 rounded-full ${
          !isValidBackground ? neutralStyle : ''
        }`}
      ></div>
      {showFeatures && (
        <div className="absolute inset-0">
          {/* Blushes */}
          <div 
            className="absolute w-1/4 h-1/6 bg-rose-300/30 rounded-full blur-lg"
            style={{ top: '55%', left: '20%', transform: 'translateY(-50%)' }}
          ></div>
          <div 
            className="absolute w-1/4 h-1/6 bg-rose-300/30 rounded-full blur-lg"
            style={{ top: '55%', right: '20%', transform: 'translateY(-50%)' }}
          ></div>
          
          {/* Eyes */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-8" style={{ transform: 'translateY(-10%)' }}>
              <div className="w-5 h-6 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
              </div>
              <div className="w-5 h-6 bg-white rounded-full flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PataSlime;