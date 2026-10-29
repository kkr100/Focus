import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ui } from '../theme';

type Props = { value: number; goal: number; size?: number };

export function ProgressRing({ value, goal, size = 180 }: Props) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = goal > 0 ? Math.min(1, value / goal) : 0;
  const reached = value >= goal;

  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${value} of ${goal} sessions`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={ui.separator} strokeWidth={stroke} fill="#22C55E14" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ui.success}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.goal}>{reached ? 'Goal reached!' : `of ${goal}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 52, fontWeight: '600', color: ui.success, fontVariant: ['tabular-nums'] },
  goal: { fontSize: 14, color: ui.muted },
});
