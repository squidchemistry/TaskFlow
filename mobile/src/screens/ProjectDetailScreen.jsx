import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import NoConnection from '../components/NoConnection';

const INK = '#111111';
const YELLOW = '#FFD23F';
const BLUE = '#4D96FF';
const GREEN = '#6BCB77';
const PINK = '#FF6B9D';
const CREAM = '#FFF8E7';

const STATUS_BG   = { PENDING: YELLOW, IN_PROGRESS: BLUE, COMPLETED: GREEN };
const STATUS_TEXT = { PENDING: INK,    IN_PROGRESS: '#fff', COMPLETED: INK };
const PRIORITY_BG   = { LOW: GREEN, MEDIUM: YELLOW, HIGH: PINK };
const PRIORITY_TEXT = { LOW: INK,   MEDIUM: INK,    HIGH: '#fff' };
const STATUS_L   = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };
const PRIORITY_L = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

const TaskItem = ({ item, onToggle, onEdit, onDelete }) => (
  <View style={s.taskWrap}>
    <View style={s.taskShadow} />
    <View style={[s.taskCard, item.status === 'COMPLETED' && { opacity: 0.75 }]}>
      <TouchableOpacity
        onPress={() => onToggle(item)}
        style={[s.checkbox, item.status === 'COMPLETED' && s.checkboxDone]}
      >
        {item.status === 'COMPLETED' && <Text style={s.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={[s.taskName, item.status === 'COMPLETED' && s.taskDone]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <View style={s.taskMeta}>
          <View style={[s.badge, { backgroundColor: STATUS_BG[item.status] || YELLOW }]}>
            <Text style={[s.badgeText, { color: STATUS_TEXT[item.status] || INK }]}>
              {STATUS_L[item.status]}
            </Text>
          </View>
          <View style={[s.badge, { backgroundColor: PRIORITY_BG[item.priority] || YELLOW }]}>
            <Text style={[s.badgeText, { color: PRIORITY_TEXT[item.priority] || INK }]}>
              {PRIORITY_L[item.priority]}
            </Text>
          </View>
        </View>
      </View>

      <View style={s.taskActions}>
        <TouchableOpacity style={s.actionBtn} onPress={() => onEdit(item)}>
          <Text style={s.actionBtnText}>✏</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { backgroundColor: PINK }]} onPress={() => onDelete(item)}>
          <Text style={[s.actionBtnText, { color: '#fff' }]}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function ProjectDetailScreen({ route, navigation }) {
  const { project } = route.params;
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noConnection, setNoConnection] = useState(false);

  const fetchTasks = useCallback(async () => {
    setNoConnection(false);
    try {
      const params = { projectId: project.id };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/api/tasks', { params });
      setTasks(res.data.tasks);
    } catch (err) {
      if (!err.response) setNoConnection(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [project.id, search, statusFilter]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));
  navigation.setOptions({ title: project.name });

  const handleToggle = async (task) => {
    const next = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await api.put(`/api/tasks/${task.id}`, { status: next });
      fetchTasks();
    } catch {
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleDelete = (task) => {
    Alert.alert('Delete Task', `Delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/api/tasks/${task.id}`);
            fetchTasks();
          } catch {
            Alert.alert('Error', 'Failed to delete task');
          }
        },
      },
    ]);
  };

  const STATUS_OPTIONS = ['', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
  const STATUS_OPTION_L = ['All', 'Pending', 'In Progress', 'Done'];

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={INK} /></View>;
  if (noConnection) return <NoConnection onRetry={() => { setLoading(true); fetchTasks(); }} />;

  return (
    <View style={s.root}>
      <TextInput
        style={s.search}
        placeholder="Search tasks…"
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchTasks}
        returnKeyType="search"
      />

      <View style={s.filters}>
        {STATUS_OPTIONS.map((v, i) => (
          <TouchableOpacity
            key={v || 'all'}
            onPress={() => setStatusFilter(v)}
            style={[s.filterBtn, statusFilter === v && s.filterActive]}
            activeOpacity={0.8}
          >
            <Text style={[s.filterText, statusFilter === v && s.filterTextActive]}>
              {STATUS_OPTION_L[i]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <TaskItem
            item={item}
            onToggle={handleToggle}
            onEdit={(t) => navigation.navigate('TaskForm', { task: t, projectId: project.id })}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} tintColor={INK} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <View style={s.emptyShadow} />
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>NO TASKS FOUND</Text>
            </View>
          </View>
        }
      />

      {/* FAB */}
      <View style={s.fabWrap}>
        <View style={s.fabShadow} />
        <TouchableOpacity
          style={s.fab}
          onPress={() => navigation.navigate('TaskForm', { projectId: project.id })}
          activeOpacity={0.8}
        >
          <Text style={s.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM },
  search: { margin: 16, marginBottom: 8, borderWidth: 2, borderColor: INK, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#fff', color: INK },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 6, flexWrap: 'wrap' },
  filterBtn: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2, borderColor: INK, backgroundColor: '#fff' },
  filterActive: { backgroundColor: YELLOW },
  filterText: { fontSize: 11, color: '#555', fontWeight: '700', fontFamily: 'monospace', letterSpacing: 1 },
  filterTextActive: { color: INK },
  taskWrap: { marginBottom: 10, marginRight: 4 },
  taskShadow: { position: 'absolute', backgroundColor: INK, top: 3, left: 0, right: -3, bottom: -3 },
  taskCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, padding: 12, flexDirection: 'row', gap: 10 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center', marginTop: 2, backgroundColor: '#fff' },
  checkboxDone: { backgroundColor: GREEN },
  checkmark: { color: INK, fontSize: 13, fontWeight: '900' },
  taskName: { fontSize: 14, fontWeight: '700', color: INK, marginBottom: 6 },
  taskDone: { textDecorationLine: 'line-through', color: '#aaa' },
  taskMeta: { flexDirection: 'row', gap: 6 },
  badge: { borderWidth: 2, borderColor: INK, paddingHorizontal: 5, paddingVertical: 2 },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  taskActions: { gap: 4, justifyContent: 'center' },
  actionBtn: { width: 28, height: 28, borderWidth: 2, borderColor: INK, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: INK },
  emptyWrap: { marginTop: 40, alignSelf: 'center', marginRight: 4 },
  emptyShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  emptyCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, paddingHorizontal: 24, paddingVertical: 20 },
  emptyText: { color: INK, fontWeight: '800', fontSize: 14, letterSpacing: 2, fontFamily: 'monospace' },
  fabWrap: { position: 'absolute', bottom: 24, right: 24, marginRight: 4 },
  fabShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  fab: { width: 56, height: 56, backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: INK, fontSize: 30, fontWeight: '900', lineHeight: 36 },
});
