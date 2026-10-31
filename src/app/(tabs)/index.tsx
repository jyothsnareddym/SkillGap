
import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Use the same backend IP as your working Statistics screen.
const API_BASE_URL = 'https://skillgap-backend-fatp.onrender.com';

type NewsCategory = 'technology' | 'hiring' | 'layoffs' | 'skills';

type Article = {
  id: string;
  title: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string | null;
  points: number;
};

const categories: {
  key: NewsCategory;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    key: 'technology',
    label: 'Technology',
    icon: '💻',
    description: 'Technology, AI and software news',
  },
  {
    key: 'hiring',
    label: 'Hiring',
    icon: '📈',
    description: 'Stories about hiring and job opportunities',
  },
  {
    key: 'layoffs',
    label: 'Layoffs',
    icon: '📰',
    description: 'Reports and discussions about tech layoffs',
  },
  {
    key: 'skills',
    label: 'Trending Skills',
    icon: '⚡',
    description: 'Programming and developer skill trends',
  },
];

function formatDate(dateString: string | null) {
  if (!dateString) return 'Date unavailable';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString();
}

export default function HomeScreen() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] =
    useState<NewsCategory>('technology');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  function goTo(path: string) {
    router.push(path as Href);
  }

  
const fetchNews = useCallback(
  async (category: NewsCategory, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    if (!isRefresh) {
      setError('');
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/news?category=${encodeURIComponent(category)}&_=${Date.now()}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`News request failed (${response.status})`);
      }

      const data = await response.json();

      if (!Array.isArray(data.articles)) {
        throw new Error('The server returned an unexpected response.');
      }

      // Replace the feed only after a successful response.
      setArticles(data.articles);
      setError('');
    } catch (err) {
      console.error('Home news error:', err);

      // Keep existing articles visible if a refresh fails.
      if (!isRefresh) {
        setArticles([]);
        setError(
          'Unable to load news. Check your connection and try again.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  []
);


  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory, fetchNews]);

  async function openArticle(url: string) {
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Unable to open article:', err);
    }
  }

  const selectedCategory = categories.find(
    (category) => category.key === activeCategory
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchNews(activeCategory, true)}
            tintColor="#3049A0"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SkillGap</Text>
            <Text style={styles.tagline}>
              Your career. Your next move.
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => goTo('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Text style={styles.profileInitial}>S</Text>
          </Pressable>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeEyebrow}>
            YOUR CAREER JOURNEY
          </Text>

          <Text style={styles.welcomeTitle}>
            Build skills. Find opportunities.
          </Text>

          <Text style={styles.welcomeDescription}>
            Understand your strengths, discover suitable roles,
            and work towards your career goals.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => goTo('/(tabs)/analyze')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              Analyze my skills →
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Explore your career
          </Text>
          <Text style={styles.sectionSubtitle}>
            Choose your next step
          </Text>
        </View>

        <View style={styles.actionGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => goTo('/(tabs)/analyze')}
          >
            <View style={styles.iconBoxBlue}>
              <Text style={styles.actionIcon}>🎯</Text>
            </View>
            <Text style={styles.actionTitle}>Analyze</Text>
            <Text style={styles.actionDescription}>
              Check your readiness for a role.
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => goTo('/(tabs)/discover')}
          >
            <View style={styles.iconBoxPurple}>
              <Text style={styles.actionIcon}>🧭</Text>
            </View>
            <Text style={styles.actionTitle}>Discover</Text>
            <Text style={styles.actionDescription}>
              Explore roles that suit your profile.
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => goTo('/(tabs)/tasks')}
          >
            <View style={styles.iconBoxGreen}>
              <Text style={styles.actionIcon}>✓</Text>
            </View>
            <Text style={styles.actionTitle}>My Tasks</Text>
            <Text style={styles.actionDescription}>
              Organize your learning goals.
            </Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => goTo('/(tabs)/statistics')}
          >
            <View style={styles.iconBoxOrange}>
              <Text style={styles.actionIcon}>📊</Text>
            </View>
            <Text style={styles.actionTitle}>Statistics</Text>
            <Text style={styles.actionDescription}>
              Explore career and market data.
            </Text>
          </Pressable>
        </View>

        <View style={styles.newsHeading}>
          <View style={styles.newsHeadingText}>
            <Text style={styles.sectionTitle}>
              Job Market Updates
            </Text>
            <Text style={styles.sectionSubtitle}>
              Explore technology and career-related stories
            </Text>
          </View>
          <Text style={styles.newsIcon}>🌐</Text>
        </View>

        <View style={styles.newsNotice}>
          <Text style={styles.noticeTitle}>
            Stay informed
          </Text>
          <Text style={styles.noticeDescription}>
            Browse stories from Hacker News. Tap an article to
            read the original report or discussion. These are
            community news stories, not verified job vacancies.
          </Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              News feed connected
            </Text>
          </View>
        </View>

        <Text style={styles.categoryHeading}>
          Choose a category
        </Text>

        <View style={styles.categoryGrid}>
          {categories.map((category) => {
            const isActive = activeCategory === category.key;

            return (
              <Pressable
                key={category.key}
                style={[
                  styles.categoryButton,
                  isActive && styles.categoryButtonActive,
                ]}
                onPress={() => setActiveCategory(category.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={styles.categoryEmoji}>
                  {category.icon}
                </Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isActive && styles.categoryLabelActive,
                  ]}
                >
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {selectedCategory && (
          <View style={styles.feedHeading}>
            <View style={styles.feedHeadingText}>
              <Text style={styles.feedTitle}>
                {selectedCategory.label}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {selectedCategory.description}
              </Text>
            </View>

            <Pressable
              style={styles.refreshButton}
              onPress={() => fetchNews(activeCategory, true)}
              accessibilityRole="button"
              accessibilityLabel="Refresh news"
            >
              <Text style={styles.refreshButtonText}>↻</Text>
            </Pressable>
          </View>
        )}

        {loading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#3049A0" />
            <Text style={styles.stateText}>
              Loading the latest stories...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>⚠️</Text>
            <Text style={styles.stateTitle}>
              Could not load stories
            </Text>
            <Text style={styles.stateText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => fetchNews(activeCategory)}
            >
              <Text style={styles.retryButtonText}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : articles.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateIcon}>📰</Text>
            <Text style={styles.stateTitle}>
              No stories found
            </Text>
            <Text style={styles.stateText}>
              There are no matching stories right now. Try
              refreshing or choose another category.
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => fetchNews(activeCategory)}
            >
              <Text style={styles.retryButtonText}>
                Refresh stories
              </Text>
            </Pressable>
          </View>
        ) : (
          articles.map((article) => (
            <Pressable
              key={article.id}
              style={styles.articleCard}
              onPress={() => openArticle(article.url)}
              accessibilityRole="link"
            >
              <View style={styles.articleTopRow}>
                <Text style={styles.articleSource}>
                  {article.source || 'News source'}
                </Text>
                <Text style={styles.articlePoints}>
                  ▲ {article.points}
                </Text>
              </View>

              <Text style={styles.articleTitle}>
                {article.title}
              </Text>

              <View style={styles.articleBottomRow}>
                <Text style={styles.articleMeta}>
                  {formatDate(article.publishedAt)}
                </Text>
                <Text style={styles.readArticle}>
                  Read article ↗
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <Text style={styles.footer}>
          Small steps today. Stronger skills tomorrow.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  brand: {
    fontSize: 27,
    fontWeight: '800',
    color: '#233B80',
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 13,
    color: '#68738A',
    marginTop: 3,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3E9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3049A0',
  },
  welcomeCard: {
    backgroundColor: '#243B80',
    padding: 22,
    borderRadius: 22,
    marginBottom: 28,
  },
  welcomeEyebrow: {
    color: '#C9D6FF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  welcomeDescription: {
    color: '#E0E7FF',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 11,
  },
  primaryButtonText: {
    color: '#243B80',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#192544',
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#778198',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 30,
  },
  actionCard: {
    width: '48.3%',
    minHeight: 160,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECF4',
  },
  iconBoxBlue: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E7EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBoxPurple: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0F7EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBoxOrange: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionTitle: {
    color: '#202B49',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  actionDescription: {
    color: '#778198',
    fontSize: 12,
    lineHeight: 18,
  },
  newsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  newsHeadingText: {
    flex: 1,
  },
  newsIcon: {
    fontSize: 27,
    marginLeft: 12,
  },
  newsNotice: {
    backgroundColor: '#EAF0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
  },
  noticeTitle: {
    color: '#243B80',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  noticeDescription: {
    color: '#53617E',
    fontSize: 13,
    lineHeight: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
    gap: 7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#24A36B',
  },
  statusText: {
    color: '#596783',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryHeading: {
    color: '#192544',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 24,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E7F1',
  },
  categoryButtonActive: {
    backgroundColor: '#243B80',
    borderColor: '#243B80',
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryLabel: {
    color: '#4D5872',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  feedHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  feedHeadingText: {
    flex: 1,
  },
  feedTitle: {
    color: '#192544',
    fontSize: 19,
    fontWeight: '800',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E3E9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  refreshButtonText: {
    color: '#3049A0',
    fontSize: 26,
    fontWeight: '600',
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E9ECF4',
    padding: 16,
    marginBottom: 11,
  },
  articleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  articleSource: {
    color: '#5369AE',
    fontSize: 11,
    fontWeight: '800',
  },
  articlePoints: {
    color: '#7C879D',
    fontSize: 11,
    fontWeight: '600',
  },
  articleTitle: {
    color: '#202B49',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 13,
  },
  articleBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  articleMeta: {
    color: '#858EA2',
    fontSize: 11,
  },
  readArticle: {
    color: '#3049A0',
    fontSize: 11,
    fontWeight: '800',
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECF4',
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  stateIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  stateTitle: {
    color: '#202B49',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  stateText: {
    color: '#778198',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: '#243B80',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#9098AA',
    fontSize: 12,
    marginTop: 22,
  },
});
