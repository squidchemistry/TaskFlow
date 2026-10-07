import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const INK = '#111111';
const YELLOW = '#FFD23F';
const CREAM = '#FFF8E7';

export default function RegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.full_name || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill all required fields');
    }
    if (form.password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters');
    }
    if (form.password !== form.confirm) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      await login(res.data.token, res.data.user);
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={s.root} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.cardWrap}>
          <View style={s.cardShadow} />
          <View style={s.card}>
            <View style={s.logoWrap}>
              <View style={s.logoBox}><Text style={s.logoIcon}>⚡</Text></View>
            </View>
            <Text style={s.logo}>TASKFLOW</Text>
            <Text style={s.subtitle}>Create your account</Text>

            {[
              { key: 'full_name', label: 'FULL NAME', placeholder: 'Jane Smith' },
              { key: 'email',     label: 'EMAIL ADDRESS', placeholder: 'you@example.com', keyboard: 'email-address', caps: 'none' },
              { key: 'password',  label: 'PASSWORD', placeholder: 'Min 6 characters', secure: true },
              { key: 'confirm',   label: 'CONFIRM PASSWORD', placeholder: '••••••••', secure: true },
            ].map(({ key, label, placeholder, keyboard, caps, secure }) => (
              <View key={key}>
                <Text style={s.inputLabel}>{label}</Text>
                <TextInput
                  style={s.input}
                  placeholder={placeholder}
                  placeholderTextColor="#aaa"
                  autoCapitalize={caps || 'words'}
                  keyboardType={keyboard || 'default'}
                  secureTextEntry={!!secure}
                  value={form[key]}
                  onChangeText={set(key)}
                />
              </View>
            ))}

            <View style={s.btnWrap}>
              <View style={s.btnShadow} />
              <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
                {loading
                  ? <ActivityIndicator color={INK} />
                  : <Text style={s.btnText}>CREATE ACCOUNT</Text>
                }
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.linkWrap}>
              <Text style={s.link}>Already have an account? <Text style={s.linkBold}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  scroll: { padding: 20, paddingBottom: 40 },
  cardWrap: { marginBottom: 8, marginRight: 4 },
  cardShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logoBox: { width: 52, height: 52, backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 24 },
  logo: { fontSize: 26, fontWeight: '900', color: INK, textAlign: 'center', letterSpacing: 3, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#777', textAlign: 'center', fontFamily: 'monospace', marginBottom: 20 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: INK, letterSpacing: 2, fontFamily: 'monospace', marginBottom: 6, marginTop: 4 },
  input: { borderWidth: 2, borderColor: INK, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, marginBottom: 14, backgroundColor: '#fff', color: INK },
  btnWrap: { marginTop: 4, marginBottom: 4, marginRight: 3 },
  btnShadow: { position: 'absolute', backgroundColor: INK, top: 3, left: 3, right: -3, bottom: -3 },
  btn: { backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: INK, fontWeight: '900', fontSize: 15, letterSpacing: 2 },
  linkWrap: { marginTop: 18 },
  link: { textAlign: 'center', color: '#777', fontSize: 13, fontFamily: 'monospace' },
  linkBold: { color: INK, fontWeight: '800', textDecorationLine: 'underline' },
});
