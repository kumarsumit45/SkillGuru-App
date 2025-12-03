import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const QuizDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse quiz data from params
  const quiz = params.quiz ? JSON.parse(params.quiz) : null;

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>No quiz data available</Text>
      </SafeAreaView>
    );
  }

  // Extract quiz topic from title (e.g., "JEE Main • Optics" -> "Optics")
  const quizTopic = quiz.title.split('•')[1]?.trim() || quiz.title;
  const quizCategory = quiz.title.split('•')[0]?.trim() || quiz.subject;

  // Extract language from tags or default to "Hindi"
  const language = quiz.tags.find(tag =>
    ['Hindi', 'English'].includes(tag)
  ) || 'English';

  const handleStartQuiz = () => {
    console.log('Starting quiz:', quiz.id);
    // Navigate to quiz live page
    router.push({
      pathname: '/QuizLivePage',
      params: {
        quiz: JSON.stringify(quiz),
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
            <View style={styles.tag}>
              <Text style={styles.tagText}>{language}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{quiz.startTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.topicTitle}>{quizTopic}</Text>

          <Text style={styles.description}>
            You will have exactly {quiz.duration} inside the quiz room. Answers are locked once submitted.{'\n'}
            Leaderboard updates in real-time the moment you finish.
          </Text>

          <View style={styles.infoBoxesContainer}>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>QUESTIONS</Text>
              <Text style={styles.infoBoxValue}>{quiz.questions}</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxLabel}>TIME LIMIT</Text>
              <Text style={styles.infoBoxValue}>{quiz.duration}</Text>
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
