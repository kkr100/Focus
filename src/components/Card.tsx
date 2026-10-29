import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ui } from '../theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  right?: ReactNode;
  children: ReactNode;
};

export function Card({ icon, title, right, children }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={ui.accent} />
        <Text style={styles.title}>{title}</Text>
        {right}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ui.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ui.separator,
  },
  title: { flex: 1, fontSize: 18, fontWeight: '600', color: ui.accent },
  body: { paddingTop: 14 },
});
