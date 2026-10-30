import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY = '@skillgap_profile';
const API_BASE_URL = 'http://10.210.26.153:3000';

type Job = {
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number | null;
  salaryMax: number | null;
  url: string;
  created: string | null;
};

type SkillRule = {
  name: string;
  patterns: RegExp[];
};

const SKILL_RULES: SkillRule[] = [
  { name: 'Java', patterns: [/\bjava\b/i] },
  { name: 'Python', patterns: [/\bpython\b/i] },
  { name: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i] },
  { name: 'TypeScript', patterns: [/\btypescript\b/i] },
  { name: 'C', patterns: [/\bc programming\b/i, /\blanguage c\b/i] },
  { name: 'C++', patterns: [/\bc\+\+\b/i] },
  { name: 'C#', patterns: [/\bc#\b/i, /\bc-sharp\b/i] },
  { name: 'SQL', patterns: [/\bsql\b/i] },
  { name: 'HTML', patterns: [/\bhtml5?\b/i] },
  { name: 'CSS', patterns: [/\bcss3?\b/i] },
  { name: 'React', patterns: [/\breact(?:\.js|js)?\b/i] },
  { name: 'React Native', patterns: [/\breact native\b/i] },
  { name: 'Node.js', patterns: [/\bnode\.?js\b/i] },
  { name: 'Express.js', patterns: [/\bexpress(?:\.js)?\b/i] },
  { name: 'Angular', patterns: [/\bangular\b/i] },
  { name: 'Vue.js', patterns: [/\bvue(?:\.js)?\b/i] },
  { name: 'Spring Boot', patterns: [/\bspring boot\b/i] },
  { name: 'Spring', patterns: [/\bspring framework\b/i] },
  { name: 'REST APIs', patterns: [/\brestful?\s*apis?\b/i, /\brest services\b/i] },
  { name: 'Microservices', patterns: [/\bmicroservices?\b/i] },
  { name: 'Git', patterns: [/\bgit\b/i, /\bgithub\b/i, /\bgitlab\b/i] },
  { name: 'Docker', patterns: [/\bdocker\b/i, /\bcontainerization\b/i] },
  { name: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'AWS', patterns: [/\baws\b/i, /\bamazon web services\b/i] },
  { name: 'Azure', patterns: [/\bmicrosoft azure\b/i, /\bazure\b/i] },
  { name: 'Google Cloud', patterns: [/\bgoogle cloud\b/i, /\bgcp\b/i] },
  { name: 'Linux', patterns: [/\blinux\b/i] },
  { name: 'Networking', patterns: [/\bnetworking\b/i, /\bcomputer networks?\b/i] },
  { name: 'Data Structures', patterns: [/\bdata structures?\b/i] },
  { name: 'Algorithms', patterns: [/\balgorithms?\b/i, /\bproblem.solving\b/i] },
  { name: 'OOP', patterns: [/\bobject.oriented programming\b/i, /\boop\b/i] },
  { name: 'Machine Learning', patterns: [/\bmachine learning\b/i] },
  { name: 'Deep Learning', patterns: [/\bdeep learning\b/i] },
  { name: 'Artificial Intelligence', patterns: [/\bartificial intelligence\b/i, /\bAI\b/i] },
  { name: 'Data Analysis', patterns: [/\bdata analysis\b/i, /\bdata analytics\b/i] },
  { name: 'Pandas', patterns: [/\bpandas\b/i] },
  { name: 'NumPy', patterns: [/\bnumpy\b/i] },
  { name: 'TensorFlow', patterns: [/\btensorflow\b/i] },
  { name: 'PyTorch', patterns: [/\bpytorch\b/i] },
  { name: 'MongoDB', patterns: [/\bmongodb\b/i] },
  { name: 'PostgreSQL', patterns: [/\bpostgres(?:ql)?\b/i] },
  { name: 'MySQL', patterns: [/\bmysql\b/i] },
  { name: 'Redis', patterns: [/\bredis\b/i] },
  { name: 'Power BI', patterns: [/\bpower\s*bi\b/i] },
  { name: 'Tableau', patterns: [/\btableau\b/i] },
  { name: 'Excel', patterns: [/\bexcel\b/i, /\bspreadsheets?\b/i] },
  { name: 'Cybersecurity', patterns: [/\bcybersecurity\b/i, /\binformation security\b/i] },
  { name: 'Testing', patterns: [/\bsoftware testing\b/i, /\btest automation\b/i] },
  { name: 'Agile', patterns: [/\bagile\b/i, /\bscrum\b/i] },
];

function normalizeSkill(skill: string) {
  return skill.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
}

function parseSkills(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[,;\n]/)
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map(normalizeSkill)
    ),
  ];
}

