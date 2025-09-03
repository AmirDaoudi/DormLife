import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface ProfilePhotoPickerProps {
  onImageSelected: (imageUri: string) => void;
}

export default function ProfilePhotoPicker({ onImageSelected }: ProfilePhotoPickerProps) {
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'We need camera and photo library access to let you update your profile photo.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const showPicker = () => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
            cancelButtonIndex: 0,
            title: 'Update Profile Photo',
            message: 'How would you like to update your profile photo?',
          },
          async (buttonIndex) => {
            if (buttonIndex === 1) {
              await takePhoto();
            } else if (buttonIndex === 2) {
              await pickFromGallery();
            }
          }
        );
      } else {
        Alert.alert(
          'Update Profile Photo',
          'How would you like to update your profile photo?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Take Photo', onPress: takePhoto },
            { text: 'Choose from Gallery', onPress: pickFromGallery },
          ]
        );
      }
    };

    showPicker();
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={showImagePicker}>
      <View style={styles.iconContainer}>
        <Ionicons name="camera" size={20} color={Colors.textOnPrimary} />
      </View>
      <Text style={styles.text}>Change Photo</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    letterSpacing: 0.3,
  },
});