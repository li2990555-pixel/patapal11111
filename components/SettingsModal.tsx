import React from 'react';

interface SettingsModalProps {
  onClose: () => void;
  onClearCache: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onClearCache }) => {

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-modal-title" className="text-xl font-bold text-slate-800">设置</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors" aria-label="关闭设置">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Section: Data */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 px-2">数据管理</h3>
            <div className="bg-slate-50 rounded-lg p-2">
               <button
                onClick={onClearCache}
                className="w-full text-left px-3 py-2 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors"
              >
                清除本地缓存
              </button>
            </div>
             <p className="text-xs text-slate-400 mt-2 px-2">
                清除缓存将删除所有本地数据，此操作不可逆。
            </p>
          </div>

          {/* Section: About */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 px-2">关于</h3>
            <div className="bg-slate-50 rounded-lg p-2">
                <div className="flex items-center justify-between px-3 py-1">
                    <span className="font-medium text-slate-700">App 版本</span>
                    <span className="text-slate-500">1.0.0</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;