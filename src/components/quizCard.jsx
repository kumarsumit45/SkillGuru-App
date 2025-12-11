import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Badge,
} from 'react-native';

const QuizCard = ({ quiz, onStartQuiz }) => {
  return (
    <View style={styles.card}>
      {/* Header with Live Badge */}
      <View style={styles.cardHeader}>
        {quiz.category === 'live' && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live right now</Text>
          </View>
        )}
        {quiz.category === 'upcoming' && (
          <View style={styles.upcomingIndicator}>
            <Text style={styles.upcomingText}>Upcoming</Text>
          </View>
        )}
        {quiz.category === 'attempted' && quiz.score && (
          <View style={styles.scoreIndicator}>
            <Text style={styles.scoreText}>Score: {quiz.score}</Text>
          </View>
        )}
        <TouchableOpacity>
          <Text style={styles.prizeText}>{quiz.prize ? 'Prize Quiz' : 'No Prize'}</Text>
        </TouchableOpacity>
      </View>

      {/* Quiz Title */}
      <Text style={styles.quizTitle}>{quiz.title || 'Quiz'}</Text>

      {/* Language and Subject Tags */}
      <View style={styles.tagContainer}>
        {quiz.language && (
          <View style={styles.languageTag}>
            <Text style={styles.languageTagText}>{quiz.language}</Text>
          </View>
        )}
        {quiz.tags && quiz.tags.length > 0 && quiz.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Quiz Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>SUBJECT</Text>
            <Text style={styles.detailValue}>{quiz.subject || 'General'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>DIFFICULTY</Text>
            <Text style={[styles.detailValue, styles.difficultyText]}>
              {quiz.difficulty ? quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1) : 'Intermediate'}
            </Text>
          </View>
        </View>
      </View>

      {/* Start Time */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>
          {quiz.category === 'live' ? 'STARTED AT' :
           quiz.category === 'upcoming' ? 'STARTS AT' :
           'ATTEMPTED ON'}
        </Text>
        <Text style={styles.timeValue}>{quiz.startTime || 'N/A'}</Text>
      </View>

      {/* Quiz Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>QUESTIONS</Text>
          <Text style={styles.statValue}>{quiz.questions || 'N/A'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DURATION</Text>
          <Text style={styles.statValue}>{quiz.duration || 'N/A'}</Text>
        </View>
        {quiz.category === 'live' && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>TIME LEFT</Text>
            <Text style={styles.statValue}>{quiz.timeLeft || 'N/A'}</Text>
          </View>
        )}
        {quiz.category === 'attempted' && quiz.score && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>YOUR SCORE</Text>
            <Text style={[styles.statValue, styles.scoreHighlight]}>{quiz.score}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.startedAgo}>{quiz.startedAgo || ''}</Text>
        <TouchableOpacity
          style={[
            styles.startButton,
            quiz.category === 'upcoming' && styles.upcomingButton,
            quiz.category === 'attempted' && styles.attemptedButton,
          ]}
          onPress={() => onStartQuiz(quiz.id)}
        >
          <Text style={styles.startButtonText}>
            {quiz.category === 'live' ? 'START QUIZ' :
             quiz.category === 'upcoming' ? 'VIEW DETAILS' :
             'VIEW RESULTS'}
          </Text>
          <Text style={styles.startButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  upcomingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563EB',
  },
  scoreIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  prizeText: {
    fontSize: 11,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  languageTagText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  difficultyText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  timeContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreHighlight: {
    color: '#059669',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startedAgo: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  startButton: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  upcomingButton: {
    backgroundColor: '#2563EB',
  },
  attemptedButton: {
    backgroundColor: '#059669',
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startButtonArrow: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default QuizCard;