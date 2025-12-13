import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5, Feather,Entypo } from '@expo/vector-icons';
import COLORS from '../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfilePage = () => {
  const [copied, setCopied] = useState(false);

  // Mock user data - replace with actual data from your store/API
  const userData = {
    name: "Sk Sabir",
    email: "sksabir9994@gmail.com",
    status: "Offline",
    avatar: null,
    referralLink: "https://theskillguru.org/signup?ref=9e695...",
    stats: {
      reputationScore: 0.0,
      totalCallTime: "0.0h",
      questionsAsked: 0,
      solutionsProvided: 0,
      liveImpactScore: 0,
      learningTime: "0h 0m"
    },
    weeklyGoal: {
      target: 28,
      current: 0,
      percentage: 0.0
    },
    dailyProgress: [
      { day: "Saturday, 6 Dec", time: "0h 0m - 4h 5m" },
      { day: "Sunday, 7 Dec", time: "0h 0m - 4h 5m" },
      { day: "Monday, 8 Dec", time: "0h 0m - 4h 5m" },
      { day: "Tuesday, 9 Dec", time: "0h 0m - 4h 5m" },
      { day: "Wednesday, 10 Dec", time: "0h 0m - 4h 5m" },
      { day: "Thursday, 11 Dec", time: "0h 0m - 4h 5m" },
      { day: "Friday, 12 Dec", time: "0h 0m - 4h 5m" },
    ],
    referralsCount: 0
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(userData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join SkillGuru and start learning! ${userData.referralLink}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    // Implement logout logic
    console.log('Logout pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Text style={styles.headerSubtitle}>Track your learning journey and achievements</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        />

        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {userData.avatar ? (
              <Image source={{ uri: userData.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userData.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData.name}</Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: userData.status === 'Online' ? '#10b981' : '#6b7280' }]} />
            <Text style={styles.statusText}>{userData.status}</Text>
          </View>

          <Text style={styles.userEmail}>{userData.email}</Text>

          <View style={styles.profileButtons}>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Feather name="share-2" size={18} color="#6366f1" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Share & Earn Rewards */}
      <View style={styles.rewardsCard}>
        <View style={styles.rewardsHeader}>
          <MaterialIcons name="card-giftcard" size={22} color="#f59e0b" />
          <Text style={styles.rewardsTitle}>Share & Earn Rewards</Text>
        </View>
        <Text style={styles.rewardsSubtitle}>
          Invite friends and earn rewards when they join SkillGuru
        </Text>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText} numberOfLines={1}>
            {userData.referralLink}
          </Text>
        </View>

        <View style={styles.linkButtons}>
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copiedButton]}
            onPress={handleCopyLink}
          >
            <Ionicons name={copied ? "checkmark" : "copy-outline"} size={18} color="#fff" />
            <Text style={styles.copyButtonText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareSmallButton} onPress={handleShare}>
            <Feather name="share-2" size={18} color="#f59e0b" />
            <Text style={styles.shareSmallButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performance Overview */}
      <View style={styles.performanceCard}>
        <View style={styles.sectionHeader}>
          <Entypo name="bar-graph" size={18} color="#6b7280" />
          <Text style={styles.sectionTitle}>Performance Overview</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <MaterialIcons name="stars" size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Reputation Score</Text>
            <Text style={styles.statValue}>{userData.stats.reputationScore}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.statLabel}>Total Call Time</Text>
            <Text style={styles.statValue}>{userData.stats.totalCallTime}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Ionicons name="help-circle-outline" size={20} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Questions Asked</Text>
            <Text style={styles.statValue}>{userData.stats.questionsAsked}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Ionicons name="bulb-outline" size={20} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Solutions Provided</Text>
            <Text style={styles.statValue}>{userData.stats.solutionsProvided}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flash-outline" size={20} color="#ef4444" />
            </View>
            <Text style={styles.statLabel}>Live Impact Score</Text>
            <Text style={styles.statValue}>{userData.stats.liveImpactScore}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIconContainer}>
              <Ionicons name="timer-outline" size={20} color="#f97316" />
            </View>
            <Text style={styles.statLabel}>Learning Time</Text>
            <Text style={styles.statValue}>{userData.stats.learningTime}</Text>
          </View>
        </View>
      </View>

      {/* Learning Goals & Progress */}
      <View style={styles.goalsCard}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="emoji-events" size={20} color="#f59e0b" />
          <Text style={styles.sectionTitle}>Learning Goals & Progress</Text>
        </View>

        <View style={styles.weeklyGoal}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Weekly Learning Goal ({userData.weeklyGoal.target} hours)</Text>
            <Text style={styles.goalPercentage}>{userData.weeklyGoal.percentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${userData.weeklyGoal.percentage}%` }]} />
          </View>
          <View style={styles.goalTimeline}>
            <Text style={styles.goalTime}>0h 0m</Text>
            <Text style={styles.goalTime}>28h 0m</Text>
          </View>
        </View>

        <View style={styles.dailyProgress}>
          <Text style={styles.dailyProgressTitle}>This Week's Daily Progress</Text>
          {userData.dailyProgress.map((item, index) => (
            <View key={index} style={styles.dailyItem}>
              <Text style={styles.dailyDay}>{item.day}</Text>
              <Text style={styles.dailyTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* View Referrals Button */}
      <TouchableOpacity style={styles.referralsButton}>
        <FontAwesome5 name="users" size={16} color="#fff" />
        <Text style={styles.referralsButtonText}>
          View Referrals ({userData.referralsCount})
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSection: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientHeader: {
    height: 100,
    width: '100%',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e7ff',
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  profileButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  shareButtonText: {
    color: '#6366f1',
    fontSize: 15,
    fontWeight: '600',
  },
  rewardsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  rewardsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  rewardsSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  linkContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  linkText: {
    fontSize: 13,
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  linkButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  copiedButton: {
    backgroundColor: '#10b981',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  shareSmallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    gap: 6,
  },
  shareSmallButtonText: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
  },
  performanceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  goalsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyGoal: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  goalTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dailyProgress: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  dailyProgressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dailyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dailyDay: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  dailyTime: {
    fontSize: 13,
    color: '#9ca3af',
  },
  referralsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  referralsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fecaca',
    gap: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 30,
  },
});

export default ProfilePage;
