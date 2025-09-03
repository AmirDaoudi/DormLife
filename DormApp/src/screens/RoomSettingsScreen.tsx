import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../store/store';
import { setUser } from '../store/authSlice';
import { Colors } from '../constants/Colors';
import Slider from '@react-native-community/slider';

export default function RoomSettingsScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [quietHoursStart, setQuietHoursStart] = useState(
    user?.preferences?.quietHoursStart ? 
    parseInt(user.preferences.quietHoursStart.split(':')[0]) : 22
  );
  const [quietHoursEnd, setQuietHoursEnd] = useState(
    user?.preferences?.quietHoursEnd ? 
    parseInt(user.preferences.quietHoursEnd.split(':')[0]) : 8
  );
  const [temperaturePreference, setTemperaturePreference] = useState(
    user?.preferences?.temperaturePreference || 72
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notificationsEnabled ?? true
  );
  const [biometricEnabled, setBiometricEnabled] = useState(
    user?.preferences?.biometricEnabled ?? false
  );
  const [isSaving, setIsSaving] = useState(false);

  const formatTime = (hour: number): string => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user!,
        preferences: {
          ...user?.preferences,
          quietHoursStart: `${quietHoursStart.toString().padStart(2, '0')}:00`,
          quietHoursEnd: `${quietHoursEnd.toString().padStart(2, '0')}:00`,
          temperaturePreference,
          notificationsEnabled,
          biometricEnabled,
        },
      };

      dispatch(setUser(updatedUser));
      
      Alert.alert(
        'Settings Saved',
        'Your room preferences have been updated successfully.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Settings</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={[styles.saveButtonText, isSaving && styles.saveButtonTextDisabled]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.roomInfoCard}>
          <Ionicons name="home" size={32} color={Colors.primary} />
          <Text style={styles.roomNumber}>Room {user?.roomNumber || 'N/A'}</Text>
          <Text style={styles.roomSubtitle}>Bishop Walsh Hall</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Text style={styles.sectionDescription}>
            Set your preferred quiet hours for better sleep and study time
          </Text>
          
          <View style={styles.timeSettingCard}>
            <View style={styles.timeSetting}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <Text style={styles.timeValue}>{formatTime(quietHoursStart)}</Text>
              <Slider
                style={styles.timeSlider}
                minimumValue={18}
                maximumValue={23}
                value={quietHoursStart}
                onValueChange={setQuietHoursStart}
                step={1}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
              />
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabelSmall}>6 PM</Text>
                <Text style={styles.timeLabelSmall}>11 PM</Text>
              </View>
            </View>

            <View style={styles.timeSetting}>
              <Text style={styles.timeLabel}>End Time</Text>
              <Text style={styles.timeValue}>{formatTime(quietHoursEnd)}</Text>
              <Slider
                style={styles.timeSlider}
                minimumValue={6}
                maximumValue={10}
                value={quietHoursEnd}
                onValueChange={setQuietHoursEnd}
                step={1}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
              />
              <View style={styles.timeLabels}>
                <Text style={styles.timeLabelSmall}>6 AM</Text>
                <Text style={styles.timeLabelSmall}>10 AM</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temperature Preference</Text>
          <Text style={styles.sectionDescription}>
            Your preferred room temperature for HVAC system reference
          </Text>
          
          <View style={styles.tempCard}>
            <Text style={styles.tempValue}>{temperaturePreference}°F</Text>
            <Slider
              style={styles.tempSlider}
              minimumValue={65}
              maximumValue={80}
              value={temperaturePreference}
              onValueChange={setTemperaturePreference}
              step={1}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
            />
            <View style={styles.tempLabels}>
              <Text style={styles.tempLabelSmall}>65°F</Text>
              <Text style={styles.tempLabelSmall}>Cool</Text>
              <Text style={styles.tempLabelSmall}>Warm</Text>
              <Text style={styles.tempLabelSmall}>80°F</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>
                  Receive updates about requests, announcements, and room alerts
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Biometric Authentication</Text>
                <Text style={styles.settingSubtitle}>
                  Use Face ID or Touch ID to secure app access
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            These preferences help us provide a better living experience. 
            Quiet hours are shared with your floor mates, and temperature 
            preferences influence communal HVAC settings.
          </Text>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  saveButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomInfoCard: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
  },
  roomNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  roomSubtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  timeSettingCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
  },
  timeSetting: {
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  timeSlider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeLabelSmall: {
    fontSize: 12,
    color: Colors.textLight,
  },
  tempCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  tempValue: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.primary,
    marginBottom: 16,
  },
  tempSlider: {
    width: '100%',
    height: 40,
    marginBottom: 8,
  },
  tempLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  tempLabelSmall: {
    fontSize: 12,
    color: Colors.textLight,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
  },
});