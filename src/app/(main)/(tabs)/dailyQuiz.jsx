import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FloatingFilter from "../../../components/floatingFilters";
import QuizCard from "../../../components/quizCard";
import WinnerCard from "../../../components/winnerCard";
import { fetchLiveQuizzesOnly, fetchUpcomingQuizzes, fetchUserQuizAttempts, fetchPracticeQuizzes, fetchDailyWinners } from '../../../api/liveQuizApi';
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

  
  let duration = 'N/A';


  if (quiz.duration) {
    duration = typeof quiz.duration === 'string' ? quiz.duration : `${quiz.duration} min`;
  } else if (quiz.durationMinutes) {
    duration = `${quiz.durationMinutes} min`;
  }
  // Calculate from totalQuestions and time_per_question
  else if (quiz.quiz_metadata?.time_per_question && questionCount > 0) {
    // Subtract 15 seconds from each question's time (75 - 15 = 60 seconds per question)
    const totalSeconds = questionCount * (quiz.quiz_metadata.time_per_question - 15);
    const totalMinutes = Math.ceil(totalSeconds / 60);
    duration = `${totalMinutes} min`;
  }
  // Fallback: calculate from totalQuestions assuming 60 seconds per question
  else if (questionCount > 0) {
    const totalMinutes = Math.ceil((questionCount * 60) / 60);
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
    startedAgo: quiz.startedAgo || quiz.timeAgo || (category === 'upcoming' ? 'Upcoming' : category === 'practice' ? 'Practice' : 'Past'),
    score: quiz.score || quiz.scoreDisplay || '',
  };
};