function hasSkill(userSkills: string[], requiredSkill: string) {
  const required = normalizeSkill(requiredSkill);

  const aliases: Record<string, string[]> = {
    js: ['javascript'],
    javascript: ['js'],
    ts: ['typescript'],
    typescript: ['ts'],
    oop: ['objectorientedprogramming'],
    objectorientedprogramming: ['oop'],
    restapis: ['restapi', 'restfulapis', 'rest'],
    restapi: ['restapis', 'restfulapis'],
    nodejs: ['node.js'],
    'node.js': ['nodejs'],
    cpp: ['c++'],
    csharp: ['c#'],
    ml: ['machinelearning'],
    machinelearning: ['ml'],
    ai: ['artificialintelligence'],
    artificialintelligence: ['ai'],
    k8s: ['kubernetes'],
  };

  const acceptedNames = [required, ...(aliases[required] || [])];

  return userSkills.some(
    (userSkill) =>
      acceptedNames.includes(userSkill) ||
      (aliases[userSkill] || []).some((alias) =>
        acceptedNames.includes(alias)
      )
  );
}

function extractSkills(jobs: Job[]) {
  return SKILL_RULES.map((rule) => {
    const count = jobs.filter((job) => {
      const text = `${job.title} ${job.description}`;
      return rule.patterns.some((pattern) => pattern.test(text));
    }).length;

    return { name: rule.name, count };
  })
    .filter((skill) => skill.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default function AnalyzeScreen() {
  const [profileSkills, setProfileSkills] = useState('');
  const [profileName, setProfileName] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [jobRole, setJobRole] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProfile() {
        setLoadingProfile(true);

        try {
          const stored = await AsyncStorage.getItem(PROFILE_KEY);

          if (!active) return;

          if (stored) {
            const data = JSON.parse(stored);
            setProfileSkills(
              typeof data.skills === 'string' ? data.skills : ''
            );
            setProfileName(
              typeof data.name === 'string' ? data.name : ''
            );
            setProfileLoaded(true);
          } else {
            setProfileSkills('');
            setProfileName('');
            setProfileLoaded(false);
          }
        } catch {
          if (active) {
            Alert.alert(
              'Could not load profile',
              'Please check your saved Profile details and try again.'
            );
          }
        } finally {
          if (active) setLoadingProfile(false);
        }
      }

      loadProfile();

      return () => {
        active = false;
      };
    }, [])
  );

  const userSkills = parseSkills(profileSkills);
  const detectedSkills = extractSkills(jobs);
  const minimumMentions = 1;
  const requiredSkills = detectedSkills.filter(
    (skill) => skill.count >= minimumMentions
  );

  const matchedSkills = requiredSkills.filter((skill) =>
    hasSkill(userSkills, skill.name)
  );

  const missingSkills = requiredSkills.filter(
    (skill) => !hasSkill(userSkills, skill.name)
  );

  const readiness =
    requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : null;

  async function runAnalysis() {
  if (!profileLoaded) {
    Alert.alert(
      'Profile required',
      'Please save your profile details first, including your skills.'
    );
    return;
  }

  if (!profileSkills.trim()) {
    Alert.alert(
      'Add your skills',
      'Open Profile, enter your skills separated by commas, and save.'
    );
    return;
  }

  const searchTerm = jobRole.trim();

  if (!searchTerm) {
    Alert.alert(
      'Enter a job role',
      'Please type the job role you want to analyze.'
    );
    return;
  }

  setLoadingJobs(true);
  setAnalyzed(false);
  setJobs([]);
  setTotalResults(0);
  setError('');

  try {
    const searchQueries = [
      searchTerm,
      ...new Set(
        searchTerm
          .toLowerCase()
          .replace(/[^a-z0-9+#.\s]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length > 2)
      ),
    ];

    let foundJobs: Job[] = [];
    let foundTotal = 0;
    let lastError = '';

    for (const query of searchQueries) {
      const url =
        `${API_BASE_URL}/api/jobs?what=${encodeURIComponent(query)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        lastError =
          data?.details ||
          data?.error ||
          `Request failed (${response.status})`;
        continue;
      }

      if (!Array.isArray(data.jobs)) {
        lastError = 'The backend response did not contain a jobs list.';
        continue;
      }

      if (data.jobs.length > 0) {
        foundJobs = data.jobs;
        foundTotal =
          typeof data.totalResults === 'number'
            ? data.totalResults
            : data.jobs.length;
        break;
      }
    }

    if (foundJobs.length === 0 && lastError) {
      throw new Error(lastError);
    }

    setJobs(foundJobs);
    setTotalResults(foundTotal);
    setAnalyzed(true);

    if (foundJobs.length === 0) {
      Alert.alert(
        'No jobs found',
        'Try a shorter or more common job title, such as Java Developer or Data Analyst.'
      );
    }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred.';

    setError(message);

    Alert.alert(
      'Job search failed',
      `${message}\n\nCheck that your backend is running and your phone/computer can reach it.`
    );
  } finally {
    setLoadingJobs(false);
  }
}

  function renderSkillChip(
    skill: string,
    type: 'matched' | 'missing'
  ) {
    return (
      <View
        key={skill}
        style={[
          styles.skillChip,
          type === 'matched' ? styles.matchedChip : styles.missingChip,
        ]}
      >
        <Text
          style={[
            styles.skillChipText,
            type === 'matched' ? styles.matchedText : styles.missingText,
          ]}
        >
          {type === 'matched' ? '✓ ' : '+ '}
          {skill}
        </Text>
      </View>
    );
  }

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.muted}>Loading your saved skills...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Analyze Your Skills</Text>
        <Text style={styles.subtitle}>
          Search jobs for your target role and compare their skills with your Profile.
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileIconText}>
              {profileLoaded && profileName
                ? profileName.charAt(0).toUpperCase()
                : '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileHeading}>
              {profileLoaded ? profileName || 'Your Profile' : 'Profile not saved yet'}
            </Text>
            <Text style={styles.profileSubtext}>
              {userSkills.length} skill{userSkills.length === 1 ? '' : 's'} loaded from Profile
            </Text>
          </View>
        </View>

        {!profileLoaded && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Save your details in the Profile tab first.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your Target Job</Text>
          <Text style={styles.label}>Job title</Text>
          <TextInput
            style={styles.input}
            value={jobRole}
            onChangeText={(value) => {
              setJobRole(value);
              setAnalyzed(false);
              setError('');
            }}
            placeholder="e.g. Java Developer"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
            returnKeyType="search"
            onSubmitEditing={runAnalysis}
          />

          <Pressable
            style={[
              styles.analyzeButton,
              loadingJobs && styles.disabledButton,
            ]}
            onPress={runAnalysis}
            disabled={loadingJobs}
          >
            {loadingJobs ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.analyzeButtonText}>Find Jobs & Analyze</Text>
            )}
          </Pressable>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        {loadingJobs && (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={[styles.muted, styles.centerText]}>
              Fetching job postings...
            </Text>
          </View>
        )}

        {analyzed && !loadingJobs && (
          <>
            

            {jobs.length > 0 && (
              <>
                <View style={styles.resultCard}>
                  <Text style={styles.sectionTitle}>Readiness Estimate</Text>

                  {readiness === null ? (
                    <Text style={styles.muted}>
                      No candidate skills were identified for comparison. Try another job title.
                    </Text>
                  ) : (
                    <>
                      <View style={styles.scoreRow}>
                        <View style={styles.scoreCircle}>
                          <Text style={styles.scoreNumber}>{readiness}%</Text>
                          <Text style={styles.scoreLabel}>Skill match</Text>
                        </View>

                        <View style={styles.scoreDetails}>
                          <Text style={styles.scoreDetail}>
                            {matchedSkills.length} of {requiredSkills.length}
                          </Text>
                          <Text style={styles.muted}>
                            skills matched
                          </Text>
                        </View>
                      </View>

                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${readiness}%` },
                          ]}
                        />
                      </View>

                      <View style={styles.legendRow}>
                        <Text style={styles.legendGreen}>
                          Matched: {matchedSkills.length}
                        </Text>
                        <Text style={styles.legendRed}>
                          Missing: {missingSkills.length}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Skills You Already Have</Text>
                  {matchedSkills.length > 0 ? (
                    <View style={styles.chipContainer}>
                      {matchedSkills.map((skill) =>
                        renderSkillChip(skill.name, 'matched')
                      )}
                    </View>
                  ) : (
                    <Text style={styles.muted}>
                      No matching skills found.
                    </Text>
                  )}
                </View>

                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Skills to Learn Next</Text>
                  {missingSkills.length > 0 ? (
                    <View style={styles.chipContainer}>
                      {missingSkills.map((skill) =>
                        renderSkillChip(skill.name, 'missing')
                      )}
                    </View>
                  ) : (
                    <Text style={styles.muted}>
                      No missing skills identified.
                    </Text>
                  )}
                </View>


                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Job Postings</Text>
                  {jobs.slice(0, 5).map((job, index) => (
                    <View key={`${job.title}-${index}`} style={styles.jobRow}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Text style={styles.jobCompany}>{job.company}</Text>
                      <Text style={styles.muted}>{job.location}</Text>
                      {(job.salaryMin !== null || job.salaryMax !== null) && (
                        <Text style={styles.salaryText}>
                          Salary: {job.salaryMin !== null ? job.salaryMin.toLocaleString() : '?'}
                          {' – '}
                          {job.salaryMax !== null ? job.salaryMax.toLocaleString() : '?'}
                        </Text>
                      )}
                      {job.url ? (
                        <Text
                          style={styles.jobUrl}
                          onPress={() => {
                            Alert.alert(
                              'Job link',
                              'Open this posting using its URL:\n' + job.url
                            );
                          }}
                        >
                          View posting URL
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        <Text style={styles.footer}>SkillGap • Career readiness</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 29, fontWeight: '700', color: '#172554' },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 23,
    color: '#64748B',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 18,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: { fontSize: 22, fontWeight: '700', color: '#1D4ED8' },
  profileInfo: { marginLeft: 12, flex: 1 },
  profileHeading: { fontSize: 16, fontWeight: '700', color: '#172554' },
  profileSubtext: { fontSize: 13, color: '#64748B', marginTop: 4 },
  notice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 13,
    marginBottom: 16,
  },
  noticeText: { color: '#92400E', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#172554',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
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
  },
  analyzeButton: {
    backgroundColor: '#2563EB',
    minHeight: 51,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: { opacity: 0.7 },
  analyzeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#BE123C', fontSize: 13, marginTop: 12, lineHeight: 19 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  resultRole: {
    fontSize: 14,
    color: '#64748B',
    marginTop: -8,
    marginBottom: 10,
  },
  resultCount: {
    fontSize: 13,
    color: '#1D4ED8',
    marginBottom: 10,
    lineHeight: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginVertical: 10,
  },
  scoreCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 7,
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: { fontSize: 27, fontWeight: '800', color: '#1D4ED8' },
  scoreLabel: { fontSize: 11, color: '#475569', marginTop: 2 },
  scoreDetails: { flex: 1 },
  scoreDetail: { fontSize: 20, fontWeight: '700', color: '#172554' },
  muted: { color: '#64748B', fontSize: 13, lineHeight: 20 },
  centerText: { textAlign: 'center', marginTop: 12 },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 6 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  legendGreen: { color: '#047857', fontSize: 12, fontWeight: '600' },
  legendRed: { color: '#BE123C', fontSize: 12, fontWeight: '600' },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  skillChip: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
  },
  matchedChip: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  missingChip: { backgroundColor: '#FFF1F2', borderColor: '#FECDD3' },
  skillChipText: { fontSize: 12, fontWeight: '600' },
  matchedText: { color: '#047857' },
  missingText: { color: '#BE123C' },
  jobRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 13,
  },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '700', color: '#172554' },
  jobCompany: { fontSize: 13, color: '#334155', marginTop: 4 },
  salaryText: { fontSize: 12, color: '#047857', marginTop: 5 },
  jobUrl: {
    fontSize: 12,
    color: '#2563EB',
    marginTop: 7,
    textDecorationLine: 'underline',
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 8,
  },
});
