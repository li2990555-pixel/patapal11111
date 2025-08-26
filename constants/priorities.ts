import { Priority } from '../types';

export const PRIORITY_MAP: { [key in Priority]: { label: string; color: string; hex: string; } } = {
  [Priority.URGENT_IMPORTANT]: { label: '重要紧急', color: 'bg-rose-500', hex: '#f43f5e' },
  [Priority.IMPORTANT_NOT_URGENT]: { label: '重要不紧急', color: 'bg-amber-500', hex: '#f59e0b' },
  [Priority.URGENT_NOT_IMPORTANT]: { label: '不重要紧急', color: 'bg-purple-500', hex: '#a855f7' },
  [Priority.NOT_IMPORTANT_NOT_URGENT]: { label: '不重要不紧急', color: 'bg-sky-500', hex: '#0ea5e9' },
};