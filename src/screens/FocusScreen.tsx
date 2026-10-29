import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundPicker } from '../components/BackgroundPicker';
import { DurationPicker } from '../components/DurationPicker';
import { formatClock, formatEndTime, useCountdown } from '../hooks/useCountdown';
import { FocusSession } from '../sessions';
import { Settings } from '../storage';
import { textColorFor } from '../theme';

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onSessionEnd: (session: FocusSession) => void;
  // The tab bar, drawn inside this screen so the background shows behind it.
  // Hidden while the timer runs to keep the screen distraction free.
  renderTabBar: (dark: boolean) => ReactNode;
  visible: boolean;
};

// Stopping early still records the time focused, but only past this threshold.
const MIN_RECORDED_MS = 60_000;

function KeepAwake() {
  useKeepAwake();
  return null;
}

export function FocusScreen({ settings, onChange, onSessionEnd, renderTabBar, visible }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const durationMs = settings.durationMin * 60_000;
  const startedAt = useRef<number | null>(null);
  // Captured at start, since the length can be changed in Settings mid-session.
  const plannedMs = useRef(durationMs);

  const record = (focusedMs: number, completed: boolean) => {
    const start = startedAt.current;
    startedAt.current = null;
    if (start === null || (!completed && focusedMs < MIN_RECORDED_MS)) return;
    const now = Date.now();
    onSessionEnd({
      id: `${start}`,
      startedAt: start,
      endedAt: now,
      focusedMs,
      task: settings.task,
      completed,
    });
  };

  const { status, remainingMs, start, pause, reset } = useCountdown(durationMs, () => {
    record(plannedMs.current, true);
    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  });

  const begin = () => {
    if (status === 'idle') {
      startedAt.current = Date.now();
      plannedMs.current = durationMs;
    }
    start();
  };

  const stop = () => {
    record(plannedMs.current - remainingMs, false);
    reset();
  };

  const { background } = settings;
  const fg = textColorFor(background);
  const dark = fg === '#FFFFFF';
  const isIdle = status === 'idle';

  const headline = {
    idle: 'Ready to focus?',
    running: settings.task || 'Focusing',
    paused: 'Paused',
    finished: 'Done. Nice work!',
  }[status];

  const content = (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {status === 'running' && settings.keepAwake && <KeepAwake />}
        {visible && <StatusBar style={dark ? 'light' : 'dark'} />}

        <View style={styles.topBar}>
          <Pressable
            onPress={() => setPickerOpen(true)}
            accessibilityRole="button"
            hitSlop={12}
            style={[styles.pill, { borderColor: fg }]}
          >
            <Text style={[styles.pillText, { color: fg }]}>Background</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          {isIdle ? (
            <TextInput
              value={settings.task}
              onChangeText={(task) => onChange({ task })}
              placeholder="What are you focusing on?"
              placeholderTextColor={fg + '99'}
              style={[styles.taskInput, { color: fg, borderBottomColor: fg + '55' }]}
              returnKeyType="done"
              maxLength={60}
            />
          ) : null}

          <Text
            style={[styles.clock, { color: fg }]}
            adjustsFontSizeToFit
            numberOfLines={1}
            accessibilityRole="timer"
            accessibilityLabel={`${formatClock(remainingMs)} remaining`}
          >
            {formatClock(remainingMs)}
          </Text>

          <Text style={[styles.headline, { color: fg }]}>{headline}</Text>

          {isIdle ? (
            <DurationPicker
              minutes={settings.durationMin}
              onChange={(durationMin) => onChange({ durationMin })}
              color={fg}
            />
          ) : null}
        </View>

        <View style={styles.bottom}>
          {status === 'running' ? (
            <MainButton label="Pause" fg={fg} onPress={pause} />
          ) : status === 'finished' ? (
            <MainButton label="Start again" fg={fg} onPress={reset} />
          ) : (
            <MainButton label={status === 'paused' ? 'Resume' : 'Start focus'} fg={fg} onPress={begin} />
          )}

          {status === 'paused' || status === 'running' ? (
            <Pressable onPress={stop} hitSlop={12} accessibilityRole="button">
              <Text style={[styles.secondary, { color: fg }]}>
                {status === 'running' ? `Ends at ${formatEndTime(remainingMs)} · ` : ''}Stop
              </Text>
            </Pressable>
          ) : (
            <Text style={[styles.secondary, { color: fg }]}>
              {isIdle ? `Ends at ${formatEndTime(remainingMs)}` : ' '}
            </Text>
          )}
        </View>
      </SafeAreaView>

      {status === 'running' ? <View style={styles.tabSpacer} /> : renderTabBar(dark)}

      <BackgroundPicker
        visible={pickerOpen}
        current={background}
        onSelect={(bg) => onChange({ background: bg })}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );

  if (background.kind === 'image') {
    return (
      <ImageBackground source={{ uri: background.uri }} style={styles.fill} resizeMode="cover">
        {/* Dims the photo so white text stays readable on bright images. */}
        <View style={[styles.fill, styles.scrim]}>{content}</View>
      </ImageBackground>
    );
  }
  return <View style={[styles.fill, { backgroundColor: background.color }]}>{content}</View>;
}

function MainButton({ label, fg, onPress }: { label: string; fg: string; onPress: () => void }) {
  const bgIsLight = fg !== '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.mainButton, { backgroundColor: fg, opacity: pressed ? 0.8 : 1 }]}
    >
      <Text style={[styles.mainButtonText, { color: bgIsLight ? '#FFFFFF' : '#111111' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { backgroundColor: 'rgba(0,0,0,0.35)' },
  safe: { flex: 1, paddingHorizontal: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 8 },
  pill: { borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  pillText: { fontSize: 14, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  taskInput: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
    minWidth: 260,
  },
  clock: {
    fontSize: 110,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  headline: { fontSize: 22, fontWeight: '600', opacity: 0.85, textAlign: 'center' },
  bottom: { alignItems: 'center', gap: 14, paddingBottom: 24 },
  mainButton: {
    width: '80%',
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
  },
  mainButtonText: { fontSize: 20, fontWeight: '700' },
  secondary: { fontSize: 15, opacity: 0.75 },
  tabSpacer: { height: 34 },
});
