import type { HistoryItem } from '../types';

const KEY = 'studytube_v2_history';

export function getHistory(): HistoryItem[] {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(item: HistoryItem): void {
  const history = getHistory().filter((h) => h.videoId !== item.videoId);
  history.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 30)));
}

export function removeFromHistory(id: string): void {
  const history = getHistory().filter((h) => h.id !== id);
  localStorage.setItem(KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(KEY);
}
