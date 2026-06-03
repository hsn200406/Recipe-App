import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen() {
  const { theme }  = useTheme();
  const navigation = useNavigation();

    const { login, register } = useAuth();

  const [mode, setMode]         = useState('login');   // 'login' | 'register'
  const [name, setName]         = useState('');
  const [handle, setHandle]     = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.'); return;
    }
    setLoading(true);

    try {
      // 🔌 API NOTE: Replace with real auth calls from src/context/AuthContext.js
      // const { login, register } = useAuth();
      // mode === 'login' ? await login(email, password) : await register(name, handle, email, password)
      if (mode === 'login') {
        await login(email, password);
        console.log('Login successful');
      } else {
        const data = await register(
          name,
          handle,
          email,
          password
        );

        console.log('Registration success:', data);

        Alert.alert(
          'Account created',
          'You can now log in with your credentials.'
        );
        setMode('login');
      }
  }
    catch (err) {
      console.log('Auth error:', err);
      Alert.alert('Authentication failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [ls.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }];

  return (
    <SafeAreaView style={[ls.safe, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={ls.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo area */}
          <View style={ls.logoArea}>
            <Text style={{ fontSize: 52 }}>🍴</Text>
            <Text style={[ls.appName, { color: theme.accent }]}>RecipeSocial</Text>
            <Text style={[ls.tagline, { color: theme.muted }]}>
              Create, share, and discover recipes
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={[ls.tabRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {[['login', 'Sign In'], ['register', 'Create Account']].map(([id, label]) => (
              <TouchableOpacity
                key={id} onPress={() => setMode(id)}
                style={[ls.tab, { backgroundColor: mode === id ? theme.accent : 'transparent' }]}
              >
                <Text style={{ color: mode === id ? '#fff' : theme.muted, fontWeight: '600', fontSize: 14 }}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form */}
          <View style={ls.form}>
            {mode === 'register' && (
              <>
                <View>
                  <Text style={[ls.label, { color: theme.muted }]}>FULL NAME</Text>
                  <TextInput value={name} onChangeText={setName} placeholder="e.g. Alex Rivera" placeholderTextColor={theme.muted} style={inputStyle} autoCapitalize="words" />
                </View>
                <View>
                  <Text style={[ls.label, { color: theme.muted }]}>USERNAME</Text>
                  <View style={{ position: 'relative' }}>
                    <Text style={[ls.atSign, { color: theme.muted }]}>@</Text>
                    <TextInput value={handle} onChangeText={setHandle} placeholder="yourhandle" placeholderTextColor={theme.muted} style={[inputStyle, { paddingLeft: 32 }]} autoCapitalize="none" autoCorrect={false} />
                  </View>
                </View>
              </>
            )}

            <View>
              <Text style={[ls.label, { color: theme.muted }]}>EMAIL</Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={theme.muted} style={inputStyle} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            <View>
              <Text style={[ls.label, { color: theme.muted }]}>PASSWORD</Text>
              <View style={{ position: 'relative' }}>
                <TextInput value={password} onChangeText={setPassword} placeholder={mode === 'register' ? 'Min. 8 characters' : 'Your password'} placeholderTextColor={theme.muted} secureTextEntry={!showPass} style={[inputStyle, { paddingRight: 44 }]} autoCapitalize="none" />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={ls.eyeBtn}>
                  <Text style={{ color: theme.muted, fontSize: 16 }}>{showPass ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'login' && (
              <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: theme.accent, fontSize: 13 }}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={submit} disabled={loading}
              style={[ls.submitBtn, { backgroundColor: loading ? theme.pillBg : theme.accent }]}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={ls.submitText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
              }
            </TouchableOpacity>

            {mode === 'login' && (
              <TouchableOpacity
              onPress={() => {}} style={ls.guestBtn}
              >
                <Text style={[ls.guestText, { color: theme.muted }]}>
                  Continue as guest →
                  </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Social login hint */}
          <View style={ls.divider}>
            <View style={[ls.divLine, { backgroundColor: theme.border }]} />
            <Text style={[ls.divText, { color: theme.muted }]}>or</Text>
            <View style={[ls.divLine, { backgroundColor: theme.border }]} />
          </View>
          <View style={ls.socialRow}>
            {[['🍎', 'Apple'], ['🔵', 'Google']].map(([icon, name]) => (
              <TouchableOpacity key={name}
                onPress={() => Alert.alert(`${name} Sign-In`, '🔌 Implement with expo-auth-session\nnpm install expo-auth-session expo-crypto')}
                style={[ls.socialBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={{ fontSize: 18 }}>{icon}</Text>
                <Text style={{ color: theme.text, fontSize: 14, fontWeight: '500' }}>Continue with {name}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ls = StyleSheet.create({
  safe:       { flex: 1 },
  scroll:     { padding: 24, paddingBottom: 44 },
  logoArea:   { alignItems: 'center', paddingVertical: 32, gap: 8 },
  appName:    { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline:    { fontSize: 14 },
  tabRow:     { flexDirection: 'row', borderRadius: 12, padding: 4, borderWidth: 1, marginBottom: 24 },
  tab:        { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  form:       { gap: 14 },
  label:      { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  input:      { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15 },
  atSign:     { position: 'absolute', left: 13, top: 14, zIndex: 1, fontSize: 15 },
  eyeBtn:     { position: 'absolute', right: 12, top: 12 },
  submitBtn:  { padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  guestBtn:   { alignItems: 'center', paddingVertical: 8 },
  guestText:  { fontSize: 14 },
  divider:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  divLine:    { flex: 1, height: 1 },
  divText:    { fontSize: 13 },
  socialRow:  { gap: 10 },
  socialBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 13, borderRadius: 12, borderWidth: 1 },
});
