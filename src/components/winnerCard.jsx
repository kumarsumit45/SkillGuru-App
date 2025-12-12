import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WinnerCard = ({ winner }) => {
  // Extract user info
  const userName = winner.userName || winner.displayName || 'Guest User';
  const userClass = winner.userClass || winner.class || 'N/A';
  const score = winner.score || 0;
  const accuracy = winner.accuracy || 0;
  const timeSpent = winner.timeSpent || winner.timeTaken || 0;
  const participantCount = winner.participantCount || 0;

  // Get first letter for avatar
  const avatarLetter = userName.charAt(0).toUpperCase();

  // Format time spent - convert seconds to minutes if needed
  const formatTime = (seconds) => {
    if (!seconds) return '0 m';
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes} m`;
    }
    return `${seconds} s`;
  };

  // Format time slot display
  const timeSlot = winner.slotDisplay || winner.timeSlot || 'N/A';

  return (
    <View style={styles.card}>
      {/* Time Slot Header */}
      <View style={styles.timeSlotHeader}>
        <Text style={styles.timeSlotText}>{timeSlot}</Text>
        <View style={styles.participantBadge}>
          <Text style={styles.participantText}>{participantCount} joined</Text>
        </View>
      </View>

      {/* Winner Info */}
      <View style={styles.winnerContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <View style={styles.trophyBadge}>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
        </View>

        {/* Name and Class */}
        <Text style={styles.winnerName}>{userName}</Text>
        <Text style={styles.winnerClass}>Class {userClass}</Text>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {/* Score */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="star" size={20} color="#FCD34D" />
            </View>
            <Text style={styles.statValue}>{score} pts</Text>
            <Text style={styles.statLabel}>SCORE</Text>
          </View>

          {/* Accuracy */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="checkmark-circle" size={20} color="#34D399" />
            </View>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>

          {/* Time */}
          <View style={styles.statItem}>
            <View style={styles.statIcon}>
              <Ionicons name="time-outline" size={20} color="#60A5FA" />
            </View>
            <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>TIME</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  participantBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  winnerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  trophyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trophyIcon: {
    fontSize: 14,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  winnerClass: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
});

export default WinnerCard;
