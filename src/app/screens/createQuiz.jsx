import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import styles from '../../assets/styles/createQuiz.style';
import Header from '../../components/header';
import DrawerToggle from "../../components/drawerToggle";

const CreateQuizScreen = () => {
  const getDefaultDateTime = () => {
    const now = new Date();
    const defaultTime = new Date(now.getTime() + 5 * 60000); 
    return { date: now, time: defaultTime };
  };

  const { date: defaultDate, time: defaultTime } = getDefaultDateTime();

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [quizTopic, setQuizTopic] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState(5);
  const [selectedTimePerQ, setSelectedTimePerQ] = useState(60);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState(defaultTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

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

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets) {
        const newDocs = result.assets.slice(0, 3 - selectedDocuments.length);
        setSelectedDocuments([...selectedDocuments, ...newDocs]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleRemoveDocument = (index) => {
    const updatedDocs = selectedDocuments.filter((_, i) => i !== index);
    setSelectedDocuments(updatedDocs);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (time) {
      setSelectedTime(time);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header bgr='#fff' />
      <View style={{
        position:"absolute",
        top:52,
        alignSelf:"flex-end",
        right:18,
        }}>
        <DrawerToggle />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} bounces={false}>
       
        <View style={styles.card}>
         {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Language</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              activeOpacity={0.6}
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
              activeOpacity={0.6}
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
                activeOpacity={0.6}
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
                  activeOpacity={0.6}
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
          <TouchableOpacity
            style={styles.fileButton}
            activeOpacity={0.6}
            onPress={handleDocumentPick}
            disabled={selectedDocuments.length >= 3}
          >
            <Ionicons name="cloud-upload-outline" size={22} color={"#6B7280"}/>
            <Text style={styles.fileButtonText}>
              {selectedDocuments.length === 0
                ? 'Choose Files • No file chosen'
                : `${selectedDocuments.length} file(s) selected`}
            </Text>
          </TouchableOpacity>

          {/* Display Selected Documents */}
          {selectedDocuments.length > 0 && (
            <View style={{ marginTop: 10 }}>
              {selectedDocuments.map((doc, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 10,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                    <Text
                      style={{
                        marginLeft: 8,
                        color: '#374151',
                        fontSize: 14,
                        flex: 1,
                      }}
                      numberOfLines={1}
                    >
                      {doc.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveDocument(index)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
                activeOpacity={0.6}
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
                activeOpacity={0.6}
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
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.6}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dropdownText}>{formatDate(selectedDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleLabel}>Time</Text>
            <TouchableOpacity
              style={styles.dropdown}
              activeOpacity={0.6}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dropdownText}>{formatTime(selectedTime)}</Text>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <DateTimePicker
              value={selectedTime}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.createButton} activeOpacity={0.7}>

          <Text style={styles.createButtonText}>✨ Create Quiz with AI</Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default CreateQuizScreen;