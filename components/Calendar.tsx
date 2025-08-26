
import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, onClose }) => {
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };
    
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    initialDate.setMinutes(initialDate.getMinutes() + initialDate.getTimezoneOffset());


    const [currentDate, setCurrentDate] = useState(initialDate);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); 
    const daysInMonth = endOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateString = formatDate(dayDate);
        const isSelected = dateString === selectedDate;
        const isToday = formatDate(new Date()) === dateString;

        days.push(
            <div key={i} className="flex justify-center items-center">
                 <button
                    onClick={() => {
                      onSelectDate(dateString);
                      onClose();
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                            ? 'bg-violet-500 text-white font-bold'
                            : isToday
                            ? 'bg-violet-100 text-violet-600'
                            : 'text-slate-700 hover:bg-slate-100'
                    }`}
                 >
                    {i}
                 </button>
            </div>
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="font-bold text-lg text-slate-800">
                        {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                    </div>
                    <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-500 font-medium mb-2">
                    {weekDays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                    {days}
                </div>
            </div>
        </div>
    );
};

export default Calendar;