import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'focus-timer/sessions';

export type FocusSession = {
  id: string;
  startedAt: number;
  endedAt: number;
  focusedMs: number;
  task: string;
  // false when the user stopped early; the focused time still counts.
  completed: boolean;
};

export async function loadSessions(): Promise<FocusSession[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FocusSession[]) : [];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: FocusSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
  } catch {
    // Losing one stats write is not worth interrupting the user for.
  }
}

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

// Weeks start on Monday.
export function startOfWeek(t: number): number {
  const d = new Date(startOfDay(t));
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return d.getTime();
}

export function startOfMonth(t: number): number {
  const d = new Date(startOfDay(t));
  d.setDate(1);
  return d.getTime();
}

export function addDays(t: number, days: number): number {
  const d = new Date(t);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export type Totals = { sessions: number; focusedMs: number };

export function totalsBetween(sessions: FocusSession[], from: number, to: number): Totals {
  let count = 0;
  let ms = 0;
  for (const s of sessions) {
    if (s.endedAt < from || s.endedAt >= to) continue;
    if (s.completed) count++;
    ms += s.focusedMs;
  }
  return { sessions: count, focusedMs: ms };
}

export type DayBucket = { day: number; label: string } & Totals;

export function dailyBuckets(sessions: FocusSession[], from: number, days: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(from, i);
    const totals = totalsBetween(sessions, day, addDays(day, 1));
    const date = new Date(day);
    const label =
      days <= 7
        ? date.toLocaleDateString([], { weekday: 'short' })
        : String(date.getDate());
    buckets.push({ day, label, ...totals });
  }
  return buckets;
}

export type TaskTotal = { task: string } & Totals;

export function taskTotals(sessions: FocusSession[], from: number, to: number): TaskTotal[] {
  const map = new Map<string, TaskTotal>();
  for (const s of sessions) {
    if (s.endedAt < from || s.endedAt >= to) continue;
    const task = s.task.trim() || 'No task';
    const entry = map.get(task) ?? { task, sessions: 0, focusedMs: 0 };
    if (s.completed) entry.sessions++;
    entry.focusedMs += s.focusedMs;
    map.set(task, entry);
  }
  return [...map.values()].sort((a, b) => b.focusedMs - a.focusedMs);
}

export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

