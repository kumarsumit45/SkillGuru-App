<p align="center">
  <img src="src/assets/images/logo.png" alt="SkillsGuru Logo" width="200" height="200"/>
</p>

<h1 align="center">SkillsGuru</h1>

<p align="center">
  <strong>A Mobile Quiz Application for Learning and Competition</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81.5-blue?logo=react" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-54.0.33-black?logo=expo" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Firebase-12.5.0-orange?logo=firebase" alt="Firebase"/>
</p>

---

## About

SkillsGuru is a cross-platform mobile application built with React Native and Expo. It provides an interactive platform for users to participate in live quizzes, track their progress, explore courses, and compete with others.

---

## Tech Stack

### Core Framework
| Technology | Version | Description |
|------------|---------|-------------|
| React Native | 0.81.5 | Mobile app framework |
| Expo | ~54.0.33 | Cross-platform development toolkit |
| React | 19.1.0 | UI library |
| TypeScript | ~5.9.2 | Type-safe JavaScript |
| Expo Router | ~6.0.23 | File-based routing system |

### Navigation & UI
| Package | Version | Purpose |
|---------|---------|---------|
| @react-navigation/native | ^7.1.8 | Navigation library |
| @react-navigation/bottom-tabs | ^7.4.0 | Bottom tab navigation |
| @react-navigation/drawer | ^7.5.0 | Drawer navigation |
| @expo/vector-icons | ^15.0.3 | Icon library |
| react-native-vector-icons | ^10.3.0 | Additional icons |
| expo-linear-gradient | ~15.0.8 | Gradient backgrounds |
| react-native-reanimated | ~4.1.1 | Smooth animations |

### State Management
| Package | Version | Purpose |
|---------|---------|---------|
| Zustand | ^5.0.8 | Lightweight state management |

### Authentication & Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Firebase | ^12.5.0 | Backend services & authentication |
| @react-native-google-signin/google-signin | ^16.1.1 | Google Sign-In |
| expo-auth-session | ~7.0.10 | Auth session management |

### Storage & Utilities
| Package | Version | Purpose |
|---------|---------|---------|
| @react-native-async-storage/async-storage | 2.2.0 | Local data storage |
| @react-native-clipboard/clipboard | ^1.16.3 | Clipboard operations |
| @react-native-community/datetimepicker | 8.4.4 | Date/time picker |
| expo-document-picker | ~14.0.8 | Document selection |
| expo-image-picker | ^17.0.10 | Image selection |
| react-native-gesture-handler | ~2.28.0 | Touch gestures |
| react-native-country-picker-modal | ^2.0.0 | Country selection |

### Development Tools
| Package | Version | Purpose |
|---------|---------|---------|
| ESLint | ^9.25.0 | Code linting |
| Babel | - | JavaScript compiler |
| EAS CLI | - | Build & deployment |

---

## Folder Structure

