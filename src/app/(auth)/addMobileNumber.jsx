import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CountryPicker from "react-native-country-picker-modal";
import styles from '../../assets/styles/addMobileNumber.styles';
import { Image } from 'expo-image';



const AddMobileNumber = () => {
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [countryName, setCountryName] = useState('India');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setCountryName(country.name);
    setCallingCode(country.callingCode[0]);
  };

  const handleSubmit = () => {
    if (phoneNumber.trim() === '') {
      alert('Please enter a phone number');
      return;
    }
    console.log(`Phone: +${callingCode}${phoneNumber}`);
    alert(`Submitted: +${callingCode}${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../../assets/images/logo.png")} style={styles.logo} contentFit="cover" />
        <Text style={styles.headerTitle}>Skill Guru</Text>
      </View>

      {/* Main Content */}

      <View style={styles.mainContainer}>
      <View style={styles.content}>
        <Text style={styles.mainTitle}>Add mobile Number</Text>

        
          {/* Country/Region Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Country/Region</Text>
            <TouchableOpacity
              style={styles.countryPicker}
              activeOpacity={0.7}
              onPress={() => setShowCountryPicker(true)}
            >
              <CountryPicker
          countryCode={countryCode}
          withFilter
          withFlag
          withCallingCode
          onSelect={onSelectCountry}
          visible={showCountryPicker}
          onClose={() => setShowCountryPicker(false)}
          theme={{
            backgroundColor: '#FFFFFF',
            onBackgroundTextColor: '#000000',
          }}
        />
              <Text style={styles.countryPickerText}>
                {countryName} (+{callingCode})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Phone Number Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>+{callingCode}</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter your number"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholderTextColor="#d7d4d4ff"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>

     
      
    </SafeAreaView>
  );
};



export default AddMobileNumber;