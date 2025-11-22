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
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live right now</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.prizeText}>No Prize</Text>
        </TouchableOpacity>
      </View>

      {/* Quiz Title */}
      <Text style={styles.quizTitle}>{quiz.title}</Text>

      {/* Subject Tags */}
      <View style={styles.tagContainer}>
        {quiz.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Quiz Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>SUBJECT</Text>
          <Text style={styles.detailValue}>{quiz.subject}</Text>
        </View>
      </View>

      {/* Start Time */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>STARTED AT</Text>
        <Text style={styles.timeValue}>{quiz.startTime}</Text>
      </View>

      {/* Quiz Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>QUESTIONS</Text>
          <Text style={styles.statValue}>{quiz.questions}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DURATION</Text>
          <Text style={styles.statValue}>{quiz.duration}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TIME LEFT</Text>
          <Text style={styles.statValue}>{quiz.timeLeft}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.startedAgo}>{quiz.startedAgo}</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStartQuiz(quiz.id)}
        >
          <Text style={styles.startButtonText}>START QUIZ</Text>
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
  detailItem: {
    marginBottom: 8,
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