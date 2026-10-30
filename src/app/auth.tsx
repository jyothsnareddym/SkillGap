
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function goToHome() {
    router.replace('/(tabs)' as Href);
  }

  async function handleAuth() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert('Missing details', 'Enter your email and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    if (isSignUp && !name.trim()) {
      Alert.alert('Name required', 'Enter your name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (!data.session) {
          Alert.alert(
            'Check your email',
            'Your account was created. Confirm your email, then sign in.',
          );
          setIsSignUp(false);
        } else {
          goToHome();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) throw error;

        goToHome();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';

      Alert.alert(isSignUp ? 'Sign-up failed' : 'Login failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <Text style={styles.brand}>SkillGap</Text>
        <Text style={styles.subtitle}>
          Understand your skills. Build your future.
        </Text>

        <View style={styles.card}>
          <Text style={styles.heading}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>

          <Text style={styles.description}>
            {isSignUp
              ? 'Start building your career with SkillGap.'
              : 'Sign in to continue your career journey.'}
          </Text>

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#8A94A6"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#8A94A6"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (minimum 6 characters)"
            placeholderTextColor="#8A94A6"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? 'Create account' : 'Sign in'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignUp
                ? 'Already have an account? '
                : "Don't have an account? "}
            </Text>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchLink}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          Your career journey starts with one step.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FC',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  logo: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#3157D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  brand: {
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    color: '#17264A',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#69758B',
    marginTop: 8,
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E7ECF4',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#17264A',
  },
  description: {
    color: '#69758B',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 22,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DDE4EF',
    backgroundColor: '#FBFCFE',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#17264A',
    marginBottom: 14,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#3157D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 22,
  },
  switchText: {
    color: '#69758B',
    fontSize: 14,
  },
  switchLink: {
    color: '#3157D5',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#8993A5',
    fontSize: 12,
    marginTop: 26,
  },
});
