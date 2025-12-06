import { FlatList, View, Text, RefreshControl, StyleSheet } from 'react-native';
import AlertItem from '../components/AlertItem';
import StateMessage from '../components/StateMessage';
import { useCachedResource } from '../hooks/useCachedResource';
import { fetchAlerts } from '../services/googleSheetsService';

export default function AlertsScreen() {
  const { data, loading, error, refresh, source } = useCachedResource(fetchAlerts, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Alerts</Text>
      <Text style={styles.subheading}>
        Urgent updates · {source ? `loaded from ${source}` : 'loading...'}
      </Text>
      <FlatList
        data={data || []}
        keyExtractor={(item, index) => `${item.Id || index}-${item.Title}`}
        renderItem={({ item }) => <AlertItem alert={item} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          !loading ? <StateMessage title="No alerts" message="All clear for now." /> : null
        }
        ListHeaderComponent={error ? <StateMessage title="Could not load alerts" message={error.message} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subheading: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    marginBottom: 12,
  },
  content: {
    paddingTop: 4,
    paddingBottom: 12,
  },
});
