import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Background, DEFAULT_BACKGROUND } from './theme';

const KEY = 'focus-timer/settings';

export type Settings = {
  background: Background;
  durationMin: number;
  task: string;
};

export const DEFAULT_SETTINGS: Settings = {
  background: DEFAULT_BACKGROUND,
  durationMin: 25,
  task: '',
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const saved = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as Settings;
    // A saved photo can disappear (app reinstall, cleared storage); fall back to the default.
    if (
      Platform.OS !== 'web' &&
      saved.background.kind === 'image' &&
      !new File(saved.background.uri).exists
    ) {
      saved.background = DEFAULT_BACKGROUND;
    }
    return saved;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Not saving settings is not worth interrupting a focus session for.
  }
}

// The picker returns a cache URI the OS may purge, so keep our own copy.
export async function persistBackgroundImage(pickedUri: string): Promise<string> {
  if (Platform.OS === 'web') return pickedUri;
  const dir = new Directory(Paths.document, 'backgrounds');
  dir.create({ idempotent: true, intermediates: true });
  const source = new File(pickedUri);
  const target = new File(dir, `background-${Date.now()}${source.extension || '.jpg'}`);
  await source.copy(target);
  for (const entry of dir.list()) {
    if (entry.uri !== target.uri) entry.delete();
  }
  return target.uri;
}
