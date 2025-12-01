import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import FloatingFilter from "../../../components/floatingFilters";
import QuizCard from "../../../components/quizCard";

const QuizArenaScreen = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('live');

  const quizData = [
    // LIVE Quizzes
    {
      id: '1',
      title: 'JEE Main • Optics',
      subject: 'JEE Main • Physics',
      startTime: '22 Nov 2025, 11:00 am',
      difficulty: 'easy',
      questions: '10',
      duration: '30 min',
      timeLeft: '15 min',
      isLive: true,
      category: 'live',
      tags: ['JEE Main', 'Physics'],
      prize: false,
      startedAgo: 'Started 15 min ago',
    },
    {
      id: '2',
      title: 'NDA • Geometry',
      subject: 'NDA • Mathematics',
      startTime: '22 Nov 2025, 11:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '20 min',
      isLive: true,
      category: 'live',
      tags: ['NDA'],
      prize: false,
      startedAgo: 'Started 10 min ago',
    },
    {
      id: '3',
      title: 'SSC CHSL • Data Interpretation',
      subject: 'SSC CHSL • English',
      startTime: '22 Nov 2025, 11:00 am',
      difficulty: 'easy',
      questions: '10',
      duration: '30 min',
      timeLeft: '25 min',
      isLive: true,
      category: 'live',
      tags: ['SSC CHSL'],
      prize: false,
      startedAgo: 'Started 5 min ago',
    },
    {
      id: '4',
      title: 'Class 12 • Inorganic Chemistry',
      subject: 'Class 12 • Chemistry',
      startTime: '22 Nov 2025, 10:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '10 min',
      isLive: true,
      category: 'live',
      tags: ['Class 12'],
      prize: false,
      startedAgo: 'Started 20 min ago',
    },
    {
      id: '5',
      title: 'Railways NTPC • Mensuration',
      subject: 'Railways NTPC • Mathematics',
      startTime: '22 Nov 2025, 10:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '5 min',
      isLive: true,
      category: 'live',
      tags: ['Railways NTPC', 'English'],
      prize: false,
      startedAgo: 'Started 25 min ago',
    },
    {
      id: '6',
      title: 'SSC CGL • History',
      subject: 'SSC CGL • General',
      startTime: '22 Nov 2025, 9:00 am',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '8 min',
      isLive: true,
      category: 'live',
      tags: ['SSC CGL'],
      prize: false,
      startedAgo: 'Started 22 min ago',
    },
    // UPCOMING Quizzes
    {
      id: '7',
      title: 'UPSC • Indian Polity',
      subject: 'UPSC • General Studies',
      startTime: '23 Nov 2025, 10:00 am',
      difficulty: 'hard',
      questions: '15',
      duration: '45 min',
      timeLeft: '',
      isLive: false,
      category: 'upcoming',
      tags: ['UPSC', 'GS'],
      prize: true,
      startedAgo: 'Starts in 1 day',
    },
    {
      id: '8',
      title: 'NEET • Human Anatomy',
      subject: 'NEET • Biology',
      startTime: '23 Nov 2025, 2:00 pm',
      difficulty: 'Intermediate',
      questions: '20',
      duration: '60 min',
      timeLeft: '',
      isLive: false,
      category: 'upcoming',
      tags: ['NEET', 'Biology'],
      prize: false,
      startedAgo: 'Starts in 1 day',
    },
    {
      id: '9',
      title: 'Bank PO • Quantitative Aptitude',
      subject: 'Bank PO • Mathematics',
      startTime: '24 Nov 2025, 11:00 am',
      difficulty: 'Intermediate',
      questions: '25',
      duration: '50 min',
      timeLeft: '',
      isLive: false,
      category: 'upcoming',
      tags: ['Bank PO'],
      prize: true,
      startedAgo: 'Starts in 2 days',
    },
    {
      id: '10',
      title: 'CAT • Logical Reasoning',
      subject: 'CAT • Reasoning',
      startTime: '25 Nov 2025, 9:00 am',
      difficulty: 'hard',
      questions: '30',
      duration: '60 min',
      timeLeft: '',
      isLive: false,
      category: 'upcoming',
      tags: ['CAT'],
      prize: true,
      startedAgo: 'Starts in 3 days',
    },
    // ATTEMPTED Quizzes
    {
      id: '11',
      title: 'JEE Main • Thermodynamics',
      subject: 'JEE Main • Physics',
      startTime: '20 Nov 2025, 3:00 pm',
      difficulty: 'Intermediate',
      questions: '10',
      duration: '30 min',
      timeLeft: '',
      isLive: false,
      category: 'attempted',
      tags: ['JEE Main', 'Physics'],
      prize: false,
      startedAgo: 'Attempted 2 days ago',
      score: '8/10',
    },
    {
      id: '12',
      title: 'SSC CGL • English Grammar',
      subject: 'SSC CGL • English',
      startTime: '19 Nov 2025, 11:00 am',
      difficulty: 'easy',
      questions: '15',
      duration: '20 min',
      timeLeft: '',
      isLive: false,
      category: 'attempted',
      tags: ['SSC CGL', 'English'],
      prize: false,
      startedAgo: 'Attempted 3 days ago',
      score: '12/15',
    },
    {
      id: '13',
      title: 'NEET • Organic Chemistry',
      subject: 'NEET • Chemistry',
      startTime: '18 Nov 2025, 2:00 pm',
      difficulty: 'hard',
      questions: '20',
      duration: '40 min',
      timeLeft: '',
      isLive: false,
      category: 'attempted',
      tags: ['NEET', 'Chemistry'],
      prize: false,
      startedAgo: 'Attempted 4 days ago',
      score: '15/20',
    },
  ];

  // Filter quizzes based on selected category
  const filteredQuizzes = useMemo(() => {
    return quizData.filter(quiz => quiz.category === selectedCategory);
  }, [selectedCategory]);

  // Get counts for each category
  const categoryCounts = useMemo(() => {
    return {
      live: quizData.filter(q => q.category === 'live').length,
      upcoming: quizData.filter(q => q.category === 'upcoming').length,
      attempted: quizData.filter(q => q.category === 'attempted').length,
    };
  }, []);

  const categoryTabs = ['LIVE', 'UPCOMING', 'ATTEMPTED'];

  const handleStartQuiz = (quizId) => {
    console.log('Start Quiz:', quizId);

    const selectedQuiz = quizData.find(q => q.id === quizId);
    if (selectedQuiz) {
   
      if (selectedQuiz.category === 'live' || selectedQuiz.category === 'upcoming') {
        // Navigate to QuizDetails screen with quiz data
        router.push({
          pathname: '/(main)/QuizDetails',
          params: {
            quiz: JSON.stringify(selectedQuiz)
          }
        });
      } else if (selectedQuiz.category === 'attempted') {
      
        console.log('View Results for quiz:', quizId);
        // Navigate to results page when ready
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.badgeText}>🟢  LIVE QUIZ ARENA</Text>
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
              <Text style={styles.categoryCount}>({categoryCounts[category.toLowerCase()]})</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quiz List */}
      <FlatList
        data={filteredQuizzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuizCard quiz={item} onStartQuiz={handleStartQuiz} />
        )}
        contentContainerStyle={styles.quizList}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Filter Button */}
      <FloatingFilter />
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
    // borderWidth:1
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
    // borderWidth:1
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