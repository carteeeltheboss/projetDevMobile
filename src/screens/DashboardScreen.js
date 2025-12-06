import { useMemo, useState, useEffect } from 'react';
import { ScrollView, View, Text, RefreshControl, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import CurrentSessionCard from '../components/CurrentSessionCard';
import SessionCard from '../components/SessionCard';
import StateMessage from '../components/StateMessage';
import AlertItem from '../components/AlertItem';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchSchedule, fetchAlerts } from '../services/googleSheetsService';
import { getCurrentSession, getTodaySchedule } from '../utils/time';
import { TODO_KEY } from '../storage/storageKeys';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { data, loading, source, error, refresh } = useCachedResource(fetchSchedule, []);
  const {
    data: alerts,
    loading: alertsLoading,
    source: alertsSource,
    error: alertsError,
    refresh: refreshAlerts,
  } = useCachedResource(fetchAlerts, []);
  const [todoData, setTodoData] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      AsyncStorage.getItem(TODO_KEY).then((stored) => {
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTodoData(parsed);
          } catch (e) {
            console.warn('Failed to parse todos, using mock', e);
          }
        }
      });
    });

    return unsubscribe;
  }, [navigation]);

  const todaySchedule = useMemo(() => getTodaySchedule(data || []), [data]);
  const currentSession = useMemo(() => getCurrentSession(todaySchedule), [todaySchedule]);
  const refreshing = loading || alertsLoading;

  const importantAlerts = useMemo(
    () =>
      (alerts || []).filter((a) => ['high', 'medium'].includes((a.Priority || '').toLowerCase())),
    [alerts]
  );

  const generalMessages = useMemo(
    () =>
      (alerts || []).filter((a) => !['high', 'medium'].includes((a.Priority || '').toLowerCase())),
    [alerts]
  );

  const onRefresh = () => {
    refresh();
    refreshAlerts();
  };

  const { completedTasks, totalTasks } = useMemo(() => {
    const completed = todoData.filter((item) => item.done).length;
    return { completedTasks: completed, totalTasks: todoData.length };
  }, [todoData]);

  const chartData = [
    {
      name: 'Completed',
      population: completedTasks,
      color: '#a0c4ff',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Remaining',
      population: totalTasks - completedTasks,
      color: '#c7b8e6',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.subheading}>
            EMSI timetable · {source ? `loaded from ${source}` : 'loading...'}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.cta, styles.ctaCompact]} onPress={() => navigation.navigate('Schedule')}>
            <Text style={[styles.ctaText, styles.ctaTextCompact]}>Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cta, styles.ctaSecondary, styles.ctaCompact]}
            onPress={() => navigation.navigate('Todo')}
          >
            <Text style={[styles.ctaText, styles.ctaTextSecondary, styles.ctaTextCompact]}>Todo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cta, styles.ctaSecondary, styles.ctaCompact]}
            onPress={() => navigation.navigate('Pomodoro')}
          >
            <Text style={[styles.ctaText, styles.ctaTextSecondary, styles.ctaTextCompact]}>Pomodoro</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CurrentSessionCard session={currentSession} />

      <Text style={styles.sectionTitle}>Today&apos;s classes</Text>
      {error ? (
        <StateMessage title="Could not load schedule" message={error.message} />
      ) : null}
      {!todaySchedule?.length && !loading ? (
        <StateMessage title="No classes" message="Nothing scheduled for today." />
      ) : (
        <FlatList
          data={todaySchedule}
          keyExtractor={(item, index) => `${item.Module}-${item.StartTime}-${index}`}
          renderItem={({ item }) => <SessionCard session={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      <Text style={styles.sectionTitle}>Todo List Progress</Text>
      <View style={{ alignItems: 'center' }}>
        <PieChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={180}
          chartConfig={{
            backgroundColor: '#1cc910',
            backgroundGradientFrom: '#eff6ff',
            backgroundGradientTo: '#efefef',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>

      <Text style={styles.sectionTitle}>Alerts &amp; Messages {alertsSource ? `· ${alertsSource}` : ''}</Text>
      {alertsError ? <StateMessage title="Could not load alerts" message={alertsError.message} /> : null}

      <Text style={styles.subSection}>Alerts</Text>
      {!importantAlerts.length && !alertsLoading ? (
        <StateMessage title="No alerts" message="All clear for now." />
      ) : (
        importantAlerts.map((item, idx) => (
          <AlertItem key={`a-${item.Id || item.id || idx}`} alert={item} />
        ))
      )}

      <Text style={styles.subSection}>Messages</Text>
      {!generalMessages.length && !alertsLoading ? (
        <StateMessage title="No messages" message="Nothing to share right now." />
      ) : (
        generalMessages.map((item, idx) => (
          <AlertItem key={`m-${item.Id || item.id || idx}`} alert={item} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 },
  headerText: { flex: 1, marginRight: 8, minWidth: 0 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0, maxWidth: '50%' },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subheading: { fontSize: 14, color: '#475569', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  subSection: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 6, marginBottom: 6 },
  list: { paddingVertical: 4 },
  cta: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ctaCompact: { paddingHorizontal: 10, paddingVertical: 8 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  ctaTextCompact: { fontSize: 12 },
  ctaSecondary: {
    backgroundColor: '#e0e7ff',
  },
  ctaTextSecondary: { color: '#1e3a8a' },
});
