import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function NoConnection({ onRetry }) {
  return (
    <View style={s.root}>
      <View style={s.shadowWrap}>
        <View style={s.shadow} />
        <View style={s.card}>
          <Text style={s.icon}>⚡</Text>
          <Text style={s.title}>NO CONNECTION</Text>
          <Text style={s.body}>Could not reach the server.{'\n'}Check your network and try again.</Text>
          <View style={s.btnShadowWrap}>
            <View style={s.btnShadow} />
            <TouchableOpacity style={s.btn} onPress={onRetry} activeOpacity={0.8}>
              <Text style={s.btnText}>RETRY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const INK = '#111111';
const YELLOW = '#FFD23F';
const CREAM = '#FFF8E7';

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM, alignItems: 'center', justifyContent: 'center', padding: 24 },
  shadowWrap: { width: '100%', maxWidth: 320, marginBottom: 8, marginRight: 4 },
  shadow: { position: 'absolute', backgroundColor: INK, top: 4, left: 4, right: -4, bottom: -4 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: INK, padding: 28, alignItems: 'center' },
  icon: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: INK, letterSpacing: 2, marginBottom: 8 },
  body: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 24, fontFamily: 'monospace' },
  btnShadowWrap: { width: '100%', marginBottom: 4, marginRight: 4 },
  btnShadow: { position: 'absolute', backgroundColor: INK, top: 3, left: 3, right: -3, bottom: -3 },
  btn: { backgroundColor: YELLOW, borderWidth: 2, borderColor: INK, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center' },
  btnText: { color: INK, fontWeight: '800', fontSize: 14, letterSpacing: 2 },
});
