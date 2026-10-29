import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from '../components/BarChart';
import { Card } from '../components/Card';
import { ProgressRing } from '../components/ProgressRing';
import { Segmented } from '../components/Segmented';
import { StatRow } from '../components/StatRow';
import {
  FocusSession,
  addDays,
  dailyBuckets,
  formatDuration,
  startOfDay,
  startOfMonth,
  startOfWeek,
  taskTotals,
  totalsBetween,
} from '../sessions';
import { CHART_COLORS, ui } from '../theme';

type Range = 'week' | 'last10' | 'month';

type Props = { sessions: FocusSession[]; dailyGoal: number };

export function StatsScreen({ sessions, dailyGoal }: Props) {
  const today = startOfDay(Date.now());
  const [selectedDay, setSelectedDay] = useState(today);
  const [range, setRange] = useState<Range>('week');

  const weekStart = startOfWeek(selectedDay);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const day = totalsBetween(sessions, selectedDay, addDays(selectedDay, 1));
  const week = totalsBetween(sessions, weekStart, addDays(weekStart, 7));
  const monthStart = startOfMonth(selectedDay);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  const month = totalsBetween(sessions, monthStart, monthEnd.getTime());

  const activity = (() => {
    let from: number;
    let days: number;
    if (range === 'week') {
      from = weekStart;
      days = 7;
    } else if (range === 'last10') {
      from = addDays(selectedDay, -9);
      days = 10;
    } else {
      from = monthStart;
      days = Math.round((monthEnd.getTime() - monthStart) / 86_400_000);
    }
    const buckets = dailyBuckets(sessions, from, days);
    const to = addDays(from, days);
    return { buckets, from, to, totals: totalsBetween(sessions, from, to) };
  })();

  const tasks = taskTotals(sessions, activity.from, activity.to).slice(0, 6);
  const maxTaskMs = Math.max(1, ...tasks.map((t) => t.focusedMs));
  const rangeLabel = { week: 'This week', last10: 'Last 10 days', month: 'This month' }[range];
  const isToday = selectedDay === today;
  const dayLabel = isToday ? 'Today' : 'Day';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {isToday
              ? 'Today'
              : new Date(selectedDay).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
          </Text>
          <View style={styles.weekNav}>
            <NavButton icon="chevron-back" onPress={() => setSelectedDay(addDays(selectedDay, -7))} />
            <NavButton
              icon="chevron-forward"
              disabled={addDays(weekStart, 7) > today}
              onPress={() => setSelectedDay(Math.min(today, addDays(selectedDay, 7)))}
            />
          </View>
        </View>

        <View style={styles.strip}>
          {weekDays.map((d) => {
            const date = new Date(d);
            const selected = d === selectedDay;
            const future = d > today;
            return (
              <Pressable
                key={d}
                disabled={future}
                onPress={() => setSelectedDay(d)}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: future }}
                style={styles.dayCell}
              >
                <Text style={[styles.dayName, future && styles.future]}>
                  {date.toLocaleDateString([], { weekday: 'short' })}
                </Text>
                <View style={[styles.dayNumWrap, selected && styles.daySelected]}>
                  <Text style={[styles.dayNum, future && styles.future, selected && styles.dayNumSelected]}>
                    {date.getDate()}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Card icon="bar-chart" title="Daily Goal">
          <View style={styles.ringWrap}>
            <ProgressRing value={day.sessions} goal={dailyGoal} />
          </View>
        </Card>

        <Card icon="hourglass-outline" title="Sessions">
          <StatRow
            items={[
              { label: dayLabel, value: String(day.sessions) },
              { label: 'This Week', value: String(week.sessions) },
              { label: 'This Month', value: String(month.sessions) },
            ]}
          />
        </Card>

        <Card icon="timer-outline" title="Focus Time">
          <StatRow
            items={[
              { label: dayLabel, value: formatDuration(day.focusedMs) },
              { label: 'This Week', value: formatDuration(week.focusedMs) },
              { label: 'This Month', value: formatDuration(month.focusedMs) },
            ]}
          />
        </Card>

        <Card icon="stats-chart" title="Session Activity">
          <Segmented<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'last10', label: 'Last 10 Days' },
              { value: 'month', label: 'This Month' },
            ]}
          />
          <Text style={styles.rangeLabel}>{rangeLabel.toUpperCase()}</Text>
          <Text style={styles.rangeSummary}>
            <Text style={styles.bold}>{activity.totals.sessions}</Text> focus sessions /{' '}
            <Text style={styles.bold}>{formatDuration(activity.totals.focusedMs)}</Text>
          </Text>
          <View style={styles.chart}>
            <BarChart
              bars={activity.buckets.map((b) => ({
                key: String(b.day),
                label: b.label,
                value: Math.round(b.focusedMs / 60_000),
                highlight: b.day <= today,
              }))}
            />
          </View>
          <Text style={styles.caption}>Minutes focused per day</Text>
        </Card>

        <Card icon="pie-chart" title="Task Activity">
          {tasks.length === 0 ? (
            <Text style={styles.empty}>
              Finish a focus session with a task name to see where your time goes.
            </Text>
          ) : (
            <View style={styles.tasks}>
              {tasks.map((t, i) => (
                <View key={t.task} style={styles.taskRow}>
                  <View style={styles.taskText}>
                    <Text style={styles.taskName} numberOfLines={1}>
                      {t.task}
                    </Text>
                    <Text style={styles.taskMeta}>
                      {t.sessions} focus {t.sessions === 1 ? 'session' : 'sessions'} / {formatDuration(t.focusedMs)}
                    </Text>
                    <View style={styles.taskTrack}>
                      <View
                        style={[
                          styles.taskFill,
                          {
                            width: `${(t.focusedMs / maxTaskMs) * 100}%`,
                            backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={[styles.dot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavButton({
  icon,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} accessibilityRole="button">
      <Ionicons name={icon} size={24} color={disabled ? ui.separator : ui.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ui.bg },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  title: { fontSize: 34, fontWeight: '800', color: ui.text, flexShrink: 1 },
  weekNav: { flexDirection: 'row', gap: 16 },
  strip: { flexDirection: 'row', gap: 6 },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: ui.card,
    borderRadius: 14,
    paddingVertical: 8,
    gap: 4,
  },
  dayName: { fontSize: 12, color: ui.muted },
  dayNumWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  daySelected: { backgroundColor: ui.accent },
  dayNum: { fontSize: 18, fontWeight: '600', color: ui.text },
  dayNumSelected: { color: '#FFFFFF' },
  future: { color: '#C7C7CC' },
  ringWrap: { alignItems: 'center', paddingVertical: 8 },
  rangeLabel: { marginTop: 16, fontSize: 12, color: ui.muted, letterSpacing: 0.5 },
  rangeSummary: { fontSize: 17, color: ui.muted, marginTop: 2 },
  bold: { fontWeight: '700', color: ui.text },
  chart: { marginTop: 16 },
  caption: { fontSize: 12, color: ui.muted, marginTop: 8, textAlign: 'right' },
  empty: { fontSize: 15, color: ui.muted, lineHeight: 21 },
  tasks: { gap: 16 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskText: { flex: 1, gap: 3 },
  taskName: { fontSize: 17, fontWeight: '600', color: ui.text },
  taskMeta: { fontSize: 14, color: ui.muted },
  taskTrack: { height: 6, borderRadius: 3, backgroundColor: ui.bg, marginTop: 4, overflow: 'hidden' },
  taskFill: { height: 6, borderRadius: 3 },
  dot: { width: 14, height: 14, borderRadius: 7 },
});
