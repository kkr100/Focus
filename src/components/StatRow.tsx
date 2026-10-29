import { StyleSheet, Text, View } from 'react-native';
import { ui } from '../theme';

type Props = { items: { label: string; value: string }[] };

export function StatRow({ items }: Props) {
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.cell}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  cell: { gap: 4 },
  label: { fontSize: 15, color: ui.muted },
  value: { fontSize: 24, fontWeight: '700', color: ui.text, fontVariant: ['tabular-nums'] },
});
