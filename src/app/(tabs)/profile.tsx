
import { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

type ProfileData = {
  name: string;
  email: string;
  age: string;
  designation: string;
  degree: string;
  college: string;
  graduationYear: string;
  experienceLevel: string;
  experienceYears: string;
  skills: string;
  desiredRole: string;
  domain: string;
};

const STORAGE_KEY = '@skillgap_profile';

const emptyProfile: ProfileData = {
  name: '',
  email: '',
  age: '',
  designation: '',
  degree: '',
  college: '',
  graduationYear: '',
  experienceLevel: 'Fresher',
  experienceYears: '0',
  skills: '',
  desiredRole: '',
  domain: '',
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedProfile !== null) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfile({ ...emptyProfile, ...parsedProfile });
          setSaved(true);
        }
      } catch {
        Alert.alert(
          'Unable to load profile',
          'Your saved profile could not be loaded.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function updateField(field: keyof ProfileData, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
    setSaved(false);
  }

  async function saveProfile() {
    if (!profile.name.trim()) {
      Alert.alert('Name required', 'Please enter your name before saving.');
      return;
    }

    if (
      profile.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
    ) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setSaved(true);
      Alert.alert('Success', 'Your profile has been saved on this device.');
    } catch {
      Alert.alert(
        'Save failed',
        'Your profile could not be saved. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  function handleLogin() {
    router.replace('/auth');
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        Alert.alert('Logout failed', error.message);
        return;
      }

      router.replace('/auth');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.';

      Alert.alert('Logout failed', message);
    } finally {
      setLoggingOut(false);
    }
  }

  function renderField(
    label: string,
    field: keyof ProfileData,
    placeholder: string,
    multiline = false,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default'
  ) {
    return (
      <View style={styles.field} key={field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={profile[field]}
          onChangeText={(value) => updateField(field, value)}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          keyboardType={keyboardType}
          autoCapitalize={
            keyboardType === 'email-address' ? 'none' : 'sentences'
          }
          editable={!saving}
        />
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>
              Manage your information and career goals.
            </Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile.name.trim()
                  ? profile.name.trim().charAt(0).toUpperCase()
                  : 'S'}
              </Text>
            </View>

            <View style={styles.statusInfo}>
              <Text style={styles.profileName}>
                {profile.name.trim() || 'Your Name'}
              </Text>
              <Text style={styles.profileDesignation}>
                {profile.designation.trim() || 'Add your designation'}
              </Text>
              <Text style={styles.statusText}>
                {saved ? 'Profile saved on this device' : 'Unsaved changes'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            {renderField('Full Name *', 'name', 'Enter your full name')}
            {renderField(
              'Email Address',
              'email',
              'Enter your email',
              false,
              'email-address'
            )}
            {renderField('Age', 'age', 'Enter your age', false, 'numeric')}
            {renderField(
              'Designation',
              'designation',
              'e.g. Student, Software Engineer'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {renderField('Degree', 'degree', 'e.g. BE Computer Science')}
            {renderField(
              'College / University',
              'college',
              'Enter institution name'
            )}
            {renderField(
              'Graduation Year',
              'graduationYear',
              'e.g. 2027',
              false,
              'numeric'
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <Text style={styles.label}>Experience Level</Text>

            <View style={styles.choiceRow}>
              {['Fresher', 'Experienced'].map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.choiceButton,
                    profile.experienceLevel === level &&
                      styles.choiceButtonActive,
                  ]}
                  onPress={() => {
                    updateField('experienceLevel', level);
                    if (level === 'Fresher') {
                      updateField('experienceYears', '0');
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      profile.experienceLevel === level &&
                        styles.choiceTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>

            {profile.experienceLevel === 'Experienced' &&
              renderField(
                'Years of Experience',
                'experienceYears',
                'e.g. 2',
                false,
                'numeric'
              )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Career Goals</Text>
            {renderField(
              'Technical Skills',
              'skills',
              'e.g. Java, SQL, Python, React Native',
              true
            )}
            {renderField(
              'Desired Job Role',
              'desiredRole',
              'e.g. Software Developer'
            )}
            {renderField(
              'Preferred Domain',
              'domain',
              'e.g. AI, Web Development, Data Science'
            )}
          </View>

          <Pressable
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>

            <Pressable
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loggingOut}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>

            <Pressable
              style={[
                styles.logoutButton,
                loggingOut && styles.disabledButton,
              ]}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color="#B91C1C" />
              ) : (
                <Text style={styles.logoutButtonText}>Logout</Text>
              )}
            </Pressable>
          </View>

          <Text style={styles.footer}>SkillGap • Build your career</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: { marginTop: 12, color: '#64748B', fontSize: 15 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 30, fontWeight: '700', color: '#172554' },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 25, fontWeight: '700', color: '#1D4ED8' },
  statusInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 19, fontWeight: '700', color: '#172554' },
  profileDesignation: { marginTop: 3, fontSize: 14, color: '#64748B' },
  statusText: { marginTop: 6, fontSize: 12, color: '#0F766E' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 18,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: { minHeight: 88 },
  choiceRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  choiceButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  choiceButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  choiceText: { color: '#475569', fontWeight: '600' },
  choiceTextActive: { color: '#1D4ED8' },
  saveButton: {
    backgroundColor: '#2563EB',
    minHeight: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  disabledButton: { opacity: 0.65 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButtonText: { color: '#2563EB', fontWeight: '700', fontSize: 15 },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#B91C1C', fontWeight: '700', fontSize: 15 },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
  },
});
