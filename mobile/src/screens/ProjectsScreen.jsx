import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../services/api';
import NoConnection from '../components/NoConnection';

const INK = '#111111';
const YELLOW = '#FFD23F';
const BLUE = '#4D96FF';
const GREEN = '#6BCB77';
const CREAM = '#FFF8E7';

const STATUS_BG   = { NOT_STARTED: YELLOW, IN_PROGRESS: BLUE, COMPLETED: GREEN };
const STATUS_TEXT = { NOT_STARTED: INK,    IN_PROGRESS: '#fff', COMPLETED: INK };
const STATUS_LABELS = { NOT_STARTED: 'Not Started', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const ProjectItem = ({ item, onPress }) => (
  <TouchableOpacity style={s.cardWrap} onPress={() => onPress(item)} activeOpacity={0.85}>
    <View style={s.cardShadow} />
    <View style={s.card}>
      {/* Yellow accent bar */}
      <View style={s.accentBar} />
      <View style={s.cardHeader}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={[s.badge, { backgroundColor: STATUS_BG[item.status] || YELLOW }]}>
          <Text style={[s.badgeText, { color: STATUS_TEXT[item.status] || INK }]}>
            {STATUS_LABELS[item.status] || item.status}
          </Text>
        </View>
      </View>
      {item.description ? (
        <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <Text style={s.taskCount}>{item.task_count ?? 0} TASKS</Text>
    </View>
  </TouchableOpacity>
);

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noConnection, setNoConnection] = useState(false);

  const fetchProjects = useCallback(async () => {
    setNoConnection(false);
    try {
      const params = {};
      if (search) params.search = search;
      const res = await api.get('/api/projects', { params });
      setProjects(res.data.projects);
    } catch (err) {
      if (!err.response) setNoConnection(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useFocusEffect(useCallback(() => { fetchProjects(); }, [fetchProjects]));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={INK} /></View>;
  if (noConnection) return <NoConnection onRetry={() => { setLoading(true); fetchProjects(); }} />;

  return (
    <View style={s.root}>
      <TextInput
        style={s.search}
        placeholder="Search projects…"
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={fetchProjects}
        returnKeyType="search"
      />
      <FlatList
        data={projects}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ProjectItem item={item} onPress={(p) => navigation.navigate('ProjectDetail', { project: p })} />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProjects(); }} tintColor={INK} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <View style={s.emptyShadow} />
            <View style={s.emptyCard}>
              <Text style={s.emptyText}>NO PROJECTS YET</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM },
  search: { margin: 16, marginBottom: 8, borderWidth: 2, borderColor: INK, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#fff', color: INK },
  cardWrap: { marginBottom: 12, marginRight: 4 },
  cardShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 0, right: -4, bottom: -4 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, overflow: 'hidden' },
  accentBar: { height: 6, backgroundColor: YELLOW },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: INK, flex: 1, marginRight: 8 },
  cardDesc: { fontSize: 13, color: '#555', marginHorizontal: 14, marginBottom: 6, lineHeight: 18 },
  badge: { borderWidth: 2, borderColor: INK, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1, fontFamily: 'monospace' },
  taskCount: { fontSize: 10, color: '#777', fontFamily: 'monospace', fontWeight: '700', letterSpacing: 2, marginHorizontal: 14, paddingTop: 8, paddingBottom: 12, borderTopWidth: 2, borderColor: INK, marginTop: 4 },
  emptyWrap: { marginTop: 40, alignSelf: 'center', marginRight: 4 },
  emptyShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  emptyCard: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, paddingHorizontal: 24, paddingVertical: 20 },
  emptyText: { color: INK, fontWeight: '800', fontSize: 14, letterSpacing: 2, fontFamily: 'monospace' },
});
