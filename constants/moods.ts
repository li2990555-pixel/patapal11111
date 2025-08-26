import { Mood } from '../types';

export const MOODS: Mood[] = [
  { id: 'joy', title: '喜悦', color: 'bg-yellow-400', gradient: 'bg-gradient-to-br from-yellow-300 to-yellow-400', fromColor: '#fde047', toColor: '#facc15' },
  { id: 'acceptance', title: '接受', color: 'bg-green-400', gradient: 'bg-gradient-to-br from-green-300 to-green-400', fromColor: '#86efac', toColor: '#4ade80' },
  { id: 'fear', title: '恐惧', color: 'bg-emerald-600', gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600', fromColor: '#10b981', toColor: '#059669' },
  { id: 'surprise', title: '惊讶', color: 'bg-sky-500', gradient: 'bg-gradient-to-br from-sky-400 to-sky-500', fromColor: '#38bdf8', toColor: '#0ea5e9' },
  { id: 'sadness', title: '悲伤', color: 'bg-indigo-500', gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-500', fromColor: '#818cf8', toColor: '#6366f1' },
  { id: 'disgust', title: '厌恶', color: 'bg-purple-600', gradient: 'bg-gradient-to-br from-purple-500 to-purple-600', fromColor: '#a855f7', toColor: '#9333ea' },
  { id: 'anger', title: '愤怒', color: 'bg-rose-500', gradient: 'bg-gradient-to-br from-rose-400 to-rose-500', fromColor: '#fb7185', toColor: '#f43f5e' },
  { id: 'anticipation', title: '期待', color: 'bg-orange-500', gradient: 'bg-gradient-to-br from-orange-400 to-orange-500', fromColor: '#fb923c', toColor: '#f97316' },
];

export const MOOD_MAP: { [key: string]: Mood } = MOODS.reduce((acc, mood) => {
  acc[mood.id] = mood;
  return acc;
}, {} as { [key: string]: Mood });