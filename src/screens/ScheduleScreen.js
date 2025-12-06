import { useMemo } from 'react';
import { View, Text, RefreshControl, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchSchedule } from '../services/googleSheetsService';

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const normalizeDay = (value = '') => value.slice(0, 3).toLowerCase();
const getHour = (time = '') => parseInt((time || '00').split(':')[0], 10) || 0;

export default function ScheduleScreen() {
  const { data, loading, error, refresh, source } = useCachedResource(fetchSchedule, []);
  const { width } = useWindowDimensions();

  const grid = useMemo(() => {
    const grouped = dayOrder.map((day) => {
      const key = normalizeDay(day);
      const sessions = (data || [])
        .filter((item) => normalizeDay(item.Day || '') === key)
        .sort((a, b) => (a.StartTime || '').localeCompare(b.StartTime || ''));
      const slots = [...sessions];

      const startsAfterNoon = slots[0] && getHour(slots[0].StartTime) >= 12;
      if (startsAfterNoon && slots.length < 4) {
        // pad on the left so late classes align to the right columns
        const padLeft = 4 - slots.length;
        const padded = Array(padLeft).fill(null).concat(slots);
        return { day, slots: padded.slice(-4) };
      }

      while (slots.length < 4) slots.push(null); // default: pad to the right
      return { day, slots: slots.slice(0, 4) };
    });
    return grouped;
  }, [data]);

  const horizontalPadding = 16;
  const labelWidth = 68;
  const gap = 8;
  const cellWidth = (width - horizontalPadding * 2 - labelWidth - gap * 4) / 4;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Full schedule</Text>
          <Text style={styles.subheading}>
            {source ? `Loaded from ${source}` : 'Loading...'} · 5 days × 4 slots
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.error}>Could not load schedule: {error.message}</Text> : null}
      {!loading && !data?.length ? (
        <Text style={styles.empty}>No schedule data found.</Text>
      ) : null}

      <View style={styles.gridWrapper}>
        {grid.map((row) => (
          <View key={row.day} style={styles.row}>
            <Text style={[styles.dayLabel, { width: labelWidth }]}>{row.day}</Text>
            {row.slots.map((slot, idx) => (
              <View key={`${row.day}-${idx}`} style={[styles.cell, { width: cellWidth }]}>
                {slot ? (
                  <>
                    <Text style={styles.cellTime}>
                      {slot.StartTime || '??'} - {slot.EndTime || '??'}
                    </Text>
                    <Text style={styles.cellTitle} numberOfLines={2}>
                      {slot.Module || 'Untitled'}
                    </Text>
                    <Text style={styles.cellMeta} numberOfLines={1}>
                      {slot.Room || 'Room ?'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.cellEmpty}>NaN</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  content: { padding: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subheading: { fontSize: 14, color: '#475569', marginTop: 4 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 20 },
  error: { color: '#b91c1c', marginBottom: 10 },
  gridWrapper: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 8 },
  dayLabel: { fontWeight: '800', color: '#0f172a', fontSize: 14, alignSelf: 'center' },
  cell: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    minHeight: 90,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cellTime: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  cellTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  cellMeta: { fontSize: 12, color: '#475569', marginTop: 2 },
  cellEmpty: { fontSize: 12, color: '#9ca3af', textAlign: 'center' },
});
