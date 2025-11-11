
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from '../../assets/styles/studentLogin.styles';
import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons as Icon } from '@expo/vector-icons';



const StudentLoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
    Alert.alert('Success', `Logging in as ${username}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Card Container */}
          <View style={styles.card}>
            {/* Header */}
            <Text style={styles.title}>Student Login</Text>
            <Text style={styles.subtitle}>
              Enter your credentials to access your account
            </Text>

            {/* Username Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#B0A9C7"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            {/* Password Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#B0A9C7"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#6C5CE7"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WhatsApp Button (Bottom Right) */}
        {/* <TouchableOpacity style={styles.whatsappButton}>
          <Icon name="logo-whatsapp" size={24} color="white" />
        </TouchableOpacity> */}
      </LinearGradient>
    </SafeAreaView>
  );
}

export default StudentLoginScreen; 

