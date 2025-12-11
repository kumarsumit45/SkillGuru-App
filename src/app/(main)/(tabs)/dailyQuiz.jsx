import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingFilter from "../../../components/floatingFilters";
import QuizCard from "../../../components/quizCard";
import { fetchLiveQuizzesOnly, fetchUpcomingQuizzes, fetchUserQuizAttempts } from '../../../api/liveQuizApi';
import useAuthStore from '../../../store/authStore';

// Transform API response to match QuizCard expected format
const transformQuizData = (quiz, category) => {
  // Format question count from API
  let questions = 'N/A';
  let questionCount = 0;

  if (quiz.questionCount) {
    questions = String(quiz.questionCount);
    questionCount = quiz.questionCount;
  } else if (quiz.totalQuestions !== undefined) {
    questions = String(quiz.totalQuestions);
    questionCount = quiz.totalQuestions;
  } else if (quiz.quiz_metadata?.total_questions !== undefined) {
    questions = String(quiz.quiz_metadata.total_questions);
    questionCount = quiz.quiz_metadata.total_questions;
  } else if (quiz.questions) {
    if (Array.isArray(quiz.questions)) {
      questions = String(quiz.questions.length);
      questionCount = quiz.questions.length;
    } else if (typeof quiz.questions === 'number') {
      questions = String(quiz.questions);
      questionCount = quiz.questions;
    } else if (typeof quiz.questions === 'string') {
      questions = quiz.questions;
      questionCount = parseInt(quiz.questions) || 0;
    }
  }

  // Calculate duration from API metadata
  let duration = 'N/A';

  // First check if duration is directly provided
  if (quiz.duration) {
    duration = typeof quiz.duration === 'string' ? quiz.duration : `${quiz.duration} min`;
  } else if (quiz.durationMinutes) {
    duration = `${quiz.durationMinutes} min`;
  }
  // Calculate from totalQuestions and time_per_question
  else if (quiz.quiz_metadata?.time_per_question && questionCount > 0) {
    const totalSeconds = questionCount * quiz.quiz_metadata.time_per_question;
    const totalMinutes = Math.ceil(totalSeconds / 60);
    duration = `${totalMinutes} min`;
  }
  // Fallback: calculate from totalQuestions assuming 75 seconds per question
  else if (questionCount > 0) {
    const totalMinutes = Math.ceil((questionCount * 75) / 60);
    duration = `${totalMinutes} min`;
  }

  // Calculate time left for live quizzes based on expiry time
  let timeLeft = null;
  if (category === 'live') {
    try {
      // Use expiresAtUtc for accurate calculation (UTC is more reliable)
      const expiresAt = quiz.expiresAtUtc || quiz.expiresAtIst;

      if (expiresAt) {
        const expiryTime = new Date(expiresAt);
        const now = new Date();
        const diffMs = expiryTime - now;

        if (diffMs > 0) {
          const diffMinutes = Math.floor(diffMs / 60000);
          timeLeft = `${diffMinutes} min`;
        } else {
          timeLeft = 'Ended';
        }
      } else {
        // Fallback: check if timeLeft is directly provided
        timeLeft = quiz.timeLeft || quiz.timeRemaining || null;
      }
    } catch (error) {
      console.error('Error calculating time left:', error);
      timeLeft = quiz.timeLeft || quiz.timeRemaining || null;
    }
  } else {
    timeLeft = quiz.timeLeft || quiz.timeRemaining || null;
  }

  // Format tags - ensure it's always an array of strings
  let tags = [];
  if (quiz.tags) {
    if (Array.isArray(quiz.tags)) {
      tags = quiz.tags.map(tag => typeof tag === 'string' ? tag : tag.name || tag.label || 'Tag');
    }
  } else if (quiz.labels) {
    if (Array.isArray(quiz.labels)) {
      tags = quiz.labels.map(label => typeof label === 'string' ? label : label.name || label.label || 'Tag');
    }
  }

  // Extract language from API
  const language = quiz.language || quiz.quiz_metadata?.language || null;

  return {
    id: quiz.id || quiz._id || String(Math.random()),
    title: quiz.title || quiz.label || quiz.quizLabel || 'Quiz',
    subject: quiz.subject || quiz.quizSubject || 'General',
    startTime: quiz.startTime || quiz.slotDisplay || quiz.scheduledAt || 'N/A',
    difficulty: typeof quiz.difficulty === 'string' ? quiz.difficulty : 'intermediate',
    questions: questions,
    duration: duration,
    timeLeft: timeLeft,
    isLive: category === 'live',
    category: category,
    tags: tags,
    language: language,
    prize: quiz.prize || quiz.hasPrize || false,
    startedAgo: quiz.startedAgo || quiz.timeAgo || (category === 'upcoming' ? 'Upcoming' : 'Past'),
    score: quiz.score || quiz.scoreDisplay || '',
  };
};

const QuizArenaScreen = () => {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('live');
  const [allQuizzes, setAllQuizzes] = useState({
    live: [],
    upcoming: [],
    attempted: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all quizzes when language changes
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      setLoading(true);
      setError(null);

      try {
        let language = selectedLanguage === 'ALL' ? undefined : selectedLanguage.toLowerCase();

        // Fetch all three categories in parallel
        const [liveData, upcomingData, attemptedData] = await Promise.all([
          fetchLiveQuizzesOnly({ language }).catch(err => {
            console.error('Error fetching live quizzes:', err);
            return [];
          }),
          fetchUpcomingQuizzes({ language }).catch(err => {
            console.error('Error fetching upcoming quizzes:', err);
            return [];
          }),
          uid ? fetchUserQuizAttempts(uid).catch(err => {
            console.error('Error fetching attempted quizzes:', err);
            return [];
          }) : Promise.resolve([])
        ]);

        // Transform data for each category
        const transformedLive = liveData.map(quiz => transformQuizData(quiz, 'live'));
        const transformedUpcoming = upcomingData.map(quiz => transformQuizData(quiz, 'upcoming'));
        const transformedAttempted = attemptedData.map(quiz => transformQuizData(quiz, 'attempted'));

        setAllQuizzes({
          live: transformedLive,
          upcoming: transformedUpcoming,
          attempted: transformedAttempted
        });

        // Log counts for debugging
        console.log('Quiz counts:', {
          live: transformedLive.length,
          upcoming: transformedUpcoming.length,
          attempted: transformedAttempted.length
        });
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, [selectedLanguage, uid]);

  // Get quizzes for the selected category
  const filteredQuizzes = allQuizzes[selectedCategory] || [];

  // Get counts for each category - now showing all counts regardless of selection
  const categoryCounts = useMemo(() => {
    const counts = {
      live: allQuizzes.live?.length || 0,
      upcoming: allQuizzes.upcoming?.length || 0,
      attempted: allQuizzes.attempted?.length || 0,
    };
    console.log('Displaying category counts:', counts);
    return counts;
  }, [allQuizzes]);

  const categoryTabs = ['LIVE', 'UPCOMING', 'ATTEMPTED'];

  const handleStartQuiz = (quizId) => {
    console.log('Start Quiz:', quizId);

    // Find the quiz in the current category
    const selectedQuiz = filteredQuizzes.find(q => q.id === quizId);
    if (selectedQuiz) {

      if (selectedQuiz.category === 'live' || selectedQuiz.category === 'upcoming') {
        // Navigate to QuizDetails screen with quiz data
        router.push({
          pathname: '/(main)/QuizDetails',
          params: {
            quiz: JSON.stringify(selectedQuiz)
          }
        });
      } else if (selectedQuiz.category === 'attempted') {

        console.log('View Results for quiz:', quizId);
        // Navigate to results page when ready
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badgeText}>🟢  LIVE QUIZ ARENA</Text>
        <Text style={styles.headerTitle}>Live, upcoming & attempted quizzes</Text>
        <Text style={styles.headerSubtitle}>
          Pick a live quiz to join instantly, explore upcoming sessions or review your attempt history.
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Showing recommended quizzes across all categories and ranked from most visited.
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSection}>
        <Text style={styles.languageLabel}>LANGUAGE</Text>
        <View style={styles.languageTabs}>
          {[
            { label: 'ALL LANGUAGES', value: 'ALL' },
            { label: 'ENGLISH', value: 'ENGLISH' },
            { label: 'HINDI', value: 'HINDI' }
          ].map((lang) => (
            <TouchableOpacity
              key={lang.value}
              style={[
                styles.languageTab,
                selectedLanguage === lang.value && styles.languageTabActive,
              ]}
              onPress={() => setSelectedLanguage(lang.value)}
            >
              <Text
                style={[
                  styles.languageTabText,
                  selectedLanguage === lang.value && styles.languageTabTextActive,
                ]}
              >
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {categoryTabs.map((category) => {
          const categoryKey = category.toLowerCase();
          const count = categoryCounts[categoryKey] || 0;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === categoryKey && styles.categoryTabActive,
              ]}
              onPress={() => setSelectedCategory(categoryKey)}
            >
              <View style={styles.categoryBadge}>
                <Text style={[
                  styles.categoryBadgeText,
                  selectedCategory === categoryKey && styles.categoryBadgeTextActive
                ]}>
                  {category}
                </Text>
                <Text style={[
                  styles.categoryCount,
                  selectedCategory === categoryKey && styles.categoryCountActive
                ]}>
                  ({count})
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // Trigger refetch by toggling state
              setSelectedCategory(selectedCategory);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty State */}
      {!loading && !error && filteredQuizzes.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No {selectedCategory} quizzes available</Text>
          {selectedCategory === 'attempted' && !uid && (
            <Text style={styles.emptySubtext}>Please log in to see your attempted quizzes</Text>
          )}
        </View>
      )}

      {/* Quiz List */}
      {!loading && !error && filteredQuizzes.length > 0 && (
        <FlatList
          data={filteredQuizzes}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          renderItem={({ item }) => (
            <QuizCard quiz={item} onStartQuiz={handleStartQuiz} />
          )}
          contentContainerStyle={styles.quizList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Filter Button */}
      <FloatingFilter />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d0e7f7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "trasparent",
    marginVertical: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  languageSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  languageTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  languageTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  languageTabActive: {
    backgroundColor: '#DC2626',
  },
  languageTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  languageTabTextActive: {
    color: '#FFFFFF',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    // borderWidth:1
  },
  categoryTab: {
    flex: 1,
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  categoryBadge: {
    alignItems: 'center',
    // borderWidth:1
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  categoryBadgeTextActive: {
    color: '#DC2626',
  },
  categoryCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  categoryCountActive: {
    color: '#DC2626',
    fontWeight: '600',
  },
  quizList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#DC2626',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default QuizArenaScreen;