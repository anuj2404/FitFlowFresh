import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function AuthScreen({ onNeedOnboarding }) {
  const [tab, setTab] = useState('signin');   // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      Alert.alert('Sign In Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters.');
    // Pass email/password to onboarding so it can call signUp after collecting name/goal/level
    onNeedOnboarding({ email: email.trim(), password });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>

        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>⚡</Text>
          <Text style={styles.appName}>FitFlow</Text>
          <Text style={styles.tagline}>Track. Train. Transform.</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['signin', 'signup'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={COLORS.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={COLORS.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={tab === 'signin' ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#001A13" />
              : <Text style={styles.btnText}>{tab === 'signin' ? 'Sign In' : 'Continue →'}</Text>
            }
          </TouchableOpacity>

          {tab === 'signup' && (
            <Text style={styles.hint}>You'll set up your profile in the next step.</Text>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: SPACING.md, justifyContent: 'center' },

  logoSection: { alignItems: 'center', marginBottom: SPACING.xl },
  logo: { fontSize: 56 },
  appName: { fontSize: 36, color: COLORS.textPrimary, fontWeight: '700', marginTop: SPACING.sm },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },

  tabs: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.full, padding: 4, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: RADIUS.full },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#001A13' },

  form: { gap: SPACING.sm },
  input: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 15, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.border },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, color: '#001A13', fontWeight: '700' },
  hint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs },
});
