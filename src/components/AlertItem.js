import { View, Text, StyleSheet } from 'react-native';

export default function AlertItem({ alert }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.badge, badgeStyles(alert.Priority)]}>{alert.Priority || 'info'}</Text>
      <Text style={styles.title}>{alert.Title}</Text>
      <Text style={styles.message}>{alert.Message}</Text>
      {alert.ExpiresAt ? <Text style={styles.meta}>Expires: {alert.ExpiresAt}</Text> : null}
    </View>
  );
}

const badgeStyles = (priority = '') => {
  const tone = priority.toLowerCase();
  if (tone === 'high') return styles.badgeHigh; // red
  if (tone === 'medium') return styles.badgeMedium; // orange
  return styles.badgeLow; // green
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    color: '#111827',
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  badgeHigh: {
    backgroundColor: '#fecaca',
    color: '#991b1b',
  },
  badgeMedium: {
    backgroundColor: '#fed7aa',
    color: '#c2410c',
  },
  badgeLow: {
    backgroundColor: '#bbf7d0',
    color: '#15803d',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: '#6b7280',
  },
});
