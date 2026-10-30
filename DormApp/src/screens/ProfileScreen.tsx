import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../store/store';
import { logout, updateUserProfile } from '../store/authSlice';
import { Colors } from '../constants/Colors';
import ProfilePhotoPicker from '../components/ProfilePhotoPicker';
import AdminPasswordModal from '../components/AdminPasswordModal';

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(user?.profilePhotoUrl);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleProfilePhotoUpdate = async (imageUri: string) => {
    try {
      setProfilePhoto(imageUri);
      // In a real app, you'd upload this to your server first
      await dispatch(updateUserProfile({ 
        profilePhotoUrl: imageUri 
      }));
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo. Please try again.');
      setProfilePhoto(user?.profilePhotoUrl);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const handleBiometricAuth = () => {
    Alert.alert(
      'Biometric Authentication',
      'This feature requires device biometric setup. Would you like to enable Face ID/Touch ID for DormLife?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enable', 
          onPress: () => {
            Alert.alert('Success', 'Biometric authentication has been enabled for DormLife.');
          }
        }
      ]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy Settings',
      'Your privacy is important to us. DormLife only collects necessary dormitory management data and never shares personal information with third parties.',
      [{ text: 'OK' }]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Need assistance? Contact your House Advisor or email dormlife-support@georgetownprep.org for technical support.',
      [{ text: 'OK' }]
    );
  };

  const settingsOptions = [
    {
      id: 1,
      title: 'Edit Profile',
      subtitle: 'Update your information',
      icon: 'person' as keyof typeof Ionicons.glyphMap,
      action: () => navigation.navigate('EditProfile' as never),
    },
    {
      id: 2,
      title: 'Room Settings',
      subtitle: 'Manage room preferences',
      icon: 'home' as keyof typeof Ionicons.glyphMap,
      action: () => navigation.navigate('RoomSettings' as never),
    },
    {
      id: 3,
      title: 'Notifications',
      subtitle: 'Push notification settings',
      icon: 'notifications' as keyof typeof Ionicons.glyphMap,
      action: () => navigation.navigate('NotificationSettings' as never),
    },
    {
      id: 4,
      title: 'Biometric Authentication',
      subtitle: 'Face ID & Touch ID',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      action: handleBiometricAuth,
    },
    {
      id: 5,
      title: 'Privacy',
      subtitle: 'Data and privacy settings',
      icon: 'lock-closed' as keyof typeof Ionicons.glyphMap,
      action: handlePrivacySettings,
    },
    {
      id: 6,
      title: 'Help & Support',
      subtitle: 'Get help with DormLife',
      icon: 'help-circle' as keyof typeof Ionicons.glyphMap,
      action: handleHelpSupport,
    },
  ];

  const handleAdminAccess = () => {
    navigation.navigate('AdminLogin' as never);
  };

  const handleAdminAccessSuccess = () => {
    navigation.navigate('AdminDashboard' as never);
  };

  const adminOptions = [
    {
      id: 7,
      title: 'Admin Dashboard',
      subtitle: 'Staff view for request management',
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      action: handleAdminAccess,
      isAdmin: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageText}>
                      {user?.fullName?.charAt(0) || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.profileImageOverlay}>
                  <ProfilePhotoPicker onImageSelected={handleProfilePhotoUpdate} />
                </View>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@school.edu'}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.roomBadge}>
                  <Ionicons name="home" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.roomText}>Room {user?.roomNumber || 'N/A'}</Text>
                </View>
                <View style={styles.yearBadge}>
                  <Ionicons name="school" size={16} color={Colors.textOnPrimary} />
                  <Text style={styles.yearText}>{user?.year || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>89%</Text>
            <Text style={styles.statLabel}>Satisfaction</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Days Active</Text>
          </View>
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Settings</Text>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.settingsOption}
              onPress={option.action}
            >
              <View style={styles.settingsOptionLeft}>
                <Ionicons 
                  name={option.icon} 
                  size={24} 
                  color={Colors.primary} 
                  style={styles.settingsOptionIcon} 
                />
                <View style={styles.settingsOptionText}>
                  <Text style={styles.settingsOptionTitle}>{option.title}</Text>
                  <Text style={styles.settingsOptionSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.separator} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.adminSectionTitle}>🏫 Staff Access (Demo)</Text>
          {adminOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.settingsOption, styles.adminOption]}
              onPress={option.action}
            >
              <View style={styles.settingsOptionLeft}>
                <Ionicons 
                  name={option.icon} 
                  size={24} 
                  color={Colors.success} 
                  style={styles.settingsOptionIcon} 
                />
                <View style={styles.settingsOptionText}>
                  <Text style={[styles.settingsOptionTitle, { color: Colors.success }]}>{option.title}</Text>
                  <Text style={styles.settingsOptionSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.success} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>DormLife v1.0.0</Text>
        </View>
      </ScrollView>

      <AdminPasswordModal
        visible={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSuccess={handleAdminAccessSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 30,
  },
  profileHeader: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 25,
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.background,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.background,
  },
  profileImageText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textOnPrimary,
    letterSpacing: 1,
  },
  profileImageOverlay: {
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
    fontWeight: '500',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roomText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    paddingVertical: 25,
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  settingsContainer: {
    marginBottom: 30,
    marginHorizontal: 20,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  adminSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  adminOption: {
    borderWidth: 2,
    borderColor: Colors.success,
    backgroundColor: 'rgba(52, 168, 83, 0.05)',
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  settingsOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsOptionIcon: {
    marginRight: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  settingsOptionText: {
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  settingsOptionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  logoutButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
  },
});