import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, GoogleAuthProvider, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD9Sqx9_xDwtosKHlXPD3UilY4fOu-c-yI",
  authDomain: "the-skill-guru---durgesh.firebaseapp.com",
  projectId: "the-skill-guru---durgesh",
  storageBucket: "the-skill-guru---durgesh.appspot.com",
  messagingSenderId: "910363851200",
  appId: "1:910363851200:web:9d21217318ec9316bcf025",
  measurementId: "G-6VFQH0M61L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const provider = new GoogleAuthProvider();

export { app, auth, provider };