const QuizArenaScreen = () => {
  const router = useRouter();
  const { uid } = useAuthStore();
  const filterRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('live');
  const [allQuizzes, setAllQuizzes] = useState({
    live: [],
    upcoming: [],
    practice: [],
    attempted: [],
    winner: []
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({
    selectedCategories: [],
    selectedClasses: [],
    selectedSSCExams: [],
    selectedPopularExams: []
  });
  const [displayCount, setDisplayCount] = useState(15);

  // Winners tab specific state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [winnersLoading, setWinnersLoading] = useState(false);
  const [winnersError, setWinnersError] = useState(null);
  const [dailyWinnersData, setDailyWinnersData] = useState({
    slots: [],
    totalSlots: 0,
    date: null
  });

  // Fetch all quizzes when language changes
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Convert language to proper format for API (capitalize first letter)
        let language = selectedLanguage === 'ALL'
          ? undefined
          : selectedLanguage.charAt(0) + selectedLanguage.slice(1).toLowerCase(); // "ENGLISH" -> "English"

        console.log('Fetching quizzes with language:', language);

        // Fetch all categories in parallel
        const [liveData, upcomingData, practiceData, attemptedData] = await Promise.all([
          fetchLiveQuizzesOnly({ language }).catch(err => {
            console.error('Error fetching live quizzes:', err);
            return [];
          }),
          fetchUpcomingQuizzes({ language }).catch(err => {
            console.error('Error fetching upcoming quizzes:', err);
            return [];
          }),
          fetchPracticeQuizzes({ language, limit: 200 }).catch(err => {
            console.error('Error fetching practice quizzes:', err);
            return { items: [] };
          }),
          uid ? fetchUserQuizAttempts(uid).catch(err => {
            console.error('Error fetching attempted quizzes:', err);
            return [];
          }) : Promise.resolve([])
        ]);

        // Transform data for each category
        const transformedLive = liveData.map(quiz => transformQuizData(quiz, 'live'));
        const transformedUpcoming = upcomingData.map(quiz => transformQuizData(quiz, 'upcoming'));
        const transformedPractice = (practiceData.items || []).map(quiz => transformQuizData(quiz, 'practice'));
        const transformedAttempted = attemptedData.map(quiz => transformQuizData(quiz, 'attempted'));

        setAllQuizzes({
          live: transformedLive,
          upcoming: transformedUpcoming,
          practice: transformedPractice,
          attempted: transformedAttempted,
          winner: [] // Placeholder for winner tab
        });

        // Log counts for debugging
        console.log(`Quiz counts for language '${language || 'ALL'}':`, {
          live: transformedLive.length,
          upcoming: transformedUpcoming.length,
          practice: transformedPractice.length,
          attempted: transformedAttempted.length
        });

        // Log sample of languages in returned quizzes
        if (transformedLive.length > 0) {
          const sampleLanguages = transformedLive.slice(0, 3).map(q => q.language);
          console.log('Sample quiz languages:', sampleLanguages);
        }
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(err.message || 'Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, [selectedLanguage, uid]);

  // Fetch winners data when Winners tab is selected
  useEffect(() => {
    const fetchWinners = async () => {
      if (selectedCategory !== 'winner') return;

      setWinnersLoading(true);
      setWinnersError(null);

      try {
        // Format date as YYYY-MM-DD
        const formattedDate = selectedDate.toISOString().split('T')[0];
        console.log('Fetching winners for date:', formattedDate);

        const data = await fetchDailyWinners(formattedDate, true);
        console.log('Winners data received:', data);

        // Transform the data to match our component structure
        // Filter out slots with no winners and flatten the structure
        const winners = data?.winners || [];
        const slotsWithWinners = winners
          .filter(slot => slot.winner !== null)
          .map(slot => ({
            slotHourKey: slot.slotHourKey,
            slotDisplay: slot.slotDisplay,
            participantCount: slot.totalSlotParticipants || slot.totalParticipants || 0,
            // Flatten winner data
            userName: slot.winner.userName || slot.winner.displayName || 'Guest User',
            displayName: slot.winner.displayName || slot.winner.userName || 'Guest User',
            userClass: slot.winner.quizLabel || 'N/A',
            score: slot.winner.score || 0,
            accuracy: slot.winner.accuracy || 0,
            timeSpent: slot.winner.effectiveTimeSeconds || 0,
            // Keep original winner data for reference
            ...slot.winner
          }));

        console.log('Transformed winners:', slotsWithWinners);

        setDailyWinnersData({
          slots: slotsWithWinners,
          totalSlots: slotsWithWinners.length,
          date: formattedDate
        });

      } catch (err) {
        console.error('Error fetching winners:', err);
        setWinnersError(err.message || 'Failed to fetch winners');
      } finally {
        setWinnersLoading(false);
      }
    };

    fetchWinners();
  }, [selectedCategory, selectedDate]);

  // Helper function to check if text contains exact match with word boundaries
  const matchesExactly = (text, searchTerm) => {
    if (!text) return false;
    // Create a regex that matches the exact term with word boundaries
    // This prevents "Class 1" from matching "Class 10", "Class 11", etc.
    const regex = new RegExp(`\\b${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  };

  // Helper function to apply filters to a quiz array
  const applyFiltersToQuizzes = (quizzes) => {
    // If no filters are applied, return all quizzes
    const hasFilters = appliedFilters.selectedCategories.length > 0 ||
                       appliedFilters.selectedClasses.length > 0 ||
                       appliedFilters.selectedSSCExams.length > 0 ||
                       appliedFilters.selectedPopularExams.length > 0;

    if (!hasFilters) {
      return quizzes;
    }

    return quizzes.filter(quiz => {
      // Extract the exam/class category from the quiz title (e.g., "JEE Main • Optics" -> "JEE Main")
      const quizCategory = quiz.title.split('•')[0]?.trim() || '';

      // Check if "Recommended" is selected - show all quizzes
      if (appliedFilters.selectedCategories.includes('recommended')) {
        return true;
      }

      // Check if the quiz matches any selected classes
      if (appliedFilters.selectedClasses.length > 0) {
        const matchesClass = appliedFilters.selectedClasses.some(cls =>
          matchesExactly(quizCategory, cls) ||
          matchesExactly(quiz.subject, cls) ||
          matchesExactly(quiz.title, cls)
        );
        if (matchesClass) return true;
      }

      // Check if the quiz matches any selected SSC exams
      if (appliedFilters.selectedSSCExams.length > 0) {
        const matchesSSC = appliedFilters.selectedSSCExams.some(exam =>
          matchesExactly(quizCategory, exam) ||
          matchesExactly(quiz.subject, exam) ||
          matchesExactly(quiz.title, exam)
        );
        if (matchesSSC) return true;
      }

      // Check if the quiz matches any selected popular exams
      if (appliedFilters.selectedPopularExams.length > 0) {
        const matchesPopular = appliedFilters.selectedPopularExams.some(exam =>
          matchesExactly(quizCategory, exam) ||
          matchesExactly(quiz.subject, exam) ||
          matchesExactly(quiz.title, exam)
        );
        if (matchesPopular) return true;
      }

      return false;
    });
  };

  // Filter quizzes based on selected filters for the current category
  const filteredQuizzes = useMemo(() => {
    let quizzes = allQuizzes[selectedCategory] || [];
    return applyFiltersToQuizzes(quizzes);
  }, [allQuizzes, selectedCategory, appliedFilters]);

  // Get the quizzes to display based on displayCount
  const displayedQuizzes = useMemo(() => {
    return filteredQuizzes.slice(0, displayCount);
  }, [filteredQuizzes, displayCount]);

  // Reset displayCount when category or filters change
  useEffect(() => {
    setDisplayCount(15);
  }, [selectedCategory, appliedFilters]);

  // Get counts for each category based on applied filters
  const categoryCounts = useMemo(() => {
    const counts = {
      live: applyFiltersToQuizzes(allQuizzes.live || []).length,
      upcoming: applyFiltersToQuizzes(allQuizzes.upcoming || []).length,
      practice: applyFiltersToQuizzes(allQuizzes.practice || []).length,
      attempted: applyFiltersToQuizzes(allQuizzes.attempted || []).length,
      winner: dailyWinnersData.totalSlots || 0,
    };
    console.log('Displaying category counts (filtered):', counts);
    return counts;
  }, [allQuizzes, appliedFilters, dailyWinnersData]);

  const categoryTabs = ['LIVE', 'UPCOMING', 'PRACTICE', 'ATTEMPTED','WINNER'];

  const handleApplyFilters = (filters) => {
    console.log('Applying filters:', filters);
    setAppliedFilters(filters);
  };

  const handleStartQuiz = (quizId) => {
    console.log('Start Quiz:', quizId);

    // Find the quiz in the current category
    const selectedQuiz = filteredQuizzes.find(q => q.id === quizId);
    if (selectedQuiz) {

      if (selectedQuiz.category === 'live' || selectedQuiz.category === 'upcoming' || selectedQuiz.category === 'practice') {
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
      } else if (selectedQuiz.category === 'winner') {
        console.log('View Winners for quiz:', quizId);
        // Navigate to winners page when ready
      }
    }
  };

  const handleLoadMore = () => {
    setDisplayCount(prevCount => prevCount + 15);
  };

  // Winners tab handlers
  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleRefreshWinners = () => {
    // Trigger re-fetch by updating a timestamp or directly calling the effect
    setSelectedDate(new Date(selectedDate.getTime())); // Force re-render
  };

  // Handle pull-to-refresh for all quiz tabs
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);

    try {
      // Convert language to proper format for API
      let language = selectedLanguage === 'ALL'
        ? undefined
        : selectedLanguage.charAt(0) + selectedLanguage.slice(1).toLowerCase();

      console.log('Refreshing quizzes with language:', language);

      // Fetch all categories in parallel
      const [liveData, upcomingData, practiceData, attemptedData] = await Promise.all([
        fetchLiveQuizzesOnly({ language }).catch(err => {
          console.error('Error fetching live quizzes:', err);
          return [];
        }),
        fetchUpcomingQuizzes({ language }).catch(err => {
          console.error('Error fetching upcoming quizzes:', err);
          return [];
        }),
        fetchPracticeQuizzes({ language, limit: 200 }).catch(err => {
          console.error('Error fetching practice quizzes:', err);
          return { items: [] };
        }),
        uid ? fetchUserQuizAttempts(uid).catch(err => {
          console.error('Error fetching attempted quizzes:', err);
          return [];
        }) : Promise.resolve([])
      ]);

      // Transform data for each category
      const transformedLive = liveData.map(quiz => transformQuizData(quiz, 'live'));
      const transformedUpcoming = upcomingData.map(quiz => transformQuizData(quiz, 'upcoming'));
      const transformedPractice = (practiceData.items || []).map(quiz => transformQuizData(quiz, 'practice'));
      const transformedAttempted = attemptedData.map(quiz => transformQuizData(quiz, 'attempted'));

      setAllQuizzes({
        live: transformedLive,
        upcoming: transformedUpcoming,
        practice: transformedPractice,
        attempted: transformedAttempted,
        winner: [] // Placeholder for winner tab
      });

      console.log('Quizzes refreshed successfully');
    } catch (err) {
      console.error('Error refreshing quizzes:', err);
      setError(err.message || 'Failed to refresh quizzes');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDisplayDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
          {appliedFilters.selectedCategories.length > 0 ||
           appliedFilters.selectedClasses.length > 0 ||
           appliedFilters.selectedSSCExams.length > 0 ||
           appliedFilters.selectedPopularExams.length > 0
            ? `Showing filtered quizzes based on your selection${selectedLanguage !== 'ALL' ? ` in ${selectedLanguage.charAt(0) + selectedLanguage.slice(1).toLowerCase()}` : ''}.`
            : `Showing recommended quizzes${selectedLanguage !== 'ALL' ? ` in ${selectedLanguage.charAt(0) + selectedLanguage.slice(1).toLowerCase()}` : ' across all categories'} and ranked from most visited.`}
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSection}>
        <View style={styles.languageHeader}>
          <Text style={styles.languageLabel}>LANGUAGE</Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => filterRef.current?.openFilter()}
          >
            <Ionicons name="filter" size={18} color="#DC2626" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>
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
      <View style={styles.categoryTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsContent}
          style={styles.categoryTabsScroll}
        >
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
        </ScrollView>
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

      {/* Empty State (for non-winner tabs) */}
      {selectedCategory !== 'winner' && !loading && !error && filteredQuizzes.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No {selectedCategory} quizzes available</Text>
          {selectedCategory === 'attempted' && !uid && (
            <Text style={styles.emptySubtext}>Please log in to see your attempted quizzes</Text>
          )}
        </View>
      )}

      {/* Winners Tab Content */}
      {selectedCategory === 'winner' && (
        <>
          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Winners Content with Date Filter Always Visible */}
          <ScrollView
            style={styles.winnersScrollContainer}
            contentContainerStyle={styles.winnersScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={winnersLoading}
                onRefresh={handleRefreshWinners}
                colors={['#DC2626']}
                tintColor="#DC2626"
              />
            }
          >
            {/* Winners Header with Date Filter - Always Visible */}
            <View style={styles.winnersHeader}>
              <Text style={styles.winnersTitle}>HOURLY WINNERS</Text>
              <Text style={styles.winnersDescription}>
                Top scorers across hourly slots. Winners are the highest scorers for each hourly quiz slot, determined by total points (correct answers × 4 – incorrect answers).
              </Text>

              {/* Date Picker and Refresh Button */}
              <View style={styles.winnersControls}>
                <View style={styles.datePickerContainer}>
                  <Text style={styles.dateLabel}>Select Date:</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerText}>{formatDisplayDate(selectedDate)}</Text>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={handleRefreshWinners}
                  disabled={winnersLoading}
                >
                  <Text style={styles.refreshButtonText}>REFRESH</Text>
                </TouchableOpacity>
              </View>

              {/* Status Text */}
              <Text style={styles.winnersStatus}>
                Showing {formatDisplayDate(selectedDate)}'s winners • {dailyWinnersData.totalSlots} hourly slots
              </Text>
            </View>

            {/* Loading State for Winners */}
            {winnersLoading && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#DC2626" />
                <Text style={styles.loadingText}>Loading winners...</Text>
              </View>
            )}

            {/* Error State for Winners */}
            {winnersError && !winnersLoading && (
              <View style={styles.centerContainer}>
                <Text style={styles.errorText}>⚠️ {winnersError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRefreshWinners}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Empty State for Winners */}
            {!winnersLoading && !winnersError && dailyWinnersData.slots.length === 0 && (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>No winners found for this date</Text>
                <Text style={styles.emptySubtext}>Try selecting a different date</Text>
              </View>
            )}

            {/* Winners List */}
            {!winnersLoading && !winnersError && dailyWinnersData.slots.length > 0 && (
              <View style={styles.winnersList}>
                {dailyWinnersData.slots.map((item, index) => (
                  <WinnerCard
                    key={item.slotHourKey || `slot-${index}`}
                    winner={item}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Quiz List (for non-winner tabs) */}
      {selectedCategory !== 'winner' && !loading && !error && filteredQuizzes.length > 0 && (
        <FlatList
          data={displayedQuizzes}
          keyExtractor={(item) => item.id || item._id || String(Math.random())}
          renderItem={({ item }) => (
            <QuizCard quiz={item} onStartQuiz={handleStartQuiz} />
          )}
          contentContainerStyle={styles.quizList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#DC2626']}
              tintColor="#DC2626"
            />
          }
          ListFooterComponent={
            displayCount < filteredQuizzes.length ? (
              <Pressable style={styles.loadMoreButton} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Load More Quizes</Text>
              </Pressable>
            ) : null
          }
        />
      )}

      {/* Floating Filter (Hidden) */}
      <FloatingFilter
        ref={filterRef}
        onApplyFilters={handleApplyFilters}
        hideFloatingButton={true}
      />
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
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
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
  categoryTabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  categoryTabsScroll: {
    paddingHorizontal: 16,
  },
  categoryTabsContent: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  categoryTab: {
    minWidth: 90,
    paddingHorizontal: 8,
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
  loadMoreButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  winnersScrollContainer: {
    flex: 1,
  },
  winnersScrollContent: {
    paddingBottom: 20,
  },
  winnersHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 0,
  },
  winnersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  winnersDescription: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  winnersControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  datePickerContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-end',
  },
  refreshButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  winnersStatus: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  winnersList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
});

export default QuizArenaScreen;