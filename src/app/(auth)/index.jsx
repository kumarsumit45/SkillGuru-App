import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";

import styles from "../../assets/styles/authScreen.styles";

import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import COLORS from "../../constants/colors";
import CountryPicker from "react-native-country-picker-modal";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../../config/firebase";
import config from "../../config";
import useAuthStore from "../../store/authStore";

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("IN");
  const [otp,setOtp] = useState("");
  const [callingCode, setCallingCode] = useState("+91");
  const [visible, setVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [waSending, setWaSending] = useState(false);
  const [waVerifying, setWaVerifying] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [referralId, setReferralId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestUid, setGuestUid] = useState("");

  const router = useRouter();
  const { setUid } = useAuthStore();

  // Configure Google OAuth
  
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com",  // need replacement here
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    try {
      setGoogleLoading(true);

      const response = await fetch("https://api.theskillguru.org/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend Error:", data.error);
        throw new Error(data.error || "Unknown error from backend");
      }

      // Storing authentication data
      await AsyncStorage.setItem("uid", data.uid);
      try {
        await AsyncStorage.setItem("authToken", data.token || "");
      } catch (_) {}

      // Navigate based on response
      if (data.message === "User created successfully") {
        // New user - redirect to mobile number screen
        router.push("addMobileNumber");
      } else {
        // Existing user - redirect to home
        router.push("/"); //will Adjust home route afterwards
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error.message);
      Alert.alert("Error", "Google Sign-In failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handelGooglepress = async () => {
    try {
      // Check if Client ID is configured
      if (!request || request.clientId?.includes("YOUR_GOOGLE")) {
        Alert.alert(
          "Configuration Required",
          "Please add your Google Web Client ID in the code. Check the comments in src/app/(auth)/index.jsx line 40."
        );
        return;
      }

      setGoogleLoading(true);
      const result = await promptAsync();

      // If user cancelled, reset loading state
      if (result?.type === "cancel" || result?.type === "dismiss") {
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Error", `Failed to initiate Google login: ${error.message}`);
    } finally{
      setGoogleLoading(false);
    }
  };

  // Store Referral
  const handleStoreReferral = async () => {
    const uid = await AsyncStorage.getItem("uid");
    if (!uid || !referralId) return;
    console.log(uid, referralId);
    try {
      const response = await fetch(`${config.backendUrl}/referral/referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, referralId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update referrals");
      }

      const result = await response.json();
      setMessage(result.message);
      setError("");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      setMessage("");
    }
  };

  // Save Roles to Database
  const saveRolesToDatabase = async () => {
    try {
      const uid = await AsyncStorage.getItem("uid");
      if (!uid) return;

      // Skip if no roles are selected
      if (!selectedRoles || selectedRoles.length === 0) {
        console.log("No roles selected, skipping save");
        return;
      }

      const response = await fetch(`${config.backendUrl}/save-roles/save-roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          selectedRoles,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("response.message", data.message);
      } else {
        console.error("Error saving roles:", data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // WhatsApp OTP: Send OTP
  const sendWaOtp = async () => {
    try {
      const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
      if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 15) {
        Alert.alert("Error", "Enter a valid phone number");
        return;
      }
      setWaSending(true);
      setError("");
      setMessage("");
      const resp = await fetch(`${config.backendUrl}/auth/whatsapp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          countryCode: callingCode,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || "Failed to send OTP");
      }
      const data = await resp.json().catch(() => ({}));
      setMessage(data.message || "OTP sent. Please check WhatsApp.");
      setOtpSent(true);
    } catch (e) {
      console.error("sendWaOtp error", e);
      setError(e.message || "Failed to send OTP");
      Alert.alert("Error", e.message || "Failed to send OTP");
    } finally {
      setWaSending(false);
    }
  };

  // WhatsApp OTP: Verify OTP
  const verifyWaOtp = async () => {
    console.log("verify otp section");
    
    try {
      const cleanPhone = (phoneNumber || "").replace(/\D/g, "");
      const cleanOtp = (otp || "").replace(/\D/g, "");
      if (!cleanOtp || cleanOtp.length < 4) {
        Alert.alert("Error", "Enter the OTP sent to your WhatsApp");
        return;
      }
      setWaVerifying(true);
      setError("");
      const resp = await fetch(`${config.backendUrl}/auth/whatsapp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: cleanOtp,
          countryCode: callingCode,
        }),
      });
      const data = await resp.json().catch(async () => ({
        message: await resp.text(),
      }));
      if (!resp.ok) {
        throw new Error(data?.error || data?.message || "OTP verification failed");
      }

      if (!data?.token || !data?.uid) {
        throw new Error("Invalid response from server");
      }

      // Sign in to Firebase using the custom token
      await signInWithCustomToken(auth, data.token);

      await AsyncStorage.setItem("uid", data.uid);
      try {
        await AsyncStorage.setItem("authToken", data.token || "");
      } catch (_) {}

      try {
        await handleStoreReferral();
      } catch (_) {}

      setUid(data.uid);

      // New user -> status 201, go to fill-name. Existing -> go back/home.
      if (resp.status === 201) {
        console.log("otp verified")
        console.log("verification sucess and rendering to home page.");
        
        setTimeout(() => router.push("/(main)/(tabs)"), 0);

      } else {
        console.log("verification failed");
        console.log("verification failed but still taking you to homepage");
        setTimeout(() => router.push("/(main)/(tabs)"), 0);
        // setTimeout(() => router.push("/"), 0);
      }
    } catch (e) {
      console.error("verifyWaOtp error", e);
      setError(e.message || "OTP verification failed");
      Alert.alert("Error", e.message || "OTP verification failed");
    } finally {
      setWaVerifying(false);
    }
  };

  // Guest Signup
  const guestSignup = async () => {
    try {
      setGuestLoading(true);
      setError("");
      const resp = await fetch(`${config.backendUrl}/auth/guest/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await resp.json().catch(async () => ({
        message: await resp.text(),
      }));
      if (!resp.ok) {
        throw new Error(data?.error || data?.message || "Guest signup failed");
      }
      if (!data?.token || !data?.uid) {
        throw new Error("Invalid response from guest signup");
      }
      // Sign in to Firebase using the custom token
      await signInWithCustomToken(auth, data.token);
      await AsyncStorage.setItem("uid", data.uid);
      try {
        await AsyncStorage.setItem("authToken", data.token || "");
      } catch (_) {}

      try {
        await handleStoreReferral();
      } catch (_) {}
      try {
        await saveRolesToDatabase();
      } catch (_) {}

      setUid(data.uid);
      setGuestUid(data.uid);
      setTimeout(() => router.push("/(main)/(tabs)"), 0);
    } catch (e) {
      console.error("guestSignup error", e);
      setError(e.message || "Guest signup failed");
      Alert.alert("Error", e.message || "Guest signup failed");
    } finally {
      setGuestLoading(false);
    }
  };

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
          <TouchableOpacity
             activeOpacity={0.7}
             style={[styles.googleButton, googleLoading && { opacity: 0.6 }]}
             onPress={handelGooglepress}
             disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={COLORS.primary || "#000"} size="small" />
            ) : (
              <Image source={require("../../assets/images/googleIcon.png")} style={styles.googleIcon} contentFit="cover"/>
            )}
            <Text style={styles.googleButtonText}>
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Text>
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

            {!otpSent ? (
              <>
                <View style={styles.phoneInputContainer}>

                  {/* Country picker */}
                  <TouchableOpacity
                    style={styles.countryCodeButton}
                    onPress={() => setVisible(true)}
                    activeOpacity={0.7}
                  >
                    <CountryPicker
                      countryCode={countryCode}
                      withFilter
                      withFlag
                      withCallingCode
                      withCallingCodeButton
                      onSelect={(country) => {
                        setCountryCode(country.cca2);
                        setCallingCode(`+${country.callingCode[0]}`);
                      }}
                      visible={visible}
                      onClose={() => setVisible(false)}
                    />
                  </TouchableOpacity>

                  {/* Mobile number input */}
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Phone number"
                    placeholderTextColor="#c9c5c5ff"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.sendOtpButton, waSending && { opacity: 0.6 }]}
                  onPress={sendWaOtp}
                  disabled={waSending}
                >
                  {waSending ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.sendOtpButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.verifyOtpConatiner} >
                  <TextInput
                    style={styles.verifyInput}
                    placeholder="Enter OTP"
                    placeholderTextColor="#c9c5c5ff"
                    keyboardType="phone-pad"
                    value={otp}
                    onChangeText={setOtp}
                  />
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={[styles.sendOtpButton, waVerifying && { opacity: 0.6 }]}
                    onPress={verifyWaOtp}
                    disabled={waVerifying}
                  >
                    {waVerifying ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.sendOtpButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}>
                  <Text style={styles.editText}>Edit phone</Text>
                </TouchableOpacity>
              </>
            )}

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
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.signupGuestButton, guestLoading && { opacity: 0.6 }]}
              onPress={guestSignup}
              disabled={guestLoading}
            >
              {guestLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signupGuestButtonText}>Signup as Guest</Text>
              )}
            </TouchableOpacity>
          </View>
        {/* </View> */}
        </LinearGradient>
      </ScrollView>

      
    </SafeAreaView>
  );
};

export default AuthScreen;
