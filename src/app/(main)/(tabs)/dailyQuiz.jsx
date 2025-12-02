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

const QuizArenaScreen = () => {
  const router = useRouter();
  const { uid } = useAuthStore();
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('live');
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform API response to match QuizCard expected format
  const transformQuizData = (quiz, category) => {
    // Format duration
    let duration = '30 min';
    if (quiz.duration) {
      duration = typeof quiz.duration === 'string' ? quiz.duration : `${quiz.duration} min`;
    } else if (quiz.durationMinutes) {
      duration = `${quiz.durationMinutes} min`;
    }

    // Format question count - handle if questions is an array of objects
    let questions = '10';
    if (quiz.questionCount) {
      questions = String(quiz.questionCount);
    } else if (quiz.questions) {
      if (Array.isArray(quiz.questions)) {
        questions = String(quiz.questions.length);
      } else if (typeof quiz.questions === 'number') {
        questions = String(quiz.questions);
      } else if (typeof quiz.questions === 'string') {
        questions = quiz.questions;
      }
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

    return {
      id: quiz.id || quiz._id || String(Math.random()),
      title: quiz.title || quiz.label || quiz.quizLabel || 'Quiz',
      subject: quiz.subject || quiz.quizSubject || 'General',
      startTime: quiz.startTime || quiz.slotDisplay || quiz.scheduledAt || 'N/A',
      difficulty: typeof quiz.difficulty === 'string' ? quiz.difficulty : 'intermediate',
      questions: questions,
      duration: duration,
      timeLeft: quiz.timeLeft || quiz.timeRemaining || '0 min',
      isLive: category === 'live',
      category: category,
      tags: tags,
      prize: quiz.prize || quiz.hasPrize || false,
      startedAgo: quiz.startedAgo || quiz.timeAgo || (category === 'upcoming' ? 'Upcoming' : 'Past'),
      score: quiz.score || quiz.scoreDisplay || '',
    };
  };

  // Fetch quizzes based on selected category and language
  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      setError(null);

      try {
        let language = selectedLanguage === 'ALL' ? undefined : selectedLanguage.toLowerCase();
        let fetchedQuizzes = [];

        switch (selectedCategory) {
          case 'live':
            fetchedQuizzes = await fetchLiveQuizzesOnly({ language });
            fetchedQuizzes = fetchedQuizzes.map(quiz => transformQuizData(quiz, 'live'));
            break;

          case 'upcoming':
            fetchedQuizzes = await fetchUpcomingQuizzes({ language });
            fetchedQuizzes = fetchedQuizzes.map(quiz => transformQuizData(quiz, 'upcoming'));
            break;

          case 'attempted':
            if (uid) {
              fetchedQuizzes = await fetchUserQuizAttempts(uid);
              fetchedQuizzes = fetchedQuizzes.map(quiz => transformQuizData(quiz, 'attempted'));
            }
            break;

          default:
            fetchedQuizzes = [];
        }

        setQuizData(fetchedQuizzes);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedCategory, selectedLanguage, uid]);

  // No need to filter since we're already fetching by category
  const filteredQuizzes = quizData;

  // Get counts for each category (we'll just use the current count for the selected category)
  const categoryCounts = useMemo(() => {
    return {
      live: selectedCategory === 'live' ? quizData.length : 0,
      upcoming: selectedCategory === 'upcoming' ? quizData.length : 0,
      attempted: selectedCategory === 'attempted' ? quizData.length : 0,
    };
  }, [selectedCategory, quizData]);

  const categoryTabs = ['LIVE', 'UPCOMING', 'ATTEMPTED'];

  const handleStartQuiz = (quizId) => {
    console.log('Start Quiz:', quizId);

    const selectedQuiz = quizData.find(q => q.id === quizId);
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
        {categoryTabs.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category.toLowerCase() && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.toLowerCase())}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{category}</Text>
              <Text style={styles.categoryCount}>({categoryCounts[category.toLowerCase()]})</Text>
            </View>
          </TouchableOpacity>
        ))}
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
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  categoryCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
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