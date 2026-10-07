import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const INK = '#111111';
const YELLOW = '#FFD23F';
const CREAM = '#FFF8E7';
const PINK = '#FF6B9D';

export default function LoginScreen({ navigation, route }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const expiredMessage = route?.params?.expiredMessage;

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email: email.trim(), password });
      await login(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check your connection.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.cardWrap}>
        <View style={s.cardShadow} />
        <View style={s.card}>
          {/* Logo */}
          <View style={s.logoWrap}>
            <View style={s.logoBox}>
              <Text style={s.logoIcon}>⚡</Text>
            </View>
          </View>
          <Text style={s.logo}>TASKFLOW</Text>
          <Text style={s.subtitle}>Sign in to your account</Text>

          {expiredMessage ? (
            <View style={s.alertBanner}>
              <Text style={s.alertText}>{expiredMessage}</Text>
            </View>
          ) : null}

          <Text style={s.inputLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.inputLabel}>PASSWORD</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={s.btnWrap}>
            <View style={s.btnShadow} />
            <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
              {loading
                ? <ActivityIndicator color={INK} />
                : <Text style={s.btnText}>SIGN IN</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={s.linkWrap}>
            <Text style={s.link}>No account? <Text style={s.linkBold}>Sign up</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM, justifyContent: 'center', padding: 20 },
  cardWrap: { marginBottom: 8, marginRight: 4 },
  cardShadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logoBox: { width: 52, height: 52, backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 24 },
  logo: { fontSize: 26, fontWeight: '900', color: INK, textAlign: 'center', letterSpacing: 3, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#777', textAlign: 'center', fontFamily: 'monospace', marginBottom: 20 },
  alertBanner: { backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, padding: 10, marginBottom: 16 },
  alertText: { color: INK, fontSize: 12, textAlign: 'center', fontWeight: '700', fontFamily: 'monospace' },
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
