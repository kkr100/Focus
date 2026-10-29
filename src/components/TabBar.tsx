import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ui } from '../theme';

export type Tab = 'focus' | 'stats' | 'settings';

const TABS: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'focus', label: 'Focus', icon: 'hourglass-outline' },
  { key: 'stats', label: 'Stats', icon: 'pie-chart' },
  { key: 'settings', label: 'Settings', icon: 'settings-sharp' },
];

type Props = { current: Tab; onChange: (tab: Tab) => void; dark?: boolean };

export function TabBar({ current, onChange, dark }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, 8) },
        dark ? styles.barDark : styles.barLight,
      ]}
    >
      {TABS.map((t) => {
        const active = t.key === current;
        const color = active ? ui.accent : dark ? 'rgba(255,255,255,0.7)' : ui.muted;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={styles.item}
          >
            <Ionicons name={t.icon} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  barLight: { backgroundColor: '#F9F9FB', borderTopColor: ui.separator },
  barDark: { backgroundColor: 'rgba(0,0,0,0.35)', borderTopColor: 'rgba(255,255,255,0.15)' },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 11, fontWeight: '500' },
});
