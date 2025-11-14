import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import styles from '../../../assets/styles/createQuiz.style';
import Header from '../../../components/header';

const CreateQuizScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [quizTopic, setQuizTopic] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState(5);
  const [selectedTimePerQ, setSelectedTimePerQ] = useState(60);
  const [selectedDate, setSelectedDate] = useState('11/13/2025');
  const [selectedTime, setSelectedTime] = useState('11:29 PM');

  const questionOptions = [5, 10, 15, 20, 25];
  const timeOptions = [30, 60, 90, 120];
  const exampleTopics = [
    'Create a 10th grade Algebra quiz on linear equations and inequalities',
    'General science quiz: human body systems and their functions',
    'History quiz about the Indian independence movement [key events and leaders]',
  ];

  const handleSuggestionPress = (topic) => {
    setQuizTopic(topic);
    setShowSuggestions(false);
  };

  const handleTopicChange = (text) => {
    setQuizTopic(text);
  
    if (text.length > 0 && showSuggestions) {
      setShowSuggestions(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header bgr='skyblue' />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Language Section */}
        <View style={{backgroundColor:"#fff",        //"#d8e0dede",
                      borderWidth:0,
                      marginHorizontal:-5,
                      paddingHorizontal:18,
                      paddingVertical:18,
                      marginTop:-10,
                      marginBottom:25,
                      borderRadius:20
                      }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Language</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'English' && styles.languageButtonActive,
              ]}
              onPress={() => setSelectedLanguage('English')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  selectedLanguage === 'English' && styles.languageButtonTextActive,
                ]}
              >
                🇺🇸 English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'Hindi' && styles.languageButtonActive,
              ]}
              onPress={() => setSelectedLanguage('Hindi')}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  selectedLanguage === 'Hindi' && styles.languageButtonTextActive,
                ]}
              >
                🇮🇳 Hindi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quiz Topic Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Quiz Topic</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.topicInput}
              placeholder="Describe your quiz topic in detail..."
              placeholderTextColor="#999"
              value={quizTopic}
              onChangeText={handleTopicChange}
              onFocus={() => setShowSuggestions(true)}
              multiline
            />
            {quizTopic.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setQuizTopic('')}
              >
                <Ionicons name="close-circle-outline" size={20} color={"grey"} />
              </TouchableOpacity>
            )}
          </View>

          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              {exampleTopics.map((topic, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(topic)}
                >
                  <Text style={styles.suggestionText}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Upload Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Upload Documents (up to 3 files)</Text>
          <TouchableOpacity style={styles.fileButton}>
            <Ionicons name="cloud-upload-outline" size={22} color={"#6B7280"}/>
            <Text style={styles.fileButtonText}>Choose Files • No file chosen</Text>
          </TouchableOpacity>
        </View>

        {/* Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Configuration</Text>

          {/* Questions */}
          <Text style={styles.label}>Questions</Text>
          <View style={styles.optionsContainer}>
            {questionOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedQuestions === option && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedQuestions(option)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedQuestions === option && styles.optionButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Time per Question */}
          <Text style={[styles.label, { marginTop: 16 }]}>Time/Q</Text>
          <View style={styles.optionsContainer}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedTimePerQ === option && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedTimePerQ(option)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    selectedTimePerQ === option && styles.optionButtonTextActive,
                  ]}
                >
                  {option}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Schedule</Text>

          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleLabel}>Date</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>{selectedDate}</Text>
              <Text style={styles.dropdownArrow}>⋅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleLabel}>Time</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>{selectedTime}</Text>
              <Text style={styles.dropdownArrow}>⋅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>✨ Create Quiz with AI</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default CreateQuizScreen;