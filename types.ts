export enum Screen {
  LOGIN = 'LOGIN',
  DAILY_RECORD = 'DAILY_RECORD',
  MOOD_RECORD = 'MOOD_RECORD',
  PET_NURTURING = 'PET_NURTURING',
  DIARY = 'DIARY',
  COMPANION = 'COMPANION',
}

export enum Priority {
  URGENT_IMPORTANT = 'URGENT_IMPORTANT', // 重要紧急
  IMPORTANT_NOT_URGENT = 'IMPORTANT_NOT_URGENT', // 重要不紧急
  URGENT_NOT_IMPORTANT = 'URGENT_NOT_IMPORTANT', // 不重要紧急
  NOT_IMPORTANT_NOT_URGENT = 'NOT_IMPORTANT_NOT_URGENT', // 不重要不紧急
}

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  deadline?: string;
  flowDuration?: number; // in seconds
  moodId?: string;
  pauseCount?: number;
}

export interface Mood {
  id: string;
  title: string;
  color: string;
  gradient: string;
  fromColor: string;
  toColor: string;
}

export interface UserDiaryEntry {
  id: number;
  date: string;
  content: string;
  author?: 'user' | 'pata';
}

export interface ChatMessage {
  from: 'user' | 'pata';
  message: string;
}