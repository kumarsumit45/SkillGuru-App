import { Entypo, Feather, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchUserProfile } from '../../../api/profileUserApi';
import { auth } from '../../../config/firebase';
import useAuthStore from '../../../store/authStore';
import config from '../../../config';
import styles from '../../../assets/styles/profile.styles';

const ProfilePage = () => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [referralsModalVisible, setReferralsModalVisible] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const { uid, clearAuth, profileRefreshTrigger } = useAuthStore();
  const router = useRouter();

  // Fetch user profile data
  useEffect(() => {
    loadUserProfile();
  }, [uid]);

  // Listen for profile refresh trigger
  useEffect(() => {
    if (profileRefreshTrigger > 0) {
      loadUserProfile();
    }
  }, [profileRefreshTrigger]);

  const loadUserProfile = async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const profileData = await fetchUserProfile(uid);

      // Map actual API response fields with defaults for Performance Overview
      const transformedData = {
        name: profileData.fullName || "No_Name_Provided",
        email: profileData.userEmail ?? "Email Not Provided",
        phoneNumber: profileData.userPhone || profileData.phoneNumber,
        status: profileData["Is online"] ? "Online" : "Offline",
        avatar: profileData.profileImageUrl || null,
        referralLink: profileData.referralLink || `https://theskillguru.org/signup?ref=${profileData.id}`,
        city: profileData.city,
        state: profileData.state,
        guruSkills: profileData["Guru skills"] || [],
        learnerSkills: profileData.learnerSkills || [],
        stats: {
          reputationScore: profileData.reputationScore ?? 0,
          totalCallTime: profileData.totalCallTime ?? "0.0h",
          questionsAsked: profileData.questionsAsked ?? 0,
          solutionsProvided: profileData.solutionsProvided ?? 0,
          liveImpactScore: profileData.liveImpactScore ?? 0,
          learningTime: profileData.learningTime ?? "0h 0m"
        },
        weeklyGoal: profileData.weeklyGoal ? {
          target: profileData.weeklyGoal.target,
          current: profileData.weeklyGoal.current,
          percentage: profileData.weeklyGoal.percentage
        } : null,
        dailyProgress: profileData.dailyProgress || [],
        referralsCount: profileData.referralsCount
      };

      setUserData(transformedData);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

  const handleCopyLink = async () => {
    if (!userData?.referralLink) return;
    await Clipboard.setStringAsync(userData.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!userData?.referralLink) return;
    try {
      await Share.share({
        message: `Join SkillGuru and start learning! ${userData.referralLink}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem('uid');
              await AsyncStorage.removeItem('authToken');

              // Sign out from Firebase
              if (auth.currentUser) {
                await auth.signOut();
              }

              // Clear auth store
              clearAuth();

              // Navigate to auth screen
              router.replace('/(auth)');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const fetchReferrals = async () => {
    if (!uid) return;

    try {
      setReferralsLoading(true);
      const response = await fetch(`${config.backendUrl}/referral/get-referrals/${uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();
      setReferrals(data.referrals || []);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      Alert.alert('Error', 'Failed to load referrals');
    } finally {
      setReferralsLoading(false);
    }
  };

  const handleViewReferrals = () => {
    setReferralsModalVisible(true);
    // fetchReferrals();
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No user data state
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="person-outline" size={48} color="#9ca3af" />
          <Text style={styles.emptyText}>Please log in to view your profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#6366f1']}
          tintColor="#6366f1"
        />
      }
    >
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
            <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7} onPress={()=> router.push('/screens/EditProfile') }>
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

          <Text style={styles.userPhone}>{userData.phoneNumber}</Text>

          <View style={styles.profileButtons}>
            <TouchableOpacity style={styles.editButton} onPress={() => router.push('/screens/EditProfile')}>
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

        {userData.weeklyGoal ? (
          <View style={styles.weeklyGoal}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Weekly Learning Goal ({userData.weeklyGoal.target} hours)</Text>
              <Text style={styles.goalPercentage}>{userData.weeklyGoal.percentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${userData.weeklyGoal.percentage}%` }]} />
            </View>
            <View style={styles.goalTimeline}>
              <Text style={styles.goalTime}>{userData.weeklyGoal.current}h</Text>
              <Text style={styles.goalTime}>{userData.weeklyGoal.target}h</Text>
            </View>
          </View>
        ) : (
          <View style={styles.weeklyGoal}>
            <Text style={styles.emptyProgressText}>No weekly goal set yet</Text>
          </View>
        )}

        <View style={styles.dailyProgress}>
          <Text style={styles.dailyProgressTitle}>This Week's Daily Progress</Text>
          {userData.dailyProgress && userData.dailyProgress.length > 0 ? (
            userData.dailyProgress.map((item, index) => (
              <View key={index} style={styles.dailyItem}>
                <Text style={styles.dailyDay}>{item.day}</Text>
                <Text style={styles.dailyTime}>{item.time}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyProgressText}>No progress data available yet</Text>
          )}
        </View>
      </View>

      {/* View Referrals Button */}
      <TouchableOpacity style={styles.referralsButton} activeOpacity={0.8} onPress={handleViewReferrals}>
        <FontAwesome5 name="users" size={16} color="#fff" />
        <Text style={styles.referralsButtonText}>
          View Referrals ({userData.referralsCount ?? 0})
        </Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>

    {/* Referrals Modal */}
    <Modal
      visible={referralsModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setReferralsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <FontAwesome5 name="users" size={24} color="#6366f1" />
              <Text style={styles.modalTitle}>My Referrals</Text>
            </View>
            <TouchableOpacity
              onPress={() => setReferralsModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <View style={styles.modalBody}>
            {referralsLoading ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.modalLoadingText}>Loading referrals...</Text>
              </View>
            ) : referrals.length === 0 ? (
              <View style={styles.emptyReferralsContainer}>
                <View style={styles.emptyReferralsIcon}>
                  <FontAwesome5 name="user-plus" size={60} color="#9ca3af" />
                </View>
                <Text style={styles.emptyReferralsTitle}>No referrals yet</Text>
                <Text style={styles.emptyReferralsSubtitle}>
                  Share your referral link to{'\n'}start earning rewards!
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.referralsList} showsVerticalScrollIndicator={false}>
                {referrals.map((referral, index) => (
                  <View key={index} style={styles.referralItem}>
                    <View style={styles.referralAvatar}>
                      <Ionicons name="person" size={20} color="#6366f1" />
                    </View>
                    <View style={styles.referralInfo}>
                      <Text style={styles.referralName}>{referral.name || 'User'}</Text>
                      <Text style={styles.referralDate}>
                        {referral.joinedDate || 'Recently joined'}
                      </Text>
                    </View>
                    <View style={styles.referralBadge}>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  </SafeAreaView>
  );
};



export default ProfilePage;
