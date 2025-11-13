// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
// };

// // Validate Firebase config
// if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY_HERE') {
//   console.error('❌ Firebase API Key is missing!');
//   console.error('📝 To fix this:');
//   console.error('1. Go to: https://console.firebase.google.com/project/the-skill-guru---durgesh/settings/general');
//   console.error('2. Scroll to "Your apps" section');
//   console.error('3. Click on Web app (</> icon) or add one if it doesn\'t exist');
//   console.error('4. Copy the config values and update your .env file');
//   console.error('5. Restart your Expo server (npm start)');
// }

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Firebase Auth
// export const auth = getAuth(app);

// export default app;

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
