import React from 'react';

interface PermissionGuideModalProps {
  onClose: () => void;
}

const PermissionGuideModal: React.FC<PermissionGuideModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <div className="flex gap-6">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-slate-800 mb-2">哎呀，听不到你的声音...</h2>
        <p className="text-slate-500 mb-6">好像是麦克风权限没有打开哦。请按照下面的步骤，在浏览器中为Pata打开麦克风权限吧！</p>
        
        <div className="text-left space-y-3 bg-slate-50 p-4 rounded-lg text-slate-700">
            <p><strong className="font-semibold text-violet-600">第1步:</strong> 在浏览器地址栏的左侧，找到并点击 🔒 <strong className="font-semibold">锁形图标</strong>。</p>
            <p><strong className="font-semibold text-violet-600">第2步:</strong> 在弹出的菜单中，找到 <strong className="font-semibold">“麦克风”</strong> 权限设置。</p>
            <p><strong className="font-semibold text-violet-600">第3步:</strong> 将麦克风权限从“阻止”更改为 <strong className="font-semibold">“允许”</strong>。</p>
            <p><strong className="font-semibold text-violet-600">第4步:</strong> 如果浏览器提示，请 <strong className="font-semibold">刷新页面</strong> 以应用更改。</p>
        </div>

        <p className="text-sm text-slate-400 mt-4">完成后，回到这里再试一次吧！</p>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-violet-500 text-white font-bold rounded-full hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors"
        >
          我知道啦
        </button>
      </div>
    </div>
  );
};

export default PermissionGuideModal;