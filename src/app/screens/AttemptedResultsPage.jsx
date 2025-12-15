/**
 * AttemptedResultsPage
 *
 * Displays detailed results for a quiz attempt, including:
 * - Score and statistics (correct, incorrect, skipped)
 * - User's selected answers vs correct answers
 * - Question-by-question breakdown
 *
 * DATA FLOW:
 * 1. Receives attemptId from navigation params
 * 2. Uses fetchUserQuizAttempts(userId, {includeQuestions: true}) to get:
 *    - Attempt metadata (score, accuracy, stats)
 *    - User's answers array
 *    - Questions (if included)
 * 3. Extracts quizId from attempt data
 * 4. Uses fetchLiveQuizById(quizId) to get complete quiz questions
 * 5. Maps user answers to questions and renders in UI
 *
 * ANSWER SOURCES (in priority order):
 * 1. answers array from fetchUserQuizAttempts response
 * 2. Fallback to fetchAttemptAnswers(attemptId) if needed
 * 3. userAnswers object if available
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLiveQuizById, fetchUserQuizAttempts, fetchQuizAttemptById, fetchAttemptAnswers } from '../../api/liveQuizApi';
import useAuthStore from '../../store/authStore';

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

      try {
        setLoading(true);
        console.log('================================');
        console.log('Fetching attempted quiz results...');
        console.log('Attempt ID:', attemptId);
        console.log('User ID:', uid);
        console.log('================================');

        // Step 1: Fetch user quiz attempts using fetchUserQuizAttempts
        let attemptResult = null;

        if (!uid) {
          setError('Please log in to view your results');
          setLoading(false);
          return;
        }

        try {
          // Fetch user attempts with questions and answers using fetchUserQuizAttempts
          console.log('📡 Fetching user attempts with includeQuestions=true AND includeAnswers=true...');
          const userAttempts = await fetchUserQuizAttempts(uid, {
            limit: 100,
            includeQuestions: true,
            includeAnswers: true  // IMPORTANT: Request answers from backend
          });

          console.log('\n================================');
          console.log('📡 API RESPONSE FROM fetchUserQuizAttempts');
          console.log('================================');
          console.log('Total attempts found:', userAttempts.length);
          console.log('Full response:', JSON.stringify(userAttempts, null, 2));

          if (userAttempts.length > 0) {
            console.log('\n--- Sample Attempt Structure ---');
            console.log('First attempt keys:', Object.keys(userAttempts[0]));
            console.log('Has "answers" field?', 'answers' in userAttempts[0]);
            console.log('Has "questions" field?', 'questions' in userAttempts[0]);

            if (userAttempts[0].answers) {
              console.log('\n✅ ANSWERS FOUND in first attempt!');
              console.log('Answers type:', Array.isArray(userAttempts[0].answers) ? 'Array' : typeof userAttempts[0].answers);
              console.log('Answers length:', userAttempts[0].answers.length);
              console.log('First answer:', userAttempts[0].answers[0]);
            } else {
              console.log('\n❌ NO ANSWERS in first attempt');
              console.log('Available fields:', Object.keys(userAttempts[0]));
            }
          }
          console.log('================================\n');

          // Find the specific attempt by attemptId
          attemptResult = userAttempts.find(attempt => attempt.id === attemptId);

          if (attemptResult) {
            console.log('\n✅ Found attempt in user attempts list!');
            console.log('Attempt Data:', attemptResult);
            console.log('Has questions?', attemptResult.questions ? 'Yes' : 'No');
            console.log('Has answers?', attemptResult.answers ? 'Yes' : 'No');

            // Log answers in detail if available
            if (attemptResult.answers) {
              console.log('\n👤 User Answers from fetchUserQuizAttempts:');
              console.log('Answers array:', attemptResult.answers);
              console.log('Total answers:', attemptResult.answers.length);

              // Log each answer
              attemptResult.answers.forEach((answer, idx) => {
                console.log(`Answer ${idx + 1}:`, answer);
              });
            }
          } else {
            console.warn('⚠️ Attempt not found in user attempts list');

            // Fallback: try fetching by attemptId directly
            try {
              console.log('Trying to fetch attempt by ID as fallback...');
              const directAttempt = await fetchQuizAttemptById(attemptId, { includeAnswers: true });
              attemptResult = directAttempt;
              console.log('✓ Fetched attempt directly:', attemptResult);
            } catch (fallbackError) {
              console.error('❌ Failed to fetch attempt by ID:', fallbackError.message);
            }
          }
        } catch (error) {
          console.error('❌ Error in fetching user attempts:', error);
        }

        if (!attemptResult) {
          setError('Attempt not found. Please try again.');
          setLoading(false);
          return;
        }

        // Step 2: Extract quizId from the attempt result
        const quizId = attemptResult.quizId;
        if (!quizId) {
          setError('Quiz ID not found in attempt data');
          setLoading(false);
          return;
        }

        console.log('\n🎯 Quiz ID from attempt:', quizId);

        // Step 3: Fetch quiz questions using the quizId
        let quizResponse = null;
        try {
          quizResponse = await fetchLiveQuizById(quizId);
          console.log('✓ Quiz Response:', quizResponse);
        } catch (quizError) {
          console.warn('⚠️ Failed to fetch quiz by ID:', quizError.message);
        }

        // Step 4: Get questions from quiz response or attempt result
        let questions = [];
        if (quizResponse && quizResponse.questions && quizResponse.questions.length > 0) {
          questions = quizResponse.questions;
          console.log('✓ Using questions from quiz response');
        } else if (attemptResult.questions && attemptResult.questions.length > 0) {
          questions = attemptResult.questions;
          console.log('✓ Using questions from attempt result');
        } else {
          console.warn('⚠️ No questions found in either response');
          setError('Quiz questions not available. The quiz may have expired.');
          setLoading(false);
          return;
        }

        // Step 5: Build complete quiz data
        const completeQuizData = {
          id: quizId,
          title: attemptResult.quizTitle || quizResponse?.title || attemptResult.quizLabel || 'Quiz',
          subject: attemptResult.quizSubject || quizResponse?.subject || 'General',
          language: attemptResult.language || quizResponse?.language || quizResponse?.quiz_metadata?.language || 'English',
          duration: quizResponse?.duration || quizResponse?.durationMinutes || 'N/A',
          questions: questions,
          quiz_metadata: quizResponse?.quiz_metadata || {},
        };

        console.log('\n📋 Complete Quiz Data:', completeQuizData);
        console.log('📊 Total Questions:', questions.length);

        // Step 6: Fetch user answers using attempt ID
        if (!attemptResult.answers || attemptResult.answers.length === 0) {
          console.log('\n================================');
          console.log('🔍 FETCHING ANSWERS USING ATTEMPT ID');
          console.log('================================');
          console.log('No answers in user attempts response.');
          console.log('Trying to fetch answers directly using attempt ID...');
          console.log('Attempt ID:', attemptId);
          console.log('================================\n');

          // Method 1: Try fetchQuizAttemptById with includeAnswers=true
          try {
            console.log('📡 Method 1: Trying fetchQuizAttemptById...');
            const attemptWithAnswers = await fetchQuizAttemptById(attemptId, { includeAnswers: true });

            if (attemptWithAnswers?.answers && attemptWithAnswers.answers.length > 0) {
              attemptResult.answers = attemptWithAnswers.answers;
              console.log('✅ SUCCESS! Got answers from fetchQuizAttemptById');
              console.log('Answers count:', attemptWithAnswers.answers.length);
            } else {
              console.log('❌ fetchQuizAttemptById returned no answers');
            }
          } catch (error) {
            console.log('❌ fetchQuizAttemptById failed:', error.message);
          }

          // Method 2: If still no answers, try alternative endpoints
          if (!attemptResult.answers || attemptResult.answers.length === 0) {
            console.log('\n📡 Method 2: Trying alternative endpoints...');
            try {
              const separateAnswers = await fetchAttemptAnswers(attemptId, quizId);
              if (separateAnswers && separateAnswers.length > 0) {
                attemptResult.answers = separateAnswers;
                console.log('✅ SUCCESS! Got answers from alternative endpoint');
                console.log('Answers count:', separateAnswers.length);
              } else {
                console.log('❌ No answers found in any alternative endpoint');
              }
            } catch (answerError) {
              console.log('❌ Alternative endpoints failed:', answerError.message);
            }
          }

          console.log('\n================================');
          console.log('📊 FINAL STATUS');
          console.log('================================');
          console.log('Has answers?', attemptResult.answers ? 'Yes' : 'No');
          console.log('Answers count:', attemptResult.answers?.length || 0);
          console.log('================================\n');
        }

        // Log user answers if available
        console.log('\n================================');
        console.log('📝 FINAL ANSWERS DATA');
        console.log('================================');

        if (attemptResult.answers) {
          console.log('✅ Answers found in attempt result!');
          console.log('Raw answers array:', JSON.stringify(attemptResult.answers, null, 2));
          console.log('📊 Total Answers:', attemptResult.answers.length);

          // Log each answer for debugging
          console.log('\n📝 Individual Answers:');
          attemptResult.answers.forEach((answer, idx) => {
            console.log(`\nAnswer ${idx + 1}:`);
            console.log('  - Full object:', answer);
            console.log('  - questionId:', answer.questionId || answer.question_id || answer.qid);
            console.log('  - selectedOption:', answer.selectedOption || answer.selected_option || answer.userAnswer || answer.user_answer || answer.answer);
            console.log('  - isCorrect:', answer.isCorrect || answer.is_correct);
            console.log('  - timeSpent:', answer.timeSpentSeconds || answer.time_spent_seconds);
          });
        } else {
          console.log('❌ No answers found anywhere');
          console.log('attemptResult.answers:', attemptResult.answers);
          console.log('\n⚠️ IMPORTANT: The backend does not return user answers.');
          console.log('This could mean:');
          console.log('1. Answers are not stored after quiz completion');
          console.log('2. Answers are stored but not exposed via API');
          console.log('3. A different API endpoint or authentication is needed');
        }

        console.log('================================\n');

        setQuizData(completeQuizData);
        setUserAttemptData(attemptResult);

        // Mark cache for refresh
        await AsyncStorage.setItem('quiz_cache_needs_refresh', 'true');

        console.log('================================\n');
      } catch (err) {
        console.error('❌ Error fetching attempted quiz data:', err);
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

  // Process user answers - handle multiple possible formats
  const userAnswersMap = {};

  console.log('\n================================');
  console.log('🔍 PROCESSING USER ANSWERS FOR UI');
  console.log('================================');
  console.log('Source: fetchUserQuizAttempts');
  console.log('userAttemptData.answers:', userAttemptData.answers);
  console.log('Is array?', Array.isArray(userAttemptData.answers));

  if (userAttemptData.answers && Array.isArray(userAttemptData.answers)) {
    console.log('\n✅ Processing answers array from fetchUserQuizAttempts...');

    // Try to match answers with questions
    const questions = quizData.questions || [];
    console.log('Total questions available:', questions.length);

    userAttemptData.answers.forEach((answer, index) => {
      console.log(`\n--- Processing Answer ${index + 1} ---`);
      console.log('Raw answer object:', answer);

      // Extract selected option from various possible field names
      const selectedOption =
        answer.selectedOption ||
        answer.selected_option ||
        answer.userAnswer ||
        answer.user_answer ||
        answer.answer;

      console.log('Extracted selectedOption:', selectedOption);

      if (selectedOption !== undefined && selectedOption !== null) {
        // Try to find question index by questionId if available
        const questionId = answer.questionId || answer.question_id || answer.qid;
        console.log('Question ID:', questionId);

        if (questionId) {
          // Find the question index by matching questionId
          const questionIndex = questions.findIndex(q =>
            (q.id === questionId || q._id === questionId || q.questionId === questionId)
          );

          console.log('Found question at index:', questionIndex);

          if (questionIndex !== -1) {
            userAnswersMap[questionIndex] = selectedOption;
            console.log(`✅ Mapped to question ${questionIndex + 1} (by ID: ${questionId}): ${selectedOption}`);
          } else {
            // If we can't find by ID, use array index
            userAnswersMap[index] = selectedOption;
            console.log(`⚠️ Question ID not found, using array index ${index + 1}: ${selectedOption}`);
          }
        } else {
          // No questionId, use array index
          userAnswersMap[index] = selectedOption;
          console.log(`📍 No question ID, using array index ${index + 1}: ${selectedOption}`);
        }
      } else {
        console.log('❌ No selected option found for this answer');
      }
    });
  } else if (userAttemptData.userAnswers && typeof userAttemptData.userAnswers === 'object') {
    console.log('\n✅ Using userAnswers object directly');
    Object.assign(userAnswersMap, userAttemptData.userAnswers);
    console.log('userAnswers object:', userAnswersMap);
  } else {
    console.log('\n❌ No valid answers data found');
    console.log('userAttemptData.answers:', userAttemptData.answers);
    console.log('userAttemptData.userAnswers:', userAttemptData.userAnswers);
  }

  console.log('\n================================');
  console.log('📝 FINAL USER ANSWERS MAP (for UI rendering)');
  console.log('================================');
  console.log('Answers map:', userAnswersMap);
  console.log('Total mapped answers:', Object.keys(userAnswersMap).length);
  console.log('Answer indices:', Object.keys(userAnswersMap));
  console.log('Answer values:', Object.values(userAnswersMap));
  console.log('================================\n');

  // Get results from attempt data (preferred) or calculate from answers
  const questions = quizData.questions || [];
  const totalQuestions = userAttemptData.totalQuestions || questions.length;

  // Use API response values if available, otherwise calculate
  let correctCount = userAttemptData.correct !== undefined ? userAttemptData.correct : 0;
  let incorrectCount = userAttemptData.incorrect !== undefined ? userAttemptData.incorrect : 0;
  let unattemptedCount = userAttemptData.skipped !== undefined ? userAttemptData.skipped : 0;

  // If we don't have these values from API, calculate them from answers
  const shouldCalculate = userAttemptData.correct === undefined && Object.keys(userAnswersMap).length > 0;

  const questionResults = questions.map((question, index) => {
    const userAnswer = userAnswersMap[index];
    let correctAnswer = question.correct_answer || question.correctAnswer;

    // Convert correctAnswer from full text to option letter (A, B, C, D)
    if (correctAnswer && question.options) {
      const correctIndex = question.options.findIndex(option => {
        const optionText = typeof option === 'string' ? option : option.text;
        return optionText === correctAnswer;
      });

      if (correctIndex !== -1) {
        correctAnswer = String.fromCharCode(65 + correctIndex); // 0->A, 1->B, 2->C, 3->D
      }
    }

    // Normalize both answers for comparison
    const normalizedUserAnswer = userAnswer ? String(userAnswer).trim().toUpperCase() : null;
    const normalizedCorrectAnswer = correctAnswer ? String(correctAnswer).trim().toUpperCase() : null;

    let status = 'unattempted';
    if (normalizedUserAnswer) {
      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        status = 'correct';
        if (shouldCalculate) correctCount++;
      } else {
        status = 'incorrect';
        if (shouldCalculate) incorrectCount++;
      }
    } else {
      if (shouldCalculate) unattemptedCount++;
    }

    return {
      ...question,
      userAnswer,
      correctAnswer: normalizedCorrectAnswer,
      status,
      index: index + 1,
    };
  });

  // Get scores from attempt data or calculated values
  const score = userAttemptData.score !== undefined ? userAttemptData.score : correctCount;
  const percentage = totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;
  const accuracy = userAttemptData.accuracy !== undefined
    ? userAttemptData.accuracy
    : percentage;

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

  const timeSpentSeconds = userAttemptData.timeSpentSeconds || userAttemptData.effectiveTimeSeconds || 0;
  const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
  const timeSpentRemainingSeconds = timeSpentSeconds % 60;
  const formattedTimeSpent = timeSpentSeconds > 0
    ? `${timeSpentMinutes}m ${timeSpentRemainingSeconds}s`
    : 'N/A';

  const handleBackToList = () => {
    router.push('/(main)/(tabs)/dailyQuiz');
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
          <TouchableOpacity onPress={handleBackToList}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizCategory}</Text>
          <Text style={styles.headerSubtitle}>Attempted on {formattedDate}</Text>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          {/* Circular Score Display */}
          <View style={styles.scoreCircleContainer}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{score}</Text>
              <Text style={styles.scoreTotal}>/{totalQuestions}</Text>
            </View>
          </View>

          {/* Score Message */}
          <Text style={styles.scoreMessage}>
            You scored {score} out of {totalQuestions} questions correctly.
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
          {Object.keys(userAnswersMap).length === 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Your answers could not be loaded. Showing questions and correct answers only.
              </Text>
            </View>
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

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.questionExpanded}>
                    {/* Question Text */}
                    <Text style={styles.questionText}>
                      {question.question_text || question.questionText || question.text}
                    </Text>

                    {/* Options */}
                    <View style={styles.optionsList}>
                      {question.options?.map((option, optionIdx) => {
                        const optionKey = String.fromCharCode(65 + optionIdx); // A, B, C, D
                        const isUserAnswer = question.userAnswer === optionKey;
                        const isCorrectAnswer = question.correctAnswer === optionKey;

                        let optionStyle = styles.option;
                        let optionTextStyle = styles.optionText;

                        if (isCorrectAnswer) {
                          optionStyle = [styles.option, styles.optionCorrect];
                          optionTextStyle = [styles.optionText, styles.optionTextCorrect];
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          optionStyle = [styles.option, styles.optionIncorrect];
                          optionTextStyle = [styles.optionText, styles.optionTextIncorrect];
                        }

                        return (
                          <View key={optionIdx} style={optionStyle}>
                            <Text style={styles.optionKey}>{optionKey}.</Text>
                            <Text style={optionTextStyle}>{option.text || option}</Text>
                            {isCorrectAnswer && (
                              <Text style={styles.correctBadge}>✓ Correct</Text>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
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
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
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
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
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
    color: '#065F46',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: '#991B1B',
    fontWeight: '600',
  },
  correctBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 8,
  },
  incorrectBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
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
