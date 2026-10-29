export type Background =
  | { kind: 'color'; color: string }
  | { kind: 'image'; uri: string };

export const COLOR_PRESETS = [
  '#F2F2F7',
  '#1C1C1E',
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#EC4899',
  '#78716C',
];

export const DEFAULT_BACKGROUND: Background = { kind: 'color', color: '#1C1C1E' };

export const DURATION_PRESETS_MIN = [5, 15, 25, 45, 60];

// Picks white or near-black text so the timer stays readable on any solid color.
export function textColorFor(bg: Background): string {
  if (bg.kind === 'image') return '#FFFFFF';
  const hex = bg.color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111111' : '#FFFFFF';
}

// Light, card-based palette for the Stats and Settings pages.
export const ui = {
  bg: '#F2F2F7',
  card: '#FFFFFF',
  text: '#111111',
  muted: '#8E8E93',
  separator: '#E5E5EA',
  accent: '#3B82F6',
  success: '#22C55E',
  danger: '#EF4444',
};

export const CHART_COLORS = ['#3B82F6', '#A855F7', '#F97316', '#14B8A6', '#EC4899', '#EAB308'];