```
SkillGuru/
│
├── src/
│   │
│   ├── api/                                # API layer for backend communication
│   │   ├── editProfileApi.js               # Profile editing operations
│   │   ├── guestUserApi.js                 # Guest authentication
│   │   ├── liveQuizApi.js                  # Live quiz data & operations
│   │   └── profileUserApi.js               # User profile fetching/updating
│   │
│   ├── app/                                # Expo Router (file-based routing)
│   │   ├── _layout.jsx                     # Root layout
│   │   │
│   │   ├── (auth)/                         # Authentication flow
│   │   │   ├── _layout.jsx                 # Auth layout
│   │   │   ├── index.jsx                   # Main authentication screen
│   │   │   ├── addMobileNumber.jsx         # Mobile number entry
│   │   │   └── studentLoginScreen.jsx      # Student login screen
│   │   │
│   │   ├── (main)/                         # Main app after authentication
│   │   │   ├── _layout.jsx                 # Main app layout
│   │   │   └── (tabs)/                     # Bottom tab navigation
│   │   │       ├── _layout.jsx             # Tab bar configuration
│   │   │       ├── index.jsx               # Home tab (Live Quiz)
│   │   │       └── profile.jsx             # User profile tab
│   │   │
│   │   └── screens/                        # App screens
│   │       ├── AttemptedResultsPage.jsx    # Results from attempted quizzes
│   │       ├── QuizDetails.jsx             # Quiz details view
│   │       ├── QuizLivePage.jsx            # Live quiz interface
│   │       ├── QuizResultsPage.jsx         # Quiz results display
│   │       ├── EditProfile.jsx             # Profile editing screen
│   │       ├── courses.jsx                 # Courses listing page    [FUTURE]
│   │       └── createQuiz.jsx              # Quiz creation interface [FUTURE]
│   │
│   ├── assets/
│   │   ├── images/                         # Image assets
│   │   │   ├── icon.png                    # App icon
│   │   │   ├── logo.png                    # App logo
│   │   │   ├── splash-icon.png             # Splash screen icon
│   │   │   ├── favicon.png                 # Web favicon
│   │   │   └── googleIcon.png              # Google sign-in icon
│   │   │
│   │   ├── icons/                          # Navigation & UI icons
│   │   │   ├── create-quiz.png             # Create quiz tab icon
│   │   │   ├── daily-quiz.png              # Daily quiz tab icon
│   │   │   ├── earning.png                 # Earnings tab icon
│   │   │   ├── earning1.png                # Earnings alt icon
│   │   │   ├── histroy.png                 # History tab icon
│   │   │   └── top-creator.png             # Top creator tab icon
│   │   │
│   │   └── styles/                         # Stylesheet files
│   │       ├── addMobileNumber.styles.jsx
│   │       ├── authScreen.styles.jsx
│   │       ├── courses.styles.jsx
│   │       ├── createQuiz.style.jsx
│   │       ├── LiveQuiz.styles.jsx
│   │       ├── profile.styles.jsx
│   │       └── studentLogin.styles.jsx
│   │
│   ├── components/                         # Reusable components
│   │   ├── courseCard.jsx                  # Course card component
│   │   ├── drawerToggle.jsx                # Menu drawer toggle [FUTURE]
│   │   ├── floatingFilters.jsx             # Filter UI component
│   │   ├── header.jsx                      # App header component [FUTURE]
│   │   ├── quizCard.jsx                    # Quiz card component
│   │   ├── setupCompleteCard.jsx           # Setup completion card
│   │   └── winnerCard.jsx                  # Winner display card
│   │
│   ├── config/                             # App configuration
│   │   ├── index.js                        # Backend URL configuration
│   │   └── firebase.js                     # Firebase initialization
│   │
│   ├── constants/                          # App constants
│   │   ├── colors.js                       # Color palette definitions
│   │   └── Icons.js                        # Icon references
│   │
│   └── store/                              # State management
│       └── authStore.js                    # Zustand auth state store
│
├── android/                                # Android native code (gitignored)
├── ios/                                    # iOS native code (gitignored)
├── .expo/                                  # Expo configuration
│
├── Configuration Files:
│   ├── package.json                        # Dependencies & scripts
│   ├── app.json                            # Expo app configuration
│   ├── tsconfig.json                       # TypeScript configuration
│   ├── babel.config.js                     # Babel preset config
│   ├── eslint.config.js                    # ESLint configuration
│   ├── eas.json                            # EAS build configuration
│   ├── .env                                # Environment variables (gitignored)
│   ├── .gitignore                          # Git ignore rules
│   ├── google-services.json                # Firebase Android config
│   └── GoogleService-Info.plist            # Firebase iOS config
```

---

## Files Status

### Currently Unused / Future Implementation

| File | Status | Notes |
|------|--------|-------|
| `src/app/screens/createQuiz.jsx` | **FUTURE** | Quiz creation feature - currently disabled in tab navigation |
| `src/components/header.jsx` | **FUTURE** | Generic header component - prepared for wider use |
| `src/components/drawerToggle.jsx` | **FUTURE** | Drawer menu toggle - prepared but not fully integrated |
| `src/assets/icons/create-quiz.png` | **FUTURE** | Icon for create quiz tab (when enabled) |
| `src/assets/icons/earning.png` | **FUTURE** | Earnings feature icon |
| `src/assets/icons/earning1.png` | **FUTURE** | Alternate earnings icon |
| `src/assets/icons/histroy.png` | **FUTURE** | History feature icon |
| `src/assets/icons/top-creator.png` | **FUTURE** | Top creators feature icon |

### Disabled Features (In Code)
- **Create Quiz Tab** - Commented out in `src/app/(main)/(tabs)/_layout.jsx` (lines 30-41)
- **Local Backend URL** - Development URL commented in `src/api/liveQuizApi.js`

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkillGuru
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the required variables.

4. **Start the development server**
   ```bash
   npx expo start
   ```

### Running the App

- **Expo Go**: Scan the QR code with Expo Go app
- **Android Emulator**: Press `a` in the terminal
- **iOS Simulator**: Press `i` in the terminal (macOS only)
- **Development Build**:
  ```bash
  npx expo run:android
  # or
  npx expo run:ios
  ```

### Building for Production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

---

## Features

- **User Authentication** - Google Sign-In, Phone Number, WhatsApp, Guest Login
- **Live Quizzes** - Real-time quiz participation
- **Quiz Results** - Detailed performance analytics
- **User Profiles** - Customizable user profiles
- **Courses** - Browse and explore courses
- **Cross-Platform** - Works on Android, iOS, and Web

---

## API Integration

The app connects to the SkillsGuru backend API:
- **Production**: `https://api.theskillguru.org`

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is proprietary software.

---

<p align="center">
  Made with React Native & Expo
</p>
