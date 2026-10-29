import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundPicker } from '../components/BackgroundPicker';
import { Settings } from '../storage';
import { ui } from '../theme';

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  sessionCount: number;
  onResetStats: () => void;
};

export function SettingsScreen({ settings, onChange, sessionCount, onResetStats }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { background } = settings;

  const confirmReset = () =>
    Alert.alert('Reset statistics?', 'This deletes all recorded focus sessions. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: onResetStats },
    ]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Section title="Timer">
          <Row icon="timer-outline" label="Focus length">
            <Stepper
              value={settings.durationMin}
              suffix="min"
              min={1}
              max={180}
              step={5}
              onChange={(durationMin) => onChange({ durationMin })}
            />
          </Row>
          <Row icon="flag-outline" label="Daily goal" last>
            <Stepper
              value={settings.dailyGoal}
              suffix={settings.dailyGoal === 1 ? 'session' : 'sessions'}
              min={1}
              max={20}
              step={1}
              onChange={(dailyGoal) => onChange({ dailyGoal })}
            />
          </Row>
        </Section>

        <Section title="Appearance">
          <Row icon="image-outline" label="Background" onPress={() => setPickerOpen(true)} last>
            {background.kind === 'image' ? (
              <Image source={{ uri: background.uri }} style={styles.swatch} />
            ) : (
              <View style={[styles.swatch, { backgroundColor: background.color }]} />
            )}
            <Ionicons name="chevron-forward" size={18} color={ui.muted} />
          </Row>
        </Section>

        <Section title="While focusing">
          <Row icon="sunny-outline" label="Keep screen on">
            <Switch value={settings.keepAwake} onValueChange={(keepAwake) => onChange({ keepAwake })} />
          </Row>
          <Row icon="pulse-outline" label="Vibrate when done" last>
            <Switch value={settings.haptics} onValueChange={(haptics) => onChange({ haptics })} />
          </Row>
        </Section>

        <Section title="Data">
          <Row icon="trash-outline" label="Reset statistics" danger onPress={confirmReset} last>
            <Text style={styles.detail}>
              {sessionCount} {sessionCount === 1 ? 'session' : 'sessions'}
            </Text>
          </Row>
        </Section>
      </ScrollView>

      <BackgroundPicker
        visible={pickerOpen}
        current={background}
        onSelect={(bg) => onChange({ background: bg })}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={styles.section}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  children,
  onPress,
  danger,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children?: ReactNode;
  onPress?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  const color = danger ? ui.danger : ui.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && onPress && styles.pressed]}
    >
      <Ionicons name={icon} size={22} color={danger ? ui.danger : ui.accent} />
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </Pressable>
  );
}

function Stepper({
  value,
  suffix,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  suffix: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <View style={styles.stepper}>
      <StepButton icon="remove" disabled={value <= min} onPress={() => set(value - step)} />
      <Text style={styles.stepValue}>
        {value} {suffix}
      </Text>
      <StepButton icon="add" disabled={value >= max} onPress={() => set(value + step)} />
    </View>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'add' | 'remove';
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={icon === 'add' ? 'Increase' : 'Decrease'}
      style={[styles.stepBtn, disabled && { opacity: 0.35 }]}
    >
      <Ionicons name={icon} size={18} color={ui.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.bg },
  content: { padding: 16, gap: 24, paddingBottom: 32 },
  title: { fontSize: 34, fontWeight: '800', color: ui.text, marginTop: 8 },
  sectionTitle: { fontSize: 13, color: ui.muted, marginLeft: 16, marginBottom: 6 },
  section: { backgroundColor: ui.card, borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    paddingVertical: 8,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ui.separator },
  pressed: { backgroundColor: '#E5E5EA' },
  rowLabel: { flex: 1, fontSize: 17 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detail: { fontSize: 15, color: ui.muted },
  swatch: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: ui.separator },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 15, color: ui.text, minWidth: 86, textAlign: 'center', fontVariant: ['tabular-nums'] },
});
