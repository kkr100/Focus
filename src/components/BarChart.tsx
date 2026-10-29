import { StyleSheet, Text, View } from 'react-native';
import { ui } from '../theme';

type Props = {
  bars: { key: string; label: string; value: number; highlight?: boolean }[];
  height?: number;
};

export function BarChart({ bars, height = 150 }: Props) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  // Only label a subset of bars when there are many, so labels don't collide.
  const labelEvery = bars.length > 10 ? Math.ceil(bars.length / 7) : 1;

  return (
    <View>
      <View style={[styles.plot, { height }]}>
        {bars.map((b) => (
          <View key={b.key} style={styles.column}>
            <View
              style={[
                styles.bar,
                {
                  height: b.value > 0 ? Math.max(4, (b.value / max) * height) : 2,
                  backgroundColor: b.value > 0 ? ui.accent : ui.separator,
                  opacity: b.highlight === false ? 0.45 : 1,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {bars.map((b, i) => (
          <Text key={b.key} style={styles.label} numberOfLines={1}>
            {i % labelEvery === 0 ? b.label : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plot: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  column: { flex: 1, justifyContent: 'flex-end' },
  bar: { borderTopLeftRadius: 6, borderTopRightRadius: 6, width: '100%' },
  labels: { flexDirection: 'row', gap: 4, marginTop: 6 },
  label: { flex: 1, textAlign: 'center', fontSize: 11, color: ui.muted },
});
