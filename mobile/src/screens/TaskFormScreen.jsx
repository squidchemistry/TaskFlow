import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { api } from '../services/api';

const INK = '#111111';
const YELLOW = '#FFD23F';
const BLUE = '#4D96FF';
const GREEN = '#6BCB77';
const PINK = '#FF6B9D';
const CREAM = '#FFF8E7';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES   = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITY_L = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };
const STATUS_L   = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' };

const PRIORITY_ACTIVE_BG   = { LOW: GREEN, MEDIUM: YELLOW, HIGH: PINK };
const PRIORITY_ACTIVE_TEXT = { LOW: INK,   MEDIUM: INK,    HIGH: '#fff' };
const STATUS_ACTIVE_BG   = { PENDING: YELLOW, IN_PROGRESS: BLUE, COMPLETED: GREEN };
const STATUS_ACTIVE_TEXT = { PENDING: INK,    IN_PROGRESS: '#fff', COMPLETED: INK };

export default function TaskFormScreen({ route, navigation }) {
  const { task, projectId } = route.params;
  const isEdit = !!task;

  const [form, setForm] = useState({
    name:        task?.name        || '',
    description: task?.description || '',
    priority:    task?.priority    || 'MEDIUM',
    status:      task?.status      || 'PENDING',
    due_date:    task?.due_date    ? task.due_date.split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  navigation.setOptions({ title: isEdit ? 'Edit Task' : 'New Task' });

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Task name is required');
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/api/tasks/${task.id}`, {
          name: form.name.trim(), description: form.description || null,
          priority: form.priority, status: form.status, due_date: form.due_date || null,
        });
      } else {
        await api.post('/api/tasks', {
          project_id: projectId, name: form.name.trim(), description: form.description || null,
          priority: form.priority, status: form.status, due_date: form.due_date || null,
        });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const SegmentControl = ({ label, options, labels, value, onChange, activeBg, activeText }) => (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={s.segment}>
        {options.map((o) => {
          const isActive = value === o;
          return (
            <TouchableOpacity
              key={o}
              style={[
                s.segBtn,
                isActive && { backgroundColor: activeBg ? activeBg[o] : YELLOW },
              ]}
              onPress={() => onChange(o)}
              activeOpacity={0.8}
            >
              <Text style={[
                s.segText,
                isActive && { color: activeText ? activeText[o] : INK },
              ]}>
                {labels[o]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={s.root} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

        <View style={s.field}>
          <Text style={s.label}>TASK NAME *</Text>
          <TextInput
            style={s.input}
            value={form.name}
            onChangeText={set('name')}
            placeholder="Enter task name"
            placeholderTextColor="#aaa"
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>DESCRIPTION</Text>
          <TextInput
            style={[s.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
            value={form.description}
            onChangeText={set('description')}
            placeholder="Optional description"
            placeholderTextColor="#aaa"
            multiline
          />
        </View>

        <SegmentControl
          label="PRIORITY"
          options={PRIORITIES}
          labels={PRIORITY_L}
          value={form.priority}
          onChange={set('priority')}
          activeBg={PRIORITY_ACTIVE_BG}
          activeText={PRIORITY_ACTIVE_TEXT}
        />

        <SegmentControl
          label="STATUS"
          options={STATUSES}
          labels={STATUS_L}
          value={form.status}
          onChange={set('status')}
          activeBg={STATUS_ACTIVE_BG}
          activeText={STATUS_ACTIVE_TEXT}
        />

        <View style={s.field}>
          <Text style={s.label}>DUE DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={s.input}
            value={form.due_date}
            onChangeText={set('due_date')}
            placeholder="2025-12-31"
            placeholderTextColor="#aaa"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={s.btnWrap}>
          <View style={s.btnShadow} />
          <TouchableOpacity style={s.btn} onPress={handleSave} disabled={loading} activeOpacity={0.8}>
            {loading
              ? <ActivityIndicator color={INK} />
              : <Text style={s.btnText}>{isEdit ? 'SAVE CHANGES' : 'CREATE TASK'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  container: { padding: 20, paddingBottom: 40 },
  field: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: INK, letterSpacing: 2, fontFamily: 'monospace', marginBottom: 8 },
  input: { borderWidth: 2, borderColor: INK, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, backgroundColor: '#fff', color: INK },
  segment: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  segBtn: { flex: 1, paddingVertical: 10, borderWidth: 2, borderColor: INK, backgroundColor: '#fff', alignItems: 'center', minWidth: 80 },
  segText: { fontSize: 12, fontWeight: '800', color: '#777', letterSpacing: 1 },
  btnWrap: { marginTop: 8, marginRight: 4 },
  btnShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  btn: { backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, paddingVertical: 15, alignItems: 'center' },
  btnText: { color: INK, fontWeight: '900', fontSize: 15, letterSpacing: 2 },
});
