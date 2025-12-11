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

const QuizResultsPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse quiz data and answers from params
  const quiz = params.quiz ? JSON.parse(params.quiz) : null;
  const userAnswers = params.userAnswers ? JSON.parse(params.userAnswers) : {};

  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No quiz data available</Text>
      </SafeAreaView>
    );
  }

  // Calculate results
  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  // const questionResults = questions.map((question, index) => {
  //   const userAnswer = userAnswers[index];
  //   const correctAnswer = question.correct_answer || question.correctAnswer;

  //   let status = 'unattempted';
  //   if (userAnswer) {
  //     if (userAnswer === correctAnswer) {
  //       status = 'correct';
  //       correctCount++;
  //     } else {
  //       status = 'incorrect';
  //       incorrectCount++;
  //     }
  //   } else {
  //     unattemptedCount++;
  //   }

  //   return {
  //     ...question,
  //     userAnswer,
  //     correctAnswer,
  //     status,
  //     index: index + 1,
  //   };
  // });

  const questionResults = questions.map((question, index) => {
  const userAnswer = userAnswers[index];
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
      correctCount++;
    } else {
      status = 'incorrect';
      incorrectCount++;
    }
  } else {
    unattemptedCount++;
  }

  return {
    ...question,
    userAnswer,
    correctAnswer: normalizedCorrectAnswer,
    status,
    index: index + 1,
  };
});

  // Calculate score and percentage
  const score = correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Get quiz info
  const quizTitle = quiz.title || 'Quiz';
  const quizCategory = quiz.title?.split('•')[0]?.trim() || quiz.subject || 'Quiz';
  const language = quiz.language || 'English';

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
            Awesome! You've scored {score} out of {totalQuestions} questions correctly. Good job!
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
              <View style={[styles.statIcon, { backgroundColor: '#FED7AA' }]}>
                <Text style={styles.statIconText}>⚡</Text>
              </View>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.statIconText}>🏆</Text>
              </View>
              <Text style={styles.statValue}>{incorrectCount}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FECACA' }]}>
                <Text style={styles.statIconText}>⏭</Text>
              </View>
              <Text style={styles.statValue}>{unattemptedCount}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
            </View>
          </View>
        </View>

        {/* Question Breakdown */}
        <View style={styles.questionSection}>
          <Text style={styles.questionSectionTitle}>
            {totalQuestions} Questions
          </Text>
          <Text style={styles.questionSectionSubtitle}>Question Breakdown</Text>

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
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
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
    fontSize: 24,
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

export default QuizResultsPage;
