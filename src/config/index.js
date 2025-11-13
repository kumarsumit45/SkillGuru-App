import Constants from 'expo-constants';

const config = {
  backendUrl: Constants.expoConfig?.extra?.backendUrl || process.env.Base_url || 'https://api.theskillguru.org',
};

export default config;
