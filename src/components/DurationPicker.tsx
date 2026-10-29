import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DURATION_PRESETS_MIN } from '../theme';

type Props = {
  minutes: number;
  onChange: (minutes: number) => void;
  color: string;
};

const MIN = 1;
const MAX = 180;

export function DurationPicker({ minutes, onChange, color }: Props) {
  const step = (delta: number) => onChange(Math.min(MAX, Math.max(MIN, minutes + delta)));

  return (
    <View style={styles.wrap}>
      <View style={styles.stepper}>
        <StepButton label="−5" color={color} onPress={() => step(-5)} />
        <StepButton label="−1" color={color} onPress={() => step(-1)} />
        <Text style={[styles.value, { color }]}>{minutes} min</Text>
        <StepButton label="+1" color={color} onPress={() => step(1)} />
        <StepButton label="+5" color={color} onPress={() => step(5)} />
      </View>
      <View style={styles.presets}>
        {DURATION_PRESETS_MIN.map((m) => {
          const active = m === minutes;
          return (
            <Pressable
              key={m}
              onPress={() => onChange(m)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, { borderColor: color }, active && { backgroundColor: color }]}
            >
              <Text style={[styles.chipText, { color }, active && { color: color === '#FFFFFF' ? '#111111' : '#FFFFFF' }]}>
                {m}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StepButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} minutes`}
      hitSlop={8}
      style={({ pressed }) => [styles.stepBtn, { borderColor: color, opacity: pressed ? 0.5 : 1 }]}
    >
      <Text style={[styles.stepText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 20, fontWeight: '600', minWidth: 84, textAlign: 'center' },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 15, fontWeight: '600' },
  presets: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 15, fontWeight: '600' },
});
