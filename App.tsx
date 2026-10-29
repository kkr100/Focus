import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Tab, TabBar } from './src/components/TabBar';
import { FocusScreen } from './src/screens/FocusScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { FocusSession, loadSessions, saveSessions } from './src/sessions';
import { DEFAULT_SETTINGS, Settings, loadSettings, saveSettings } from './src/storage';

export default function App() {
  const [tab, setTab] = useState<Tab>('focus');
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadSettings(), loadSessions()]).then(([s, history]) => {
      setSettings(s);
      setSessions(history);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSettings(settings);
  }, [settings, loaded]);

  useEffect(() => {
    if (loaded) saveSessions(sessions);
  }, [sessions, loaded]);

  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  return (
    <SafeAreaProvider>
      {/* The focus screen stays mounted on other tabs so a paused timer survives. */}
      <View style={[styles.fill, tab !== 'focus' && styles.hidden]}>
        <FocusScreen
          visible={tab === 'focus'}
          settings={settings}
          onChange={update}
          onSessionEnd={(session) => setSessions((list) => [...list, session])}
          renderTabBar={(dark) => <TabBar current={tab} onChange={setTab} dark={dark} />}
        />
      </View>

      {tab !== 'focus' && (
        <View style={styles.fill}>
          <StatusBar style="dark" />
          {tab === 'stats' ? (
            <StatsScreen sessions={sessions} dailyGoal={settings.dailyGoal} />
          ) : (
            <SettingsScreen
              settings={settings}
              onChange={update}
              sessionCount={sessions.length}
              onResetStats={() => setSessions([])}
            />
          )}
          <TabBar current={tab} onChange={setTab} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
});
