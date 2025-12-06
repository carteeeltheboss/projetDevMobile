import { View, Text, StyleSheet } from 'react-native';

export default function CurrentSessionCard({ session }) {
  if (!session) {
    return (
      <View style={[styles.card, styles.inactive]}>
        <Text style={styles.label}>No session right now</Text>
        <Text style={styles.sub}>Enjoy the break or review your notes.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Current session</Text>
      <Text style={styles.title}>{session.Module}</Text>
      <Text style={styles.meta}>
        {session.StartTime} - {session.EndTime} · {session.Room}
      </Text>
      <Text style={styles.sub}>{session.Professor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 16,
  },
  inactive: {
    borderWidth: 1,
    borderColor: '#e4e7ed',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    color: '#6b7280',
  },
});
