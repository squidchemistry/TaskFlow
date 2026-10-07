import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NoConnection from '../components/NoConnection';

const INK = '#111111';
const YELLOW = '#FFD23F';
const BLUE = '#4D96FF';
const GREEN = '#6BCB77';
const PINK = '#FF6B9D';
const CREAM = '#FFF8E7';

const STAT_COLORS = [BLUE, YELLOW, '#fff', GREEN, PINK];
const STAT_TEXT_COLORS = ['#fff', INK, INK, INK, '#fff'];

const StatCard = ({ label, value, bg, textColor }) => (
  <View style={[s.statWrap]}>
    <View style={s.statShadow} />
    <View style={[s.statCard, { backgroundColor: bg }]}>
      <Text style={[s.statValue, { color: textColor }]}>{value ?? '—'}</Text>
      <Text style={[s.statLabel, { color: textColor, opacity: 0.75 }]}>{label}</Text>
    </View>
  </View>
);

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [noConnection, setNoConnection] = useState(false);

  const fetchStats = async () => {
    setNoConnection(false);
    try {
      const res = await api.get('/api/dashboard');
      setStats(res.data);
    } catch (err) {
      if (!err.response) setNoConnection(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={INK} /></View>;
  }

  if (noConnection) {
    return <NoConnection onRetry={() => { setLoading(true); fetchStats(); }} />;
  }

  const statItems = [
    { label: 'TOTAL PROJECTS',   value: stats?.total_projects },
    { label: 'IN PROGRESS',      value: stats?.projects_in_progress },
    { label: 'TOTAL TASKS',      value: stats?.total_tasks },
    { label: 'COMPLETED TASKS',  value: stats?.completed_tasks },
    { label: 'PENDING TASKS',    value: stats?.pending_tasks },
  ];

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={INK} />}
    >
      <Text style={s.greeting}>Hey, {user?.full_name?.split(' ')[0]} 👋</Text>
      <Text style={s.subtext}>Here's your project overview</Text>

      <View style={s.grid}>
        {statItems.map((item, i) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            bg={STAT_COLORS[i]}
            textColor={STAT_TEXT_COLORS[i]}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  container: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM },
  greeting: { fontSize: 24, fontWeight: '900', color: INK, marginBottom: 4, letterSpacing: 0.5 },
  subtext: { fontSize: 13, color: '#777', marginBottom: 20, fontFamily: 'monospace' },
  grid: { gap: 12 },
  statWrap: { marginBottom: 4, marginRight: 4 },
  statShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  statCard: { borderWidth: 2, borderColor: INK, padding: 16 },
  statValue: { fontSize: 32, fontWeight: '900', fontFamily: 'monospace', lineHeight: 36 },
  statLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, fontFamily: 'monospace', marginTop: 4 },
});
