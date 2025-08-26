
import React from 'react';
import { Screen } from '../types';
import HomeIcon from './icons/HomeIcon';
import PetIcon from './icons/PetIcon';
import BookIcon from './icons/BookIcon';
import SmileIcon from './icons/SmileIcon';

interface BottomNavBarProps {
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-20 transition-colors duration-200 ${
      isActive ? 'text-violet-500' : 'text-slate-400 hover:text-violet-500'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, setCurrentScreen }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-t-2xl">
      <nav className="flex justify-around items-center h-16">
        <NavItem
          label="日常"
          icon={<HomeIcon />}
          isActive={currentScreen === Screen.DAILY_RECORD}
          onClick={() => setCurrentScreen(Screen.DAILY_RECORD)}
        />
        <NavItem
          label="日记"
          icon={<BookIcon />}
          isActive={currentScreen === Screen.DIARY}
          onClick={() => setCurrentScreen(Screen.DIARY)}
        />
        <NavItem
          label="陪伴"
          icon={<SmileIcon />}
          isActive={currentScreen === Screen.COMPANION}
          onClick={() => setCurrentScreen(Screen.COMPANION)}
        />
        <NavItem
          label="成长"
          icon={<PetIcon />}
          isActive={currentScreen === Screen.PET_NURTURING}
          onClick={() => setCurrentScreen(Screen.PET_NURTURING)}
        />
      </nav>
    </div>
  );
};

export default BottomNavBar;