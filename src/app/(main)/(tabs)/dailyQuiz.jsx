import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  
} from 'react-native';
import  { SafeAreaView } from "react-native-safe-area-context"
import QuizCard from "../../../components/quizCard";

const QuizArenaScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('upcoming');

  const quizData = [
    {
      id: '1',
      title: 'JEE Main • Optics',
      subject: 'JEE Main • Physics',
      startTime: '22 Nov 2025, 11:00 am',
      difficulty: 'easy',
      questions: '10',
      duration: '30 min',
      timeLeft: '0 min',
      isLive: true,
      tags: ['JEE Main', 'Physics'],
      prize: false,
      startedAgo: 'Started 1 hr ago',
    },
    {
      id: '2',
      title: 'NDA • Geometry',
      subject: 'NDA • Mathematics',
      startTime: '22 Nov 2025, 11:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '0 min',
      isLive: true,
      tags: ['NDA'],
      prize: false,
      startedAgo: 'Started 1 hr ago',
    },
    {
      id: '3',
      title: 'SSC CHSL • Data Interpretation',
      subject: 'SSC CHSL • English',
      startTime: '22 Nov 2025, 11:00 am',
      difficulty: 'easy',
      questions: '10',
      duration: '30 min',
      timeLeft: '0 min',
      isLive: true,
      tags: ['SSC CHSL'],
      prize: false,
      startedAgo: 'Started 1 hr ago',
    },
    {
      id: '4',
      title: 'Class 12 • Inorganic Chemistry',
      subject: 'Class 12 • Chemistry',
      startTime: '22 Nov 2025, 10:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '0 min',
      isLive: true,
      tags: ['Class 12'],
      prize: false,
      startedAgo: 'Started 2 hrs ago',
    },
    {
      id: '5',
      title: 'Railways NTPC • Mensuration',
      subject: 'Railways NTPC • Mathematics',
      startTime: '22 Nov 2025, 10:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '0 min',
      isLive: true,
      tags: ['Railways NTPC', 'English'],
      prize: false,
      startedAgo: 'Started 2 hrs ago',
    },
    {
      id: '6',
      title: 'SSC CGL • History',
      subject: 'SSC CGL • General',
      startTime: '22 Nov 2025, 9:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '0 min',
      isLive: true,
      tags: ['SSC CGL'],
      prize: false,
      startedAgo: 'Started 3 hrs ago',
    },
  ];

  const categoryTabs = ['LIVE', 'UPCOMING', 'ATTEMPTED'];

  const handleStartQuiz = (quizId) => {
    console.log('Start Quiz:', quizId);
    // Navigate to quiz screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badgeText}>🟢 LIVE QUIZ ARENA</Text>
        <Text style={styles.headerTitle}>Live, upcoming & attempted quizzes</Text>
        <Text style={styles.headerSubtitle}>
          Pick a live quiz to join instantly, explore upcoming sessions or review your attempt history.
        </Text>
      </View>

      {/* Description Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Showing recommended quizzes across all categories and ranked from most visited.
        </Text>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSection}>
        <Text style={styles.languageLabel}>LANGUAGE</Text>
        <View style={styles.languageTabs}>
          {['ALL LANGUAGES', 'ENGLISH', 'HINDI'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageTab,
                selectedLanguage === lang && styles.languageTabActive,
              ]}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text
                style={[
                  styles.languageTabText,
                  selectedLanguage === lang && styles.languageTabTextActive,
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {categoryTabs.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category.toLowerCase() && styles.categoryTabActive,
            ]}
            onPress={() => setSelectedCategory(category.toLowerCase())}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{category}</Text>
              <Text style={styles.categoryCount}>({category === 'LIVE' ? 6 : category === 'UPCOMING' ? 543 : 0})</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quiz List */}
      <FlatList
        data={quizData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuizCard quiz={item} onStartQuiz={handleStartQuiz} />
        )}
        contentContainerStyle={styles.quizList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d0e7f7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "trasparent",
    marginVertical: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  languageSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  languageLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  languageTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  languageTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  languageTabActive: {
    backgroundColor: '#DC2626',
  },
  languageTabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  languageTabTextActive: {
    color: '#FFFFFF',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryTab: {
    flex: 1,
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
  },
  categoryBadge: {
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  categoryCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  quizList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: 20,
  },
});

export default QuizArenaScreen;