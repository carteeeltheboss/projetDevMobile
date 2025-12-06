import { View, Text, StyleSheet } from 'react-native';

export default function SessionCard({ session }) {
  return (
    <View style={styles.card}>
      <Text style={styles.time}>
        {session.StartTime} - {session.EndTime}
      </Text>
      <Text style={styles.title}>{session.Module}</Text>
      <Text style={styles.meta}>{session.Room}</Text>
      {session.Notes ? <Text style={styles.notes}>{session.Notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    marginRight: 12,
    width: 200,
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  meta: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },
  notes: {
    marginTop: 8,
    fontSize: 12,
    color: '#4b5563',
  },
});
