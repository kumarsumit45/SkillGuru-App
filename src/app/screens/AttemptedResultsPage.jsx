
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchLiveQuizById, fetchUserQuizAttempts } from '../../api/liveQuizApi';
import useAuthStore from '../../store/authStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const AttemptedResultsPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { uid } = useAuthStore();

  // Get attemptId from params (the id field from the attempt response)
  const attemptId = params.attemptId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [userAttemptData, setUserAttemptData] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Fetch quiz data and user attempt data
  useEffect(() => {
    const fetchData = async () => {
      if (!attemptId) {
        setError('Attempt ID is required');
        setLoading(false);
        return;
      }

      if (!uid) {
        setError('Please log in to view your results');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching attempted quiz results...');
        console.log('Attempt ID:', attemptId);
        console.log('User ID:', uid);

        // Fetch user quiz attempts using fetchUserQuizAttempts
        const userAttempts = await fetchUserQuizAttempts(uid, {
          limit: 100,
          includeQuestions: true,
          includeAnswers: true,
        });

        console.log('Total attempts found:', userAttempts.length);

        // Find the specific attempt by attemptId
        const attemptResult = userAttempts.find(attempt => attempt.id === attemptId);

        if (!attemptResult) {
          setError('Attempt not found. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Found attempt:', attemptResult);
        console.log('Has questionBreakdown?', attemptResult.questionBreakdown ? 'Yes' : 'No');

        if (attemptResult.questionBreakdown) {
          console.log('questionBreakdown sample:', attemptResult.questionBreakdown.slice(0, 2));
          console.log('Total answers in breakdown:', attemptResult.questionBreakdown.length);
        } else {
          console.warn('⚠️ No questionBreakdown found in attempt result!');
          console.log('Attempt result keys:', Object.keys(attemptResult));
        }

        // Check if questionBreakdown has full data (questionText, options)
        const hasFullBreakdownData = attemptResult.questionBreakdown?.length > 0 &&
                                      attemptResult.questionBreakdown[0]?.questionText &&
                                      attemptResult.questionBreakdown[0]?.options?.length > 0;

        console.log('Has full breakdown data?', hasFullBreakdownData);

        let questions = [];
        let quizResponse = null;

        if (hasFullBreakdownData) {
          // Use questionBreakdown directly as questions
          console.log('Using questionBreakdown as primary data source');
          questions = attemptResult.questionBreakdown.map((breakdown, idx) => ({
            id: breakdown.questionId,
            questionId: breakdown.questionId,
            question_text: breakdown.questionText,
            questionText: breakdown.questionText,
            text: breakdown.questionText,
            options: breakdown.options,
            correct_answer: breakdown.correctAnswer,
            correctAnswer: breakdown.correctAnswer,
            explanation: breakdown.explanation || '',
            concept: breakdown.concept || breakdown.topic || 'General',
          }));
        } else {
          // Need to fetch quiz questions separately
          console.log('Fetching quiz questions separately');

          const quizId = attemptResult.quizId;
          if (!quizId) {
            setError('Quiz ID not found in attempt data');
            setLoading(false);
            return;
          }

          try {
            quizResponse = await fetchLiveQuizById(quizId);
            console.log('Quiz Response:', quizResponse);
            questions = quizResponse?.questions || [];

            if (questions.length === 0) {
              setError('Quiz questions not available.');
              setLoading(false);
              return;
            }
          } catch (quizError) {
            console.warn('Failed to fetch quiz by ID:', quizError.message);
            setError('Quiz questions not available. The quiz may have expired.');
            setLoading(false);
            return;
          }
        }

        // Build complete quiz data
        const completeQuizData = {
          id: attemptResult.quizId,
          title: attemptResult.quizTitle || quizResponse?.title || attemptResult.quizLabel || 'Quiz',
          subject: attemptResult.quizSubject || quizResponse?.subject || 'General',
          language: attemptResult.language || quizResponse?.language || 'English',
          duration: quizResponse?.duration || quizResponse?.durationMinutes || attemptResult.duration || 'N/A',
          questions: questions,
          quiz_metadata: quizResponse?.quiz_metadata || {},
        };

        console.log('Complete Quiz Data:', completeQuizData);
        console.log('Total Questions:', questions.length);

        setQuizData(completeQuizData);
        setUserAttemptData(attemptResult);

        // Mark cache for refresh
        await AsyncStorage.setItem('quiz_cache_needs_refresh', 'true');
      } catch (err) {
        console.error('Error fetching attempted quiz data:', err);
        setError(err.message || 'Failed to load quiz results');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [attemptId, uid]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Loading quiz results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!quizData || !userAttemptData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No quiz data available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Process user answers from questionBreakdown
  const questionBreakdown = userAttemptData.questionBreakdown || [];
  const questions = quizData.questions || [];

  console.log('Processing questionBreakdown...');
  console.log('Total answers in breakdown:', questionBreakdown.length);
  console.log('Total questions in quiz:', questions.length);

  // Get results from attempt data
  const totalQuestions = userAttemptData.totalQuestions || questions.length;

  // Calculate statistics from questionBreakdown and API response
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  console.log('\n📊 CALCULATING QUIZ STATISTICS:');

  // If we have questionBreakdown, calculate from it for accuracy
  if (questionBreakdown && questionBreakdown.length > 0) {
    // Count correct and incorrect from questionBreakdown
    const correctFromBreakdown = questionBreakdown.filter(q => q.isCorrect === true).length;
    const incorrectFromBreakdown = questionBreakdown.filter(q => q.isCorrect === false).length;

    // Use correctCount from API (preferred), or fallback to breakdown count
    correctCount = userAttemptData.correctCount || correctFromBreakdown;

    // Calculate incorrect from breakdown
    incorrectCount = incorrectFromBreakdown;

    // Skipped = total questions - questions attempted (in breakdown)
    unattemptedCount = totalQuestions - questionBreakdown.length;

    console.log(`Questions in breakdown: ${questionBreakdown.length}`);
    console.log(`Correct (isCorrect=true): ${correctFromBreakdown}`);
    console.log(`Incorrect (isCorrect=false): ${incorrectFromBreakdown}`);
    console.log(`Skipped (not in breakdown): ${unattemptedCount}`);
  } else {
    // Fallback to API fields if no questionBreakdown
    correctCount = userAttemptData.correctCount || userAttemptData.correct || 0;
    incorrectCount = userAttemptData.incorrect || userAttemptData.incorrectCount || 0;
    unattemptedCount = userAttemptData.skipped || userAttemptData.unattemptedCount || 0;
    console.log('Using API fields (no questionBreakdown available)');
  }

  console.log(`\n✅ Final Statistics:`);
  console.log(`Total Questions: ${totalQuestions}`);
  console.log(`Correct: ${correctCount}`);
  console.log(`Incorrect: ${incorrectCount}`);
  console.log(`Skipped: ${unattemptedCount}`);
  console.log(`Validation: ${correctCount} + ${incorrectCount} + ${unattemptedCount} = ${correctCount + incorrectCount + unattemptedCount} (should equal ${totalQuestions})`);

  const questionResults = questions.map((question, index) => {
    // Find the breakdown for this question by matching questionId
    const breakdown = questionBreakdown.find(bd => {
      const questionId = bd.questionId;
      return question.id === questionId || question._id === questionId || question.questionId === questionId ||
             question.question_id === questionId;
    });

    let status = 'unattempted';
    let userAnswer = null;
    let timeSpent = null;
    let marks = null;

    if (breakdown && breakdown.selectedOption) {
      status = breakdown.isCorrect ? 'correct' : 'incorrect';
      const selectedOption = breakdown.selectedOption;

      // Convert full text answer to option letter (A, B, C, D)
      if (question.options) {
        let matchingOptionIndex = -1;

        // Try exact match first
        matchingOptionIndex = question.options.findIndex(option => {
          const optionText = typeof option === 'string' ? option : option.text;
          return optionText === selectedOption;
        });

        // Try case-insensitive match
        if (matchingOptionIndex === -1) {
          matchingOptionIndex = question.options.findIndex(option => {
            const optionText = typeof option === 'string' ? option : option.text;
            return optionText?.trim().toLowerCase() === selectedOption.trim().toLowerCase();
          });
        }

        if (matchingOptionIndex !== -1) {
          userAnswer = String.fromCharCode(65 + matchingOptionIndex); // Convert to A, B, C, D
        } else {
          userAnswer = selectedOption; // Keep as full text if no match
        }
      } else {
        userAnswer = selectedOption;
      }

      timeSpent = breakdown.timeSpentSeconds || breakdown.timeSpent;
      marks = breakdown.marks || breakdown.points;
    }

    // Get correct answer and convert to letter
    let correctAnswer = breakdown?.correctAnswer || question.correct_answer || question.correctAnswer;

    if (correctAnswer && question.options) {
      const correctIndex = question.options.findIndex(option => {
        const optionText = typeof option === 'string' ? option : option.text;
        return optionText?.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      });

      if (correctIndex !== -1) {
        correctAnswer = String.fromCharCode(65 + correctIndex); // Convert to A, B, C, D
      }
    }

    return {
      ...question,
      userAnswer,
      correctAnswer,
      status,
      index: index + 1,
      timeSpent,
      marks,
      breakdown,
    };
  });

  // Get scores and accuracy from attempt data
  // Note: 'score' in API is points (e.g., 60), but for display we want correct count (e.g., 6)
  const scorePoints = userAttemptData.score || 0; // Actual points scored
  const scoreDisplay = correctCount; // Number of correct answers for "X/Y" display

  // Use accuracy from API response directly, or calculate if not available
  const accuracy = userAttemptData.accuracy || (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0);
  const percentage = accuracy;

  console.log(`\n💯 SCORE & ACCURACY:`);
  console.log(`Score Points (from API): ${scorePoints}`);
  console.log(`Score Display: ${scoreDisplay}/${totalQuestions}`);
  console.log(`Accuracy (from API): ${accuracy}%`);

  // Get quiz info
  const quizTitle = quizData.title || 'Quiz';
  const quizCategory = quizData.title?.split('•')[0]?.trim() || quizData.subject || 'Quiz';
  const language = quizData.language || 'English';

  // Get attempt metadata
  const attemptedDate = userAttemptData.attemptedAt || userAttemptData.completedAt || userAttemptData.createdAt;
  const formattedDate = attemptedDate
    ? new Date(attemptedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  // Get time spent - prioritize effectiveTimeSeconds from API response
  const timeSpentSeconds = userAttemptData.effectiveTimeSeconds || userAttemptData.timeSpentSeconds || userAttemptData.totalTimeSeconds || 0;
  const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
  const timeSpentRemainingSeconds = timeSpentSeconds % 60;
  const formattedTimeSpent = timeSpentSeconds > 0
    ? `${timeSpentMinutes}m ${timeSpentRemainingSeconds}s`
    : 'N/A';

  console.log(`\n⏱️ TIME SPENT: ${formattedTimeSpent} (${timeSpentSeconds}s)`);

  const handleBackToList = () => {
    router.push('/(main)/(tabs)');
  };

  const handleViewSolution = (questionIndex) => {
    setExpandedQuestion(expandedQuestion === questionIndex ? null : questionIndex);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'correct':
        return '#10B981';
      case 'incorrect':
        return '#EF4444';
      case 'unattempted':
        return '#9CA3AF';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'correct':
        return '✓';
      case 'incorrect':
        return '✗';
      case 'unattempted':
        return '−';
      default:
        return '?';
    }
  };

  const getPerformanceMessage = () => {
    if (percentage >= 80) {
      return 'Excellent Work!';
    } else if (percentage >= 60) {
      return 'Good Attempt!';
    } else if (percentage >= 40) {
      return 'Nice Try!';
    } else {
      return 'Keep Practicing!';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
            <MaterialCommunityIcons name="arrow-left-thin" size={20} color="black" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizCategory}</Text>
          <Text style={styles.headerSubtitle}>Attempted on {formattedDate}</Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          {/* Circular Score Display */}
          <View style={styles.scoreCircleContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{scoreDisplay}</Text>
              <Text style={styles.scoreTotal}>/{totalQuestions}</Text>
            </View>
          </View>

          {/* Score Message */}
          <Text style={styles.scoreMessage}>
            You scored {scoreDisplay} out of {totalQuestions} questions correctly.
          </Text>

          <Text style={styles.performanceTitle}>{getPerformanceMessage()}</Text>

          {/* Statistics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.statIconText}>📊</Text>
              </View>
              <Text style={styles.statValue}>{percentage}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.statIconText}>✓</Text>
              </View>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FECACA' }]}>
                <Text style={styles.statIconText}>✗</Text>
              </View>
              <Text style={styles.statValue}>{incorrectCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FED7AA' }]}>
                <Text style={styles.statIconText}>⏭</Text>
              </View>
              <Text style={styles.statValue}>{unattemptedCount}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#E9D5FF' }]}>
                <Text style={styles.statIconText}>⏱</Text>
              </View>
              <Text style={styles.statValue}>{formattedTimeSpent}</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FBCFE8' }]}>
                <Text style={styles.statIconText}>📅</Text>
              </View>
              <Text style={styles.statValue}>{formattedDate}</Text>
              <Text style={styles.statLabel}>Attempted On</Text>
            </View>
          </View>
        </View>

        {/* Question Breakdown */}
        <View style={styles.questionSection}>
          <Text style={styles.questionSectionTitle}>
            {totalQuestions} Questions
          </Text>
          <Text style={styles.questionSectionSubtitle}>Question Breakdown</Text>

          {/* Show warning if no answers found */}
          {questionBreakdown.length === 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Your answers could not be loaded. Showing questions and correct answers only.
              </Text>
            </View>
          )}

          {/* Show info about answer format */}
          {questionBreakdown.length > 0 && (
            <Text style={styles.infoText}>
              ✓ Green: Correct answer | ✗ Red: Your incorrect answer
            </Text>
          )}

          {questionResults.map((question, idx) => {
            const isExpanded = expandedQuestion === idx;
            const statusColor = getStatusColor(question.status);

            return (
              <View key={idx} style={styles.questionCard}>
                {/* Question Header */}
                <TouchableOpacity
                  style={styles.questionHeader}
                  onPress={() => handleViewSolution(idx)}
                >
                  <View style={styles.questionHeaderLeft}>
                    <View
                      style={[
                        styles.questionStatusIcon,
                        { backgroundColor: statusColor },
                      ]}
                    >
                      <Text style={styles.questionStatusIconText}>
                        {getStatusIcon(question.status)}
                      </Text>
                    </View>
                    <Text style={styles.questionNumber}>Q{question.index}</Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {/* Question Topic/Concept */}
                <Text style={styles.questionConcept}>
                  {question.concept || question.cbse_chapter || 'General'}
                </Text>

                {/* Additional details from breakdown (time spent, marks) */}
                {(question.timeSpent || question.marks) && (
                  <View style={styles.questionMetaContainer}>
                    {question.timeSpent && (
                      <Text style={styles.questionMeta}>
                        ⏱ {question.timeSpent}s
                      </Text>
                    )}
                    {question.marks !== null && question.marks !== undefined && (
                      <Text style={styles.questionMeta}>
                        📊 {question.marks} marks
                      </Text>
                    )}
                  </View>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.questionExpanded}>
                    {/* Question Text */}
                    <Text style={styles.questionText}>
                      {question.question_text || question.questionText || question.text}
                    </Text>

                    {/* Answer Summary */}
                    {/* {question.status !== 'unattempted' && (
                      <View style={styles.answerSummaryContainer}>
                        <View style={styles.answerSummaryRow}>
                          <Text style={styles.answerSummaryLabel}>Your Answer:</Text>
                          <Text style={[
                            styles.answerSummaryValue,
                            question.status === 'correct' ? styles.answerCorrect : styles.answerIncorrect
                          ]}>
                            {question.userAnswer || 'N/A'}
                            {question.status === 'correct' && ' ✓'}
                            {question.status === 'incorrect' && ' ✗'}
                          </Text>
                        </View>
                        <View style={styles.answerSummaryRow}>
                          <Text style={styles.answerSummaryLabel}>Correct Answer:</Text>
                          <Text style={[styles.answerSummaryValue, styles.answerCorrectGreen]}>
                            {question.correctAnswer || 'N/A'} ✓
                          </Text>
                        </View>
                      </View>
                    )} */}

                    {/* Options */}
                    <View style={styles.optionsList}>
                      {question.options?.map((option, optionIdx) => {
                        const optionKey = String.fromCharCode(65 + optionIdx); // A, B, C, D
                        const optionText = (typeof option === 'string' ? option : option.text) || '';

                        // Compare by option letter (A, B, C, D)
                        const isUserAnswer = question.userAnswer === optionKey;
                        const isCorrectAnswer = question.correctAnswer === optionKey;

                        // Also check if user answer is still full text (not converted)
                        const isUserAnswerFullText = question.userAnswer &&
                                                     question.userAnswer.length > 1 &&
                                                     optionText.toLowerCase().trim() === question.userAnswer.toLowerCase().trim();

                        let optionStyle = styles.option;
                        let optionTextStyle = styles.optionText;

                        if (isCorrectAnswer) {
                          optionStyle = [styles.option, styles.optionCorrect];
                          optionTextStyle = [styles.optionText, styles.optionTextCorrect];
                        } else if ((isUserAnswer || isUserAnswerFullText) && !isCorrectAnswer) {
                          optionStyle = [styles.option, styles.optionIncorrect];
                          optionTextStyle = [styles.optionText, styles.optionTextIncorrect];
                        }

                        return (
                          <View key={optionIdx} style={optionStyle}>
                            <Text style={styles.optionKey}>{optionKey}.</Text>
                            <Text style={optionTextStyle}>{optionText}</Text>
                            {isCorrectAnswer && (
                              <Text style={styles.correctBadge}>✓ Correct</Text>
                            )}
                            {(isUserAnswer || isUserAnswerFullText) && !isCorrectAnswer && (
                              <Text style={styles.incorrectBadge}>✗ Your Answer</Text>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Explanation */}
                    {question.explanation && (
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationTitle}>Explanation:</Text>
                        <Text style={styles.explanationText}>{question.explanation}</Text>
                      </View>
                    )}

                    {/* Additional breakdown details */}
                    {question.breakdown && (
                      <View style={styles.breakdownDetailsContainer}>
                        {question.breakdown.difficulty && (
                          <View style={styles.breakdownDetail}>
                            <Text style={styles.breakdownDetailLabel}>Difficulty:</Text>
                            <Text style={styles.breakdownDetailValue}>{question.breakdown.difficulty}</Text>
                          </View>
                        )}
                        {question.breakdown.topic && (
                          <View style={styles.breakdownDetail}>
                            <Text style={styles.breakdownDetailLabel}>Topic:</Text>
                            <Text style={styles.breakdownDetailValue}>{question.breakdown.topic}</Text>
                          </View>
                        )}
                        {question.breakdown.tags && question.breakdown.tags.length > 0 && (
                          <View style={styles.breakdownDetail}>
                            <Text style={styles.breakdownDetailLabel}>Tags:</Text>
                            <Text style={styles.breakdownDetailValue}>{question.breakdown.tags.join(', ')}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Back to Quiz List Button */}
        <TouchableOpacity
          style={styles.backToListButton}
          onPress={handleBackToList}
        >
          <Text style={styles.backToListButtonText}>BACK TO QUIZ LIST</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 25,
    marginBottom: 24,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap:6
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreCircleContainer: {
    marginBottom: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#DC2626',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#DC2626',
  },
  scoreTotal: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  scoreMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  performanceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  questionSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  questionSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  questionSectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questionStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionStatusIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  expandIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  questionConcept: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  questionMetaContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  questionMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  questionExpanded: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 16,
  },
  answerSummaryContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  answerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  answerSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  answerCorrect: {
    color: '#10B981',
  },
  answerIncorrect: {
    color: '#EF4444',
  },
  answerCorrectGreen: {
    color: '#10B981',
  },
  optionsList: {
    gap: 8,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionCorrect: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  optionKey: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
    minWidth: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  optionTextCorrect: {
    color: '#047857',
    fontWeight: '700',
  },
  optionTextIncorrect: {
    color: '#991B1B',
    fontWeight: '600',
  },
  correctBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  incorrectBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  explanationBox: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  breakdownDetailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  breakdownDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  breakdownDetailValue: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  backToListButton: {
    backgroundColor: '#DC2626',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backToListButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default AttemptedResultsPage;
