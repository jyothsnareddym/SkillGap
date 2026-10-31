
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

const API_BASE_URL = 'https://skillgap-backend-fatp.onrender.com';
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

type Job = {
  title?: string;
  company?: string;
  created?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
};

function TrendChart({
  values,
  color = '#3478F6',
}: {
  values: number[];
  color?: string;
}) {
  const width = 300;
  const height = 150;
  const left = 12;
  const right = 288;
  const top = 12;
  const bottom = 112;
  const max = Math.max(...values, 1);

  const points = values.map((value, index) => {
    const x =
      left +
      (index * (right - left)) / Math.max(values.length - 1, 1);
    const y = bottom - (value / max) * (bottom - top);
    return { x, y };
  });

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    )
    .join(' ');

  const areaPath =
    path + ` L ${right} ${bottom} L ${left} ${bottom} Z`;

  return (
    <View style={styles.chartContainer}>
      <Svg width="100%" height={150} viewBox={`0 0 ${width} ${height}`}>
        {[30, 55, 80, 105].map((y) => (
          <Line
            key={y}
            x1={left}
            y1={y}
            x2={right}
            y2={y}
            stroke="#E8EEF8"
            strokeWidth="1"
          />
        ))}

        <Path d={areaPath} fill={color} opacity={0.09} />

        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill={color}
          />
        ))}
      </Svg>

      <View style={styles.yearRow}>
        {YEARS.map((year) => (
          <Text key={year} style={styles.yearText}>
            {year}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function StatisticsScreen() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchStatistics = useCallback(async (searchRole: string) => {
  const cleanedRole = searchRole.trim();

  if (!cleanedRole) {
    setError('Please enter a job role to search.');
    return;
  }

  setLoading(true);
  setError('');
  setHasSearched(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const searchQueries = [
      cleanedRole,
      ...new Set(
        cleanedRole
          .toLowerCase()
          .replace(/[^a-z0-9+#.\s]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length > 2)
      ),
    ];

    let foundJobs: Job[] = [];
    let foundRole = cleanedRole;
    let lastError = '';

    for (const query of searchQueries) {
      const response = await fetch(
        `${API_BASE_URL}/api/jobs?what=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        lastError = `Request failed: ${response.status}`;
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data.jobs)) {
        lastError = 'The API did not return a jobs array.';
        continue;
      }

      if (data.jobs.length > 0) {
        foundJobs = data.jobs;
        foundRole = query;
        break;
      }
    }

    if (foundJobs.length === 0 && lastError) {
      throw new Error(lastError);
    }

    setJobs(foundJobs);
    setRole(foundRole);
  } catch (err) {
    setJobs([]);

    setError(
      err instanceof Error && err.name === 'AbortError'
        ? 'The request timed out. Check whether your backend is running and reachable.'
        : 'Unable to fetch job data. Check your backend connection and API response.'
    );
  } finally {
    clearTimeout(timeoutId);
    setLoading(false);
  }
}, []);

  const demandValues = YEARS.map((year) =>
    jobs.filter((job) => {
      if (!job.created) return false;
      const date = new Date(job.created);

      return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === year
      );
    }).length
  );

  const salaryValues = YEARS.map((year) => {
    const salaries = jobs
      .filter((job) => {
        if (!job.created) return false;
        const date = new Date(job.created);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === year
        );
      })
      .map((job) => {
        const min = Number(job.salaryMin);
        const max = Number(job.salaryMax);

        if (min > 0 && max > 0) return (min + max) / 2;
        if (min > 0) return min;
        if (max > 0) return max;
        return 0;
      })
      .filter((value) => value > 0);

    return salaries.length
      ? salaries.reduce((sum, value) => sum + value, 0) /
          salaries.length
      : 0;
  });

  const nonZeroDemand = demandValues.filter((value) => value > 0);

  const demandStatus =
    nonZeroDemand.length < 2
      ? 'Insufficient data'
      : demandValues[5] > demandValues[4]
        ? 'High Demand'
        : demandValues[5] < demandValues[4]
          ? 'Low Demand'
          : 'Medium Demand';

  const demandColor =
    demandStatus === 'High Demand'
      ? '#16865C'
      : demandStatus === 'Low Demand'
        ? '#C24141'
        : '#B7791F';

  const companies = Array.from(
    new Set(
      jobs
        .map((job) => job.company?.trim())
        .filter(
          (name): name is string =>
            !!name && name.toLowerCase() !== 'not specified'
        )
    )
  ).slice(0, 10);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SKILLGAP</Text>
            <Text style={styles.pageTitle}>Statistics</Text>
            <Text style={styles.subtitle}>
              Explore career market trends
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileIcon}>●</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search a job role"
            placeholderTextColor="#8997B0"
            returnKeyType="search"
            autoCapitalize="words"
            onSubmitEditing={() => fetchStatistics(query)}
          />

          <Pressable
            style={[
              styles.searchButton,
              loading && styles.disabledButton,
            ]}
            onPress={() => fetchStatistics(query)}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>
              {loading ? 'Searching...' : 'Search'}
            </Text>
          </Pressable>
        </View>

        {error !== '' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>

            {query.trim() !== '' && !loading && (
              <Pressable
                style={styles.retryButton}
                onPress={() => fetchStatistics(query)}
              >
                <Text style={styles.searchButtonText}>Try again</Text>
              </Pressable>
            )}
          </View>
        )}

        {!hasSearched ? (
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⌕</Text>
            </View>

            <Text style={styles.cardTitle}>
              Explore job market trends
            </Text>

            <Text style={styles.emptySubtitle}>
              Enter a job role above and tap Search to explore job
              demand, salary trends, and companies hiring.
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3478F6" />
            <Text style={styles.loadingText}>
              Fetching statistics for {query.trim()}...
            </Text>
          </View>
        ) : error !== '' ? null : (
          <>
            <Text style={styles.resultsLabel}>JOB ROLE</Text>
            <Text style={styles.roleTitle}>{role}</Text>

            {jobs.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>No matching jobs found</Text>
                <Text style={styles.emptySubtitle}>
                  Try another job title or a broader search term.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.card}>
                  <View style={styles.cardHeading}>
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconText}>↗</Text>
                    </View>

                    <View style={styles.headingText}>
                      <Text style={styles.cardTitle}>Demand Trends</Text>
                      <Text style={styles.cardSubtitle}>
                        Year-wise activity in the returned job sample
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${demandColor}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: demandColor },
                        ]}
                      >
                        {demandStatus === 'High Demand'
                          ? '↑ High'
                          : demandStatus === 'Low Demand'
                            ? '↓ Low'
                            : demandStatus === 'Medium Demand'
                              ? '→ Medium'
                              : '—'}
                      </Text>
                    </View>
                  </View>

                  {demandValues.some((value) => value > 0) ? (
                    <TrendChart values={demandValues} />
                  ) : (
                    <Text style={styles.emptySubtitle}>
                      No usable posting dates were returned for the
                      selected years.
                    </Text>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeading}>
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: '#F0EAFF' },
                      ]}
                    >
                      <Text
                        style={[styles.iconText, { color: '#7357E8' }]}
                      >
                        ⌁
                      </Text>
                    </View>

                    <View style={styles.headingText}>
                      <Text style={styles.cardTitle}>Salary Trends</Text>
                      <Text style={styles.cardSubtitle}>
                        Average reported salary by posting year
                      </Text>
                    </View>
                  </View>

                  {salaryValues.some((value) => value > 0) ? (
                    <TrendChart
                      values={salaryValues}
                      color="#7357E8"
                    />
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyTitle}>
                        Salary trend unavailable
                      </Text>
                      <Text style={styles.emptySubtitle}>
                        No reported salary figures were returned for
                        this role.
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeading}>
                    <View style={styles.iconCircle}>
                      <Text style={styles.iconText}>▦</Text>
                    </View>

                    <View style={styles.headingText}>
                      <Text style={styles.cardTitle}>
                        Companies Hiring
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Companies in matching job listings
                      </Text>
                    </View>
                  </View>

                  {companies.length > 0 ? (
                    companies.map((company, index) => (
                      <View key={company}>
                        {index > 0 && <View style={styles.divider} />}

                        <View style={styles.companyRow}>
                          <View style={styles.companyIcon}>
                            <Text style={styles.buildingIcon}>▦</Text>
                          </View>

                          <Text style={styles.companyName}>
                            {company}
                          </Text>

                          <Text style={styles.chevron}>›</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptySubtitle}>
                      No company names were returned for this role.
                    </Text>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FD',
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  brand: {
    color: '#3478F6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#102348',
  },
  subtitle: {
    color: '#7183A5',
    fontSize: 14,
    marginTop: 6,
  },
  profileCircle: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: '#DFEAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 21,
    color: '#3478F6',
  },
  searchRow: {
    gap: 10,
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E3F8',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#14284C',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3158D4',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#8390A8',
    fontWeight: '700',
  },
  roleTitle: {
    color: '#102348',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E7EDF8',
    elevation: 2,
    shadowColor: '#B7C8E5',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headingText: {
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 25,
    fontWeight: '700',
    color: '#3478F6',
  },
  cardTitle: {
    color: '#102348',
    fontSize: 19,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#7A8BA9',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  chartContainer: {
    width: '100%',
    marginTop: 4,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  yearText: {
    fontSize: 11,
    color: '#7183A5',
  },
  emptyState: {
    backgroundColor: '#F5F7FC',
    borderRadius: 14,
    padding: 18,
  },
  emptyTitle: {
    color: '#243B60',
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#7888A3',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EDF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buildingIcon: {
    color: '#3478F6',
    fontSize: 22,
  },
  companyName: {
    flex: 1,
    color: '#243B60',
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 25,
    color: '#91A2BD',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF1F8',
  },
  errorCard: {
    backgroundColor: '#FFF1F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  errorText: {
    color: '#B42318',
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3158D4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#7183A5',
    fontSize: 14,
    marginTop: 14,
    textAlign: 'center',
  },
});
