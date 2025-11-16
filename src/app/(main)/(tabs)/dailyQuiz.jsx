import { useState } from "react";
import { FlatList } from "react-native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SetupCompleteCard from "../../../components/setupCompleteCard";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../../assets/styles/dailyQuiz.styles";

const DailyQuizScreen = () => {
  // STATE MANAGEMENT - All quiz setup state

  const [setupProgress, setSetupProgress] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedMathematics, setSelectedMathematics] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // DATA DEFINITIONS - Class options (5-12)

  const classes = [
    { id: 1, name: "Class 5" },
    { id: 2, name: "Class 6" },
    { id: 3, name: "Class 7" },
    { id: 4, name: "Class 8" },
    { id: 5, name: "Class 9" },
    { id: 6, name: "Class 10" },
    { id: 7, name: "Class 11" },
    { id: 8, name: "Class 12" },
  ];

  // DATA DEFINITIONS - Stream options (Science, Commerce, Humanities)

  const streams = [
    {
      id: 1,
      name: "Science",
      icon: "🔬",
      description: "Physics, Chemistry, Biology/Mathematics",
    },
    {
      id: 2,
      name: "Commerce",
      icon: "💼",
      description: "Business Studies, Economics, Accountancy",
    },
    {
      id: 3,
      name: "Humanities",
      icon: "📚",
      description: "History, Geography, Political Science",
    },
  ];

  // DATA DEFINITIONS - Mathematics options for Commerce stream

  const mathematicsOptions = [
    {
      id: 1,
      name: "With Maths",
      icon: "📐",
      description: "Commerce stream including Mathematics",
    },
    {
      id: 2,
      name: "Without Maths",
      icon: "📊",
      description: "Commerce stream without Mathematics",
    },
  ];

  // DATA DEFINITIONS - Science track options (Medical/Engineering)

  const scienceTracks = [
    {
      id: 1,
      name: "Medical Track",
      icon: "🩺",
      description: "Physics, Chemistry, Biology",
    },
    {
      id: 2,
      name: "Engineering Track",
      icon: "🛠️",
      description: "Physics, Chemistry, Maths",
    },
  ];

  // DATA DEFINITIONS - Humanities subjects (Core + Optional)

  const humanitiesSubjects = [
    { id: 1, name: "History", icon: "📖", type: "core" },
    { id: 2, name: "Political Science", icon: "🏛️", type: "core" },
    { id: 3, name: "Geography", icon: "🌍", type: "core" },
    { id: 4, name: "English", icon: "📚", type: "core" },
    { id: 5, name: "Economics", icon: "💰", type: "optional" },
    { id: 6, name: "Psychology", icon: "🧠", type: "optional" },
  ];

  // HANDLER FUNCTIONS - Subject selection toggle

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prevSubjects) =>
      prevSubjects.includes(subjectId)
        ? prevSubjects.filter((id) => id !== subjectId)
        : [...prevSubjects, subjectId]
    );
  };

  // COMPUTED VALUES - Count selected subjects by type

  const coreSubjectsCount = humanitiesSubjects.filter(
    (s) => s.type === "core" && selectedSubjects.includes(s.id)
  ).length;
  const optionalSubjectsCount = humanitiesSubjects.filter(
    (s) => s.type === "optional" && selectedSubjects.includes(s.id)
  ).length;

  return (
    <SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* QUIZ HEADER SECTION - Title, Info Cards, Actions & Trophy */}

        <View style={styles.quizHeaderContainer}>
          <Text style={styles.quizMainTitle}>CBSE Quiz Challenge</Text>

          <View style={styles.infoCardsContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>25 Minutes</Text>
              <Text style={styles.infoLabel}>Challenge Duration</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>8 PM - 8:25 PM</Text>
              <Text style={styles.infoLabel}>Daily Schedule</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoValue}>₹100</Text>
              <Text style={styles.infoLabel}>Winner Prize</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Start Quiz Setup</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>📋 Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>🔗 Share Link</Text>
          </TouchableOpacity>

          <Text style={styles.shareHelperText}>
            Share this link with your friends to invite them to the quiz!
          </Text>

          <View style={styles.trophyContainer}>
            <Text style={styles.trophyEmoji}>🏆</Text>
          </View>
        </View>

        {/* PROGRESS SECTION - Setup progress bar with percentage*/}

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Setup Progress</Text>
            <Text style={styles.progressPercent}>{setupProgress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${setupProgress}%` }]}
            />
          </View>
        </View>

        {/* CONFIGURATION SECTION - Main setup flow starts here */}

        <View style={styles.configureSection}>
          <Text style={styles.configureTitle}>Configure Your Quiz</Text>

          {/*CLASS SELECTION CARD - Choose academic level (5-12)*/}

          <View style={styles.configCard}>
            <View style={styles.streamHeader}>
              <View style={styles.streamNumberBadge}>
                <Ionicons name="person" color={"#fff"} size={22} />
              </View>
              <View>
                <Text style={styles.streamTitle}>Select Your Class</Text>
                <Text style={styles.streamHint}>
                  Select your current academic level
                </Text>
              </View>
            </View>

            <FlatList
              data={classes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.classButton,
                    selectedClass === item.name && styles.classButtonActive,
                  ]}
                  onPress={() => {
                    setSelectedClass(item.name);
                    {
                      selectedClass === "Class 11" ||
                      selectedClass === "Class 12"
                        ? setSetupProgress(33)
                        : setSetupProgress(100);
                    }
                    setSelectedStream("");
                    setSelectedMathematics("");
                    setSelectedTrack("");
                    setSelectedSubjects([]);
                  }}
                >
                  <Text
                    style={[
                      styles.classButtonText,
                      selectedClass === item.name &&
                        styles.classButtonTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.classListContainer}
            />

            {selectedClass && (
              <View style={styles.msgContainer}>
                <View style={styles.content}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.message}>
                    "{selectedClass} selected successfully!"
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/*
              STREAM SELECTION CARD - Only shows for Class 11 & 12
              Shows Science, Commerce, Humanities options
          */}
          {(selectedClass === "Class 11" || selectedClass === "Class 12") && (
            <View style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <View style={styles.streamNumberBadge}>
                  <Text style={styles.streamNumber}>2</Text>
                </View>
                <View>
                  <Text style={styles.streamTitle}>Choose Your Stream</Text>
                  <Text style={styles.streamHint}>
                    Select your field of study
                  </Text>
                </View>
              </View>

              <View style={styles.streamsContainer}>
                {streams.map((stream) => (
                  <TouchableOpacity
                    key={stream.id}
                    style={[
                      styles.streamButton,
                      selectedStream === stream.name &&
                        styles.streamButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedStream(stream.name);
                      setSetupProgress(66);
                      setSelectedMathematics("");
                      setSelectedTrack("");
                      setSelectedSubjects([]);
                    }}
                  >
                    <Text style={styles.streamIcon}>{stream.icon}</Text>
                    <Text
                      style={[
                        styles.streamButtonTitle,
                        selectedStream === stream.name && { color: "#fff" },
                      ]}
                    >
                      {stream.name}
                    </Text>
                    <Text style={styles.streamButtonDescription}>
                      {stream.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedStream && (
                <View style={styles.msgContainer}>
                  <View style={styles.content}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.message}>
                      "{selectedStream} stream selected!"
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/*
              MATHEMATICS OPTION CARD - Only shows when Commerce is selected
              Choose between With/Without Mathematics
        */}
          {selectedStream === "Commerce" && (
            <View style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <View style={styles.streamNumberBadge}>
                  <Text style={styles.streamNumber}>3</Text>
                </View>
                <View>
                  <Text style={styles.streamTitle}>Mathematics Option</Text>
                  <Text style={styles.streamHint}>
                    Do you study Mathematics?
                  </Text>
                </View>
              </View>

              <View style={styles.streamsContainer}>
                {mathematicsOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.streamButton,
                      selectedMathematics === option.name &&
                        styles.streamButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedMathematics(option.name);
                      setSetupProgress(100);
                    }}
                  >
                    <Text style={styles.streamIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.streamButtonTitle,
                        selectedMathematics === option.name && {
                          color: "#ffff",
                        },
                      ]}
                    >
                      {option.name}
                    </Text>
                    <Text style={styles.streamButtonDescription}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedMathematics && (
                <View style={styles.msgContainer}>
                  <View style={styles.content}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.message}>
                      "{selectedMathematics} selected!"
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* 
              SETUP COMPLETE - Commerce path completion
              Shows when Mathematics option is selected
         */}

          {selectedMathematics && selectedStream === "Commerce" && (
            <SetupCompleteCard />
          )}

          {/*
              SCIENCE TRACK CARD - Only shows when Science is selected
              Choose between Medical/Engineering tracks
          */}
          {selectedStream === "Science" && (
            <View style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <View style={styles.streamNumberBadge}>
                  <Text style={styles.streamNumber}>3</Text>
                </View>
                <View>
                  <Text style={styles.streamTitle}>Select Science Track</Text>
                  <Text style={styles.streamHint}>
                    Choose your subject combination
                  </Text>
                </View>
              </View>

              <View style={styles.streamsContainer}>
                {scienceTracks.map((track) => (
                  <TouchableOpacity
                    key={track.id}
                    style={[
                      styles.streamButton,
                      selectedTrack === track.name && styles.streamButtonActive,
                    ]}
                    onPress={() => {
                      setSelectedTrack(track.name);
                      setSetupProgress(100);
                    }}
                  >
                    <Text style={styles.streamIcon}>{track.icon}</Text>
                    <Text
                      style={[
                        styles.streamButtonTitle,
                        selectedTrack === track.name && { color: "#fff" },
                      ]}
                    >
                      {track.name}
                    </Text>
                    <Text style={styles.streamButtonDescription}>
                      {track.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedTrack && (
                <View style={styles.msgContainer}>
                  <View style={styles.content}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.message}>
                      "{selectedTrack} selected!"
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/*
              SETUP COMPLETE - Science path completion
              Shows when Science track is selected
          */}

          {selectedTrack && selectedStream === "Science" && (
            <SetupCompleteCard />
          )}

          {/* 
              SUBJECTS SELECTION CARD - Only shows when Humanities is selected
              Choose at least 4 core subjects + optional subjects
          */}
          {selectedStream === "Humanities" && (
            <View style={styles.streamCard}>
              <View style={styles.streamHeader}>
                <View style={styles.streamNumberBadge}>
                  <Text style={styles.streamNumber}>3</Text>
                </View>
                <View>
                  <Text style={styles.streamTitle}>Select Subjects</Text>
                  <Text style={styles.streamHint}>
                    Choose at least 5 subjects from your curriculum
                  </Text>
                </View>
              </View>

              <View style={styles.subjectsGrid}>
                {humanitiesSubjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectButton,
                      selectedSubjects.includes(subject.id) &&
                        styles.subjectButtonActive,
                    ]}
                    onPress={() => toggleSubject(subject.id)}
                  >
                    <Text style={styles.subjectIcon}>{subject.icon}</Text>
                    <Text
                      style={[
                        styles.subjectName,
                        selectedSubjects.includes(subject.id) && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {subject.name}
                    </Text>
                    {subject.type === "optional" && (
                      <Text style={styles.optionalLabel}>Optional</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {selectedSubjects.length > 0 && (
                <View style={styles.msgContainer}>
                  <View style={styles.content}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.message}>
                      Core subjects selected: {coreSubjectsCount}/4
                    </Text>
                  </View>
                  <View style={styles.content}>
                    <Text style={styles.checkmark}>✓</Text>
                    <Text style={styles.message}>
                      Optional selected: {optionalSubjectsCount}/2
                    </Text>
                  </View>
                </View>
              )}

              {/* 
                  SETUP COMPLETE - Humanities path completion
                  Shows when 4 core subjects are selected
               */}
            </View>
          )}

          {coreSubjectsCount === 4 && (
            <>
              {setSetupProgress(100)}
              <SetupCompleteCard />
            </>
          )}

          {/* SETUP COMPLETE - Classes 5-10 path
              Shows immediately after class selection for non-11/12 classes */}

          {selectedClass &&
            selectedClass !== "Class 11" &&
            selectedClass !== "Class 12" && <SetupCompleteCard />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyQuizScreen;
