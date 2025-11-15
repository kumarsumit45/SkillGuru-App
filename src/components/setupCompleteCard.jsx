import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function SetupCompleteCard() {
  return (
      <View style={styles.card}>
        {/* Target Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎯</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Setup Complete!</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Your personalized quiz is ready. Join the challenge and test your knowledge!
        </Text>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Quiz available between 7:55pm and 8:24pm IST (07:18:17)
          </Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#d97a52',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 10,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom:10,
  },
  infoText: {
    fontSize: 14,
    color: '#5a4a42',
    textAlign: 'center',
    fontWeight: '500',
  },
});