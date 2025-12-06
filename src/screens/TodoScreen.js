import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TODO_KEY } from '../storage/storageKeys';
import { useNavigation } from '@react-navigation/native';

const mockTodos = [
  {
    id: '1',
    title: 'Finish Mobile Dev report',
    course: 'Mobile Dev',
    dueAt: '2024-12-15T18:00:00Z',
    priority: 'high',
    duration: '3h',
  },
  {
    id: '2',
    title: 'Revise Algorithms chapter 6',
    course: 'Algorithms',
    dueAt: '2024-12-13T10:00:00Z',
    priority: 'medium',
    duration: '2h',
  },
  {
    id: '3',
    title: 'Prepare slides for Cloud presentation',
    course: 'Cloud',
    dueAt: '2024-12-18T14:00:00Z',
    priority: 'low',
    duration: '1h',
  },
  {
    id: '4',
    title: 'Sync with teammates on project tasks',
    course: 'Team',
    dueAt: '2024-12-12T16:00:00Z',
    priority: 'medium',
    duration: '30m',
  },
];

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

export default function TodoScreen() {
  const navigation = useNavigation();
  const [items, setItems] = useState(mockTodos);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', course: '', dueAt: '', priority: 'medium', duration: '1h' });

  useEffect(() => {
    AsyncStorage.getItem(TODO_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setItems(parsed);
        } catch (e) {
          console.warn('Failed to parse todos, using mock', e);
        }
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(TODO_KEY, JSON.stringify(items)).catch((e) =>
      console.warn('Failed to persist todos', e)
    );
  }, [items]);

  const sorted = useMemo(() => {
    const pending = items
      .filter((i) => !i.done)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    const done = items
      .filter((i) => i.done)
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
    return [...pending, ...done];
  }, [items]);

  const toggleDone = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setForm({
      title: item.title,
      course: item.course,
      dueAt: item.dueAt,
      priority: item.priority,
      duration: item.duration,
    });
  };

  const startCreate = () => {
    setEditing('new');
    setForm({ title: '', course: '', dueAt: '', priority: 'medium', duration: '1h' });
  };

  const saveEdit = () => {
    if (!form.title.trim()) return;
    setItems((prev) => {
      if (editing === 'new') {
        const nextId = `${Date.now()}`;
        return [...prev, { ...form, id: nextId, done: false }];
      }
      return prev.map((item) =>
        item.id === editing
          ? { ...item, ...form }
          : item
      );
    });
    setEditing(null);
  };

  const deleteItem = () => {
    if (!editing) return;
    setItems((prev) => prev.filter((item) => item.id !== editing));
    setEditing(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>Todo List</Text>
          <Text style={styles.subheading}>Organized by due time with clear priorities</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.button, styles.linkButton, styles.compactButton]} onPress={startCreate}>
            <Text style={[styles.buttonText, styles.linkButtonText, styles.compactButtonText]}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.linkButton, styles.compactButton]}
            onPress={() => navigation.navigate('SharedTodo')}
          >
            <Text style={[styles.buttonText, styles.linkButtonText, styles.compactButtonText]}>Shared todos</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const priority = priorityStyles[item.priority] || priorityStyles.low;
          return (
            <TouchableOpacity
              onPress={() => openEdit(item)}
              activeOpacity={0.85}
              style={[styles.card, item.done && styles.cardDone]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={[styles.priority, { backgroundColor: priority.bg, color: priority.text }]}>
                  {item.priority}
                </Text>
              </View>
              <Text style={styles.meta}>
                {item.course} • {item.duration} • {new Date(item.dueAt).toLocaleString()}
              </Text>
              <View style={styles.footer}>
                <Text style={[styles.timeLeft, item.done && styles.doneText]}>
                  {item.done ? 'Completed' : timeLeftLabel(item.dueAt)}
                </Text>
                <TouchableOpacity
                  style={[styles.button, item.done && styles.buttonDone]}
                  onPress={() => toggleDone(item.id)}
                >
                  <Text style={[styles.buttonText, item.done && styles.buttonTextDone]}>
                    {item.done ? 'Undo' : 'Mark done'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No todos yet.</Text>}
      />

      <Modal visible={!!editing} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing === 'new' ? 'Add todo' : 'Edit todo'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={form.title}
              onChangeText={(text) => setForm((f) => ({ ...f, title: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Course"
              value={form.course}
              onChangeText={(text) => setForm((f) => ({ ...f, course: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Due (e.g. 2024-12-15T18:00:00Z)"
              value={form.dueAt}
              onChangeText={(text) => setForm((f) => ({ ...f, dueAt: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Priority (high/medium/low)"
              value={form.priority}
              onChangeText={(text) => setForm((f) => ({ ...f, priority: text }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Duration (e.g. 1h)"
              value={form.duration}
              onChangeText={(text) => setForm((f) => ({ ...f, duration: text }))}
            />
            <View style={styles.modalActions}>
              {editing !== 'new' ? (
                <Pressable
                  style={[styles.button, styles.buttonDone, styles.modalButton]}
                  onPress={deleteItem}
                >
                  <Text style={[styles.buttonText, styles.buttonTextDone]}>Delete</Text>
                </Pressable>
              ) : null}
              <Pressable style={[styles.button, styles.modalButton]} onPress={saveEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonDone, styles.modalButton]}
                onPress={() => setEditing(null)}
              >
                <Text style={[styles.buttonText, styles.buttonTextDone]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 },
  headerText: { flex: 1, marginRight: 8, minWidth: 0 },
  heading: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subheading: { fontSize: 14, color: '#475569', marginTop: 4, marginBottom: 0 },
  headerActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0, maxWidth: '55%' },
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
  cardDone: { opacity: 0.3 },
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
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLeft: { fontSize: 13, color: '#1f2937', fontWeight: '600' },
  button: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  buttonDone: { backgroundColor: '#e5e7eb' },
  buttonTextDone: { color: '#111827' },
  doneText: { color: '#6b7280', textDecorationLine: 'line-through' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10 },
  linkButton: { backgroundColor: '#e0e7ff' },
  linkButtonText: { color: '#1e3a8a', fontWeight: '700', fontSize: 13 },
  compactButton: { paddingHorizontal: 10, paddingVertical: 8 },
  compactButtonText: { fontSize: 12 },
});
