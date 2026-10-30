import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { AppDispatch } from '../store/store';
import { updateUserProfile, completeOnboarding } from '../store/authSlice';

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const [profileData, setProfileData] = useState({
    roomNumber: '',
    year: '',
    emergencyContact: '',
    profilePhoto: null as string | null,
  });

  const [preferences, setPreferences] = useState({
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    temperaturePreference: 72,
    notificationsEnabled: true,
    biometricEnabled: true,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileData({
        ...profileData,
        profilePhoto: result.assets[0].uri,
      });
    }
  };

  const handleCompleteSetup = async () => {
    if (!profileData.roomNumber || !profileData.year || !profileData.emergencyContact) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const updatedProfile = {
        ...profileData,
        preferences,
      };

      await dispatch(updateUserProfile(updatedProfile)).unwrap();
      dispatch(completeOnboarding());
      
      Alert.alert(
        'Welcome to DormLife!',
        'Your profile has been set up successfully',
        [{ text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] }) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us personalize your dorm experience</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {profileData.profilePhoto ? (
                <Image source={{ uri: profileData.profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.placeholderPhoto}>
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Profile Photo (Optional)</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Room Number *</Text>
            <TextInput
              style={styles.input}
              value={profileData.roomNumber}
              onChangeText={(text) =>
                setProfileData({ ...profileData, roomNumber: text })
              }
              placeholder="e.g., 204A"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Year/Grade *</Text>
            <TextInput
              style={styles.input}
              value={profileData.year}
              onChangeText={(text) =>
                setProfileData({ ...profileData, year: text })
              }
              placeholder="e.g., Senior, Grade 12"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Emergency Contact *</Text>
            <TextInput
              style={styles.input}
              value={profileData.emergencyContact}
              onChangeText={(text) =>
                setProfileData({ ...profileData, emergencyContact: text })
              }
              placeholder="Parent/Guardian phone number"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.preferencesSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Preferred Temperature (°F)</Text>
              <TextInput
                style={styles.input}
                value={preferences.temperaturePreference.toString()}
                onChangeText={(text) =>
                  setPreferences({
                    ...preferences,
                    temperaturePreference: parseInt(text) || 72,
                  })
                }
                placeholder="72"
                placeholderTextColor="#8E8E93"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quiet Hours Start</Text>
              <TextInput
                style={styles.input}
                value={preferences.quietHoursStart}
                onChangeText={(text) =>
                  setPreferences({ ...preferences, quietHoursStart: text })
                }
                placeholder="22:00"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Quiet Hours End</Text>
              <TextInput
                style={styles.input}
                value={preferences.quietHoursEnd}
                onChangeText={(text) =>
                  setPreferences({ ...preferences, quietHoursEnd: text })
                }
                placeholder="08:00"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleCompleteSetup}
          >
            <Text style={styles.completeButtonText}>Complete Setup</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
  },
  form: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    marginBottom: 10,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  photoLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#1C1C1E',
  },
  preferencesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});