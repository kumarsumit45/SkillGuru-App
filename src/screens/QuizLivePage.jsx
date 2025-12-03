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
import { fetchLiveQuizById } from '../api/liveQuizApi';

const QuizLivePage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const quiz = params.quiz ? JSON.parse(params.quiz) : null;

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (quiz?.id) {
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
    }
  }, [timeLeft]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const data = await fetchLiveQuizById(quiz.id);
      setQuizData(data);

      // Parse duration and set timer (assuming duration is in format "15 min")
      if (data?.duration || quiz?.duration) {
        const durationStr = data?.duration || quiz?.duration;
        const minutes = parseInt(durationStr.match(/\d+/)?.[0] || '15');
        setTimeLeft(minutes * 60); // Convert to seconds
      }
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFinishTest = () => {
    // TODO: Implement finish test logic
    router.back();
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
    // TODO: Implement submit answer logic
    console.log('Submitting answer:', selectedAnswers[currentQuestionIndex]);
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
  const language = quiz.tags?.find(tag =>
    ['Hindi', 'English'].includes(tag)
  ) || 'English';

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
            <View style={styles.tag}>
              <Text style={styles.tagText}>{language}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{quiz.startTime}</Text>
            </View>
          </View>

          {/* Sponsor/Partner Logo */}
          <View style={styles.sponsorContainer}>
            <Text style={styles.sponsorArrow}>▶</Text>
            <Text style={styles.sponsorText}>accenture</Text>
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
            <View>
              <Text style={styles.questionCategory}>{quizCategory.toUpperCase()}</Text>
              <Text style={styles.questionCounter}>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Text>
            </View>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>TIME LEFT</Text>
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
                  <Text style={styles.submitButtonText}>SUBMIT ANSWER</Text>
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
