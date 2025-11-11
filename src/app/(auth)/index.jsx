import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "../../assets/styles/authScreen.styles";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import COLORS from "../../constants/colors";

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerText}>Skill Guru</Text>
        </View>

        {/* Main Card */}

        {/* <View style={styles.card}> */}
        <LinearGradient
        colors={[COLORS.gradient1, COLORS.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
          
          {/* Welcome Title */}
          <Text style={styles.welcomeTitle}>Welcome to SkillGuru</Text>
          <Text style={styles.subtitle}>
            Your gateway to expert guidance, learning, and growth.
          </Text>

          {/* Google Login Button */}
          <TouchableOpacity activeOpacity={0.7} style={styles.googleButton}>
            <Image source={require("../../assets/images/googleIcon.png")} style={styles.googleIcon} contentFit="cover"/>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.fastLoginText}>
            Fast login. No passwords required.
          </Text>

          {/* Student Login Button */}
          <TouchableOpacity 
             activeOpacity={0.7} 
             style={styles.studentButton}
             onPress={()=> router.push("studentLoginScreen")}
             >
            <Text style={styles.studentButtonText}>Student Login</Text>
          </TouchableOpacity>

          {/* Or Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* WhatsApp OTP Section */}

          <View style={styles.otpConatiner}>

            <Text style={styles.otpTitle}>Sign up with WhatsApp OTP</Text>

            <View style={styles.phoneInputContainer}>
              <TextInput 
                style={styles.countryCodeButton}
                placeholder="Country Code"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={countryCode}
                onChangeText={setCountryCode}
              />
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity activeOpacity={0.7} style={styles.sendOtpButton}>
              <Text style={styles.sendOtpButtonText}>Send OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Or Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue as Guest */}

          <View style={styles.guestContainer}>
            <View style={styles.guestButton}>
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </View>

            {/* Signup as Guest Button */}
            <TouchableOpacity activeOpacity={0.7} style={styles.signupGuestButton}>
              <Text style={styles.signupGuestButtonText}>Signup as Guest</Text>
            </TouchableOpacity>
          </View>
        {/* </View> */}
        </LinearGradient>
      </ScrollView>

      {/* WhatsApp Button */}
      {/* <TouchableOpacity style={styles.whatsappButton}>
        <Text style={styles.whatsappIcon}>💬</Text>
      </TouchableOpacity> */}
      {/* // </LinearGradient> */}
    </SafeAreaView>
  );
};

export default AuthScreen;
