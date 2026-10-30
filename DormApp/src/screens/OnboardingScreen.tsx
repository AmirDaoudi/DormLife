import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import GeorgetownLogo from '../components/GeorgetownLogo';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
}

const slides: OnboardingSlide[] = [
  {
    title: 'Welcome to DormLife',
    subtitle: 'Georgetown Preparatory School',
    description: 'Manage your boarding experience with temperature control, maintenance requests, and community features designed for Hoyas.',
    emoji: '',
  },
  {
    title: 'Temperature Control',
    subtitle: 'Democratic climate control',
    description: 'Cast your daily vote for the ideal room temperature and see real-time updates across your floor.',
    emoji: '',
  },
  {
    title: 'Maintenance & Support',
    subtitle: 'Quick resolution system',
    description: 'Submit maintenance requests, noise complaints, and suggestions with priority tracking and photo attachments.',
    emoji: '',
  },
  {
    title: 'Community Hub',
    subtitle: 'Stay connected as Hoyas',
    description: 'View school announcements, connect with dormmates, and stay updated with campus events and activities.',
    emoji: '',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('Login' as never);
    }
  };

  const skip = () => {
    navigation.navigate('Login' as never);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={skip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.slideContainer}>
          <View style={styles.logoContainer}>
            <GeorgetownLogo size="large" variant="dark" />
          </View>
          <Text style={styles.title}>{currentSlideData.title}</Text>
          <Text style={styles.subtitle}>{currentSlideData.subtitle}</Text>
          <Text style={styles.description}>{currentSlideData.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentSlide && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  skipText: {
    fontSize: 17,
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 17,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.separator,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
});