import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import CourseCard from "../../components/courseCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/courses.styles";


const CoursesScreen = () => {
  const router = useRouter(); 

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("Class Level");
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [selectedTopic, setSelectedTopic] = useState("Topic");
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 1,
    minutes: 59,
    seconds: 39,
  });

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days -= 1;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (num) => String(num).padStart(2, "0");

  const courses = [
    {
      id: "1",
      title: "Class 11",
      subject: "Chemistry",
      speaking: "Hindi + English",
      material: "English",
      guru: "Shilpi Mam (Vendatu JEE Made Ejee)",
      progress: 20,
      time: "1h 15m",
    },
    {
      id: "2",
      title: "Class 12",
      subject: "Physics",
      speaking: "Hindi + English",
      material: "English",
      guru: "Rajesh Sir (Physics Expert)",
      progress: 45,
      time: "2h 30m",
    },
    {
      id: "3",
      title: "Class 10",
      subject: "Mathematics",
      speaking: "English",
      material: "English",
      guru: "Priya Singh (Math Tutor)",
      progress: 75,
      time: "5h 15m",
    },
  ];

  const renderCourseCard = ({ item }) => (
    <CourseCard
      title={item.title}
      subject={item.subject}
      speaking={item.speaking}
      material={item.material}
      guru={item.guru}
      progress={item.progress}
      time={item.time}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#95A5A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadIcon}>📤</Text>
          <Text style={styles.uploadText}>upload YouTube Video</Text>
        </TouchableOpacity>

        {/* Countdown Banner */}
        <TouchableOpacity 
          style={styles.countdownBanner}
          activeOpacity={0.7}
          onPress={()=> router.navigate("dailyQuiz")}
        >
          <View style={styles.countdownContent}>
            <View style={styles.quizStartsContainer}>
              <Text style={styles.countdownLabel}>🎓 Quiz starts in :</Text>
              <View style={styles.infoCard}>
                <Text style={styles.countdownTimer}>
                  {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
                  {formatTime(timeLeft.seconds)}
                </Text>
              </View>
            </View>

            <Text style={styles.countdownDays}>Join Now </Text>
          </View>
        </TouchableOpacity>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{selectedClass}</Text>
            <Text style={styles.filterDropdown}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{selectedSubject}</Text>
            <Text style={styles.filterDropdown}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>{selectedTopic}</Text>
            <Text style={styles.filterDropdown}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Course Cards */}
        <View style={styles.coursesContainer}>
          <FlatList
            data={courses}
            renderItem={renderCourseCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};


export default CoursesScreen;
