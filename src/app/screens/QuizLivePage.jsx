import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchLiveQuizById, startLiveQuizSession, completeLiveQuizSession } from '../../api/liveQuizApi';
import useAuthStore from '../../store/authStore';

const QuizLivePage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const quiz = params.quiz ? JSON.parse(params.quiz) : null;
  const { uid } = useAuthStore();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // Quiz duration timer (time limit to complete)
  const [sessionId, setSessionId] = useState(null); // Track quiz session
  const [quizStartTime, setQuizStartTime] = useState(null); // Track when quiz started

  useEffect(() => {
    if (quiz?.id) {
      // Reset all state when starting a new quiz
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimeLeft(0);
      setSessionId(null);
      setQuizStartTime(null);

      // Load the new quiz data
      loadQuizData();
    }
  }, [quiz?.id]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizData?.questions?.length > 0 && quizStartTime) {
      // Auto-submit when timer reaches zero
      console.log('Time is up! Auto-submitting quiz...');
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const data = await fetchLiveQuizById(quiz.id);
      setQuizData(data);

      // Calculate quiz duration (time limit to complete the quiz)
      calculateTimeFromDuration(data);

      // Start quiz session with backend (if user is logged in)
      if (uid && quiz.id) {
        try {
          const sessionData = await startLiveQuizSession(quiz.id, {
            userId: uid,
            startedAt: new Date().toISOString(),
          });

          if (sessionData?.sessionId) {
            setSessionId(sessionData.sessionId);
            setQuizStartTime(Date.now());
            console.log('Quiz session started:', sessionData.sessionId);
          }
        } catch (sessionError) {
          console.warn('Failed to start quiz session:', sessionError);
          // Continue without session - user can still take quiz locally
        }
      }
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeFromDuration = (data) => {
    let durationSeconds = null;

    // Check for direct duration field
    if (data?.duration) {
      const match = data.duration.match(/\d+/);
      if (match) {
        durationSeconds = parseInt(match[0]) * 60; // Convert minutes to seconds
      }
    } else if (data?.durationMinutes) {
      durationSeconds = data.durationMinutes * 60; // Convert minutes to seconds
    }
    // Calculate from metadata (most accurate for live quizzes)
    else if (data?.quiz_metadata?.time_per_question) {
      let questionCount = 0;
      if (data.totalQuestions) {
        questionCount = data.totalQuestions;
      } else if (data.quiz_metadata?.total_questions) {
        questionCount = data.quiz_metadata.total_questions;
      } else if (Array.isArray(data.questions)) {
        questionCount = data.questions.length;
      }

      if (questionCount > 0) {
        // Subtract 15 seconds from each question's time (75 - 15 = 60 seconds per question)
        durationSeconds = questionCount * (data.quiz_metadata.time_per_question - 15);
      }
    }
    // Fallback to params
    else if (quiz?.duration) {
      const match = quiz.duration.match(/\d+/);
      if (match) {
        durationSeconds = parseInt(match[0]) * 60; // Convert minutes to seconds
      }
    }

    if (durationSeconds) {
      setTimeLeft(durationSeconds);
    } else {
      // Ultimate fallback: 30 minutes
      setTimeLeft(30 * 60);
    }
  };

  const handleBack = () => {
    // Reset state before navigating back
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(0);
    setSessionId(null);
    setQuizStartTime(null);

    router.back();
  };

  const handleFinishTest = () => {
    // Navigate to results page
    handleSubmitQuiz();
  };

  const handleSelectOption = (optionKey) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionKey,
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    const totalQuestions = quizData?.questions?.length || 0;
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitAnswer = () => {
    // Save the current answer (already saved in state)
    console.log('Answer saved:', selectedAnswers[currentQuestionIndex]);

    const totalQuestions = quizData?.questions?.length || 0;

    // If this is the last question, submit the quiz
    if (currentQuestionIndex === totalQuestions - 1) {
      handleSubmitQuiz();
    } else {
      // Move to next question
      handleNext();
    }
  };

  const handleSubmitQuiz = async () => {
    // Calculate quiz results
    const questions = quizData?.questions || [];
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    // Convert answers for backend submission
    const answersArray = questions.map((question, index) => {
      const userAnswer = selectedAnswers[index];
      let correctAnswer = question.correct_answer || question.correctAnswer;

      // Convert correct answer to option letter if needed
      if (correctAnswer && question.options) {
        const correctIndex = question.options.findIndex(option => {
          const optionText = typeof option === 'string' ? option : option.text;
          return optionText === correctAnswer;
        });
        if (correctIndex !== -1) {
          correctAnswer = String.fromCharCode(65 + correctIndex);
        }
      }

      const isCorrect = userAnswer && userAnswer === correctAnswer;
      if (userAnswer) {
        if (isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      } else {
        unattemptedCount++;
      }

      return {
        questionId: question.id || question._id || `q_${index}`,
        selectedOption: userAnswer || null,
        isCorrect: isCorrect,
      };
    });

    // Calculate time spent
    const timeSpentSeconds = quizStartTime ? Math.floor((Date.now() - quizStartTime) / 1000) : 0;

    // Submit quiz session to backend (if session exists)
    if (uid && quiz.id && sessionId) {
      try {
        await completeLiveQuizSession({
          quizId: quiz.id,
          sessionId: sessionId,
          answers: answersArray,
          summary: {
            userId: uid,
            score: correctCount,
            totalQuestions: questions.length,
            correctCount: correctCount,
            incorrectCount: incorrectCount,
            unattemptedCount: unattemptedCount,
            timeSpentSeconds: timeSpentSeconds,
            completedAt: new Date().toISOString(),
          },
        });
        console.log('Quiz attempt saved to backend successfully!');
      } catch (error) {
        console.error('Failed to save quiz attempt:', error);
        // Continue to results page even if save fails
      }
    } else {
      console.warn('No session ID or user ID - quiz attempt not saved to backend');
    }

    // Navigate to results page with quiz data and user answers
    const resultsData = {
      ...quiz,
      questions: quizData?.questions || [],
    };

    router.push({
      pathname: '/screens/QuizResultsPage',
      params: {
        quiz: JSON.stringify(resultsData),
        userAnswers: JSON.stringify(selectedAnswers),
      },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No quiz data available</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B45309" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];
  const totalQuestions = quizData?.questions?.length || 0;
  const quizCategory = quiz.title.split('•')[0]?.trim() || quiz.subject;

  // Get language from API data or quiz params, with fallback to "English"
  const language = quizData?.language ||
                   quizData?.quiz_metadata?.language ||
                   quiz.language ||
                   quiz.quiz_metadata?.language ||
                   'English';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>

          {/* Quiz Title Section */}
          <Text style={styles.categoryLabel}>{quizCategory.toUpperCase()}</Text>
          <Text style={styles.quizTitle}>{quiz.title}</Text>

          {/* Tags: Language and Time */}
          <View style={styles.tagsContainer}>
            <View style={styles.languageTag}>
              <Text style={styles.languageTagText}>{language}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{quiz.startTime}</Text>
            </View>
          </View>


          {/* Finish Test Button */}
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishTest}
          >
            <Text style={styles.finishButtonText}>FINISH TEST</Text>
          </TouchableOpacity>

          {/* Question Counter and Time Left */}
          <View style={styles.questionInfoContainer}>
            <View style={styles.questionCounterSection}>
              <Text style={styles.questionCategory}>{quizCategory.toUpperCase()}</Text>
              <Text style={styles.questionCounter}>
                Question {currentQuestionIndex + 1}/{totalQuestions}
              </Text>
              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
                  ]}
                />
              </View>
              {/* Answered Count */}
              <Text style={styles.answeredCount}>
                {Object.keys(selectedAnswers).length} answered • {totalQuestions - Object.keys(selectedAnswers).length} remaining
              </Text>
            </View>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>TIME LIMIT</Text>
              <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          {/* Question Text */}
          {!currentQuestion && totalQuestions === 0 && (
            <View style={styles.noQuestionsContainer}>
              <Text style={styles.errorText}>
                No questions available for this quiz
              </Text>
              <Text style={styles.errorSubText}>
                Quiz data might not have loaded correctly
              </Text>
            </View>
          )}
          {currentQuestion && (
            <>
              <Text style={styles.questionText}>
                {currentQuestion.question_text || currentQuestion.questionText || currentQuestion.text}
              </Text>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {currentQuestion.options?.map((option, index) => {
                  const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = selectedAnswers[currentQuestionIndex] === optionKey;

                  return (
                    <TouchableOpacity
                      key={optionKey}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleSelectOption(optionKey)}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}>
                          <Text style={[
                            styles.optionLabelText,
                            isSelected && styles.optionLabelTextSelected,
                          ]}>
                            {optionKey}
                          </Text>
                        </View>
                        <Text style={styles.optionText}>
                          {option.text || option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Navigation Buttons */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentQuestionIndex === 0 && styles.navButtonDisabled,
                  ]}
                  onPress={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <Text style={[
                    styles.navButtonText,
                    currentQuestionIndex === 0 && styles.navButtonTextDisabled,
                  ]}>
                    PREVIOUS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentQuestionIndex === totalQuestions - 1 && styles.navButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  <Text style={[
                    styles.navButtonText,
                    currentQuestionIndex === totalQuestions - 1 && styles.navButtonTextDisabled,
                  ]}>
                    NEXT
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitAnswer}
                >
                  <Text style={styles.submitButtonText}>
                    {currentQuestionIndex === totalQuestions - 1 ? 'SUBMIT QUIZ' : 'SUBMIT ANSWER'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F8',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  errorSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  noQuestionsContainer: {
    padding: 24,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 25,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    letterSpacing: 0.5,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 30,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  languageTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  languageTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  sponsorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sponsorArrow: {
    fontSize: 12,
    color: '#9333EA',
    marginRight: 8,
  },
  sponsorText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  finishButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    marginBottom: 32,
  },
  finishButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 1,
  },
  questionInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  questionCounterSection: {
    flex: 1,
    marginRight: 16,
  },
  questionCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  questionCounter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B45309',
    borderRadius: 3,
  },
  answeredCount: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  timerContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  timerValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    borderColor: '#B45309',
    backgroundColor: '#FEF3C7',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionLabelSelected: {
    backgroundColor: '#B45309',
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  optionLabelTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  navButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  submitButton: {
    flex: 1,
    minWidth: '100%',
    backgroundColor: '#B45309',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});

export default QuizLivePage;
