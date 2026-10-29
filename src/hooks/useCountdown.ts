import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export type CountdownStatus = 'idle' | 'running' | 'paused' | 'finished';

// Tracks an end timestamp instead of decrementing a counter, so the time stays
// correct when the app is backgrounded or JS timers are throttled.
export function useCountdown(durationMs: number, onFinish?: () => void) {
  const [status, setStatus] = useState<CountdownStatus>('idle');
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const endAt = useRef<number | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (status === 'idle') setRemainingMs(durationMs);
  }, [durationMs, status]);

  const tick = useCallback(() => {
    if (endAt.current === null) return;
    const left = Math.max(0, endAt.current - Date.now());
    setRemainingMs(left);
    if (left === 0) {
      endAt.current = null;
      setStatus('finished');
      onFinishRef.current?.();
    }
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(tick, 250);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [status, tick]);

  const start = useCallback(() => {
    const from = status === 'paused' ? remainingMs : durationMs;
    endAt.current = Date.now() + from;
    setRemainingMs(from);
    setStatus('running');
  }, [status, remainingMs, durationMs]);

  const pause = useCallback(() => {
    if (endAt.current !== null) setRemainingMs(Math.max(0, endAt.current - Date.now()));
    endAt.current = null;
    setStatus('paused');
  }, []);

  const reset = useCallback(() => {
    endAt.current = null;
    setRemainingMs(durationMs);
    setStatus('idle');
  }, [durationMs]);

  return { status, remainingMs, start, pause, reset };
}

export function formatClock(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function formatEndTime(ms: number): string {
  return new Date(Date.now() + ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
