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

const QuizDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse quiz data from params
  const quiz = params.quiz ? JSON.parse(params.quiz) : null;

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quiz?.id) {
      loadQuizData();
    }
  }, [quiz?.id]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      const data = await fetchLiveQuizById(quiz.id);
      setQuizData(data);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.loadingText}>Loading quiz details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get subject from API data (quiz_metadata.subject) or extract from title as fallback
  const quizTopic = quizData?.quiz_metadata?.subject ||
                    quiz?.quiz_metadata?.subject ||
                    quiz.title.split('•')[1]?.trim() ||
                    quiz.title;
  const quizCategory = quiz.title.split('•')[0]?.trim() || quiz.subject;

  // Get language from API data or quiz params, with fallback to "English"
  const language = quizData?.language ||
                   quizData?.quiz_metadata?.language ||
                   quiz.language ||
                   quiz.quiz_metadata?.language ||
                   'English';

  // Calculate question count from API or params
  let questions = 'N/A';
  let questionCount = 0;

  if (quizData) {
    if (quizData.questionCount) {
      questions = String(quizData.questionCount);
      questionCount = quizData.questionCount;
    } else if (quizData.totalQuestions !== undefined) {
      questions = String(quizData.totalQuestions);
      questionCount = quizData.totalQuestions;
    } else if (quizData.questions) {
      if (Array.isArray(quizData.questions)) {
        questions = String(quizData.questions.length);
        questionCount = quizData.questions.length;
      } else if (typeof quizData.questions === 'number') {
        questions = String(quizData.questions);
        questionCount = quizData.questions;
      } else if (typeof quizData.questions === 'string') {
        questions = quizData.questions;
        questionCount = parseInt(quizData.questions) || 0;
      }
    }
  } else if (quiz.questions) {
    if (typeof quiz.questions === 'number') {
      questions = String(quiz.questions);
      questionCount = quiz.questions;
    } else {
      questions = String(quiz.questions);
      questionCount = parseInt(quiz.questions) || 0;
    }
  }

  // Calculate duration from API or params
  let duration = 'N/A';

  // Check API data first
  if (quizData?.duration) {
    duration = typeof quizData.duration === 'string' ? quizData.duration : `${quizData.duration} min`;
  } else if (quizData?.durationMinutes) {
    duration = `${quizData.durationMinutes} min`;
  }
  // Calculate from metadata
  else if (quizData?.quiz_metadata?.time_per_question && questionCount > 0) {
    const totalSeconds = questionCount * quizData.quiz_metadata.time_per_question;
    const totalMinutes = Math.ceil(totalSeconds / 60);
    duration = `${totalMinutes} min`;
  }
  // Fallback to params
  else if (quiz.duration) {
    duration = quiz.duration;
  }
  // Last resort: calculate from question count
  else if (questionCount > 0) {
    const totalMinutes = Math.ceil((questionCount * 75) / 60);
    duration = `${totalMinutes} min`;
  }

  const handleStartQuiz = () => {
    console.log('Starting quiz:', quiz.id);
    // Navigate to quiz live page with merged data (API data + params)
    const mergedQuizData = {
      ...quiz,
      duration: duration,
      questions: questions,
      ...(quizData || {}), // Merge API data if available
    };

    router.push({
      pathname: '/QuizLivePage',
      params: {
        quiz: JSON.stringify(mergedQuizData),
      },
    });
  };

  const handleBackToList = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToList}
          >
            <Text style={styles.backButtonText}>← BACK</Text>
          </TouchableOpacity>

          <Text style={styles.categoryLabel}>{quizCategory.toUpperCase()}</Text>

          <Text style={styles.quizTitle}>{quiz.title}</Text>

          <View style={styles.tagsContainer}>
            <View style={styles.languageTag}>
              <Text style={styles.languageTagText}>{language}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{quiz.startTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

         <Text style={styles.topicTitle}>{quizTopic}</Text>

          <Text style={styles.description}>
            You will have exactly {duration} inside the quiz room. Answers are locked once submitted.{'\n'}
            Leaderboard updates in real-time the moment you finish.
          </Text>

          <View style={styles.infoBoxesContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>QUESTIONS</Text>
              <Text style={styles.infoBoxValue}>{questions}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>TIME LIMIT</Text>
              <Text style={styles.infoBoxValue}>{duration}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>LANGUAGE</Text>
              <Text style={styles.infoBoxValue}>{language}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartQuiz}
          >
            <Text style={styles.startButtonText}>START QUIZ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToListButton}
            onPress={handleBackToList}
          >
            <Text style={styles.backToListButtonText}>BACK TO LIST</Text>
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 34,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
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
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  topicTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 38,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
  },
  infoBoxesContainer: {
    gap: 12,
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  infoBoxValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  startButton: {
    backgroundColor: '#B45309',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  backToListButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  backToListButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default QuizDetails;
