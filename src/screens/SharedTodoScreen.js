import { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchSharedTodos } from '../services/googleSheetsService';

const priorityStyles = {
  high: { bg: '#fee2e2', text: '#991b1b' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  low: { bg: '#d1fae5', text: '#065f46' },
};

const timeLeftLabel = (dueAt) => {
  const now = new Date();
  const due = new Date(dueAt);
  const diffMs = due - now;
  if (diffMs <= 0) return 'Due';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) return `${diffHours}h left`;
  const diffDays = Math.ceil(diffHours / 24);
  return `${diffDays}d left`;
};

export default function SharedTodoScreen() {
  const { data, loading, error, refresh, source } = useCachedResource(fetchSharedTodos, []);

  const todos = useMemo(() => data || [], [data]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Shared Todo List</Text>
      <Text style={styles.subheading}>
        {source ? `Loaded from ${source}` : 'Loading...'} · From TODO tab in main sheet
      </Text>
      {error ? <Text style={styles.error}>Could not load: {error.message}</Text> : null}
      <FlatList
        data={todos}
        keyExtractor={(item, idx) => `${item.Id || item.id || idx}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const priority = priorityStyles[(item.Priority || item.priority || '').toLowerCase()] || priorityStyles.low;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.Title || item.title || 'Untitled task'}</Text>
                <Text style={[styles.priority, { backgroundColor: priority.bg, color: priority.text }]}>
                  {item.Priority || item.priority || 'info'}
                </Text>
              </View>
              <Text style={styles.meta}>
                {(item.Course || item.course || 'General')} • {(item.Duration || item.duration || '1h')} •{' '}
                {(item.DueAt || item.dueAt || '').toString()}
              </Text>
              <Text style={styles.timeLeft}>{timeLeftLabel(item.DueAt || item.dueAt)}</Text>
            </View>
          );
        }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No shared todos yet.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 16 },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subheading: { fontSize: 14, color: '#475569', marginTop: 4, marginBottom: 12 },
  list: { paddingBottom: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  priority: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  meta: { fontSize: 13, color: '#475569', marginBottom: 10 },
  timeLeft: { fontSize: 13, color: '#1f2937', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
  error: { color: '#b91c1c', marginBottom: 10 },
});
