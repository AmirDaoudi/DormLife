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

interface NotificationSettings {
  requests: boolean;
  announcements: boolean;
  temperature: boolean;
  emergencies: boolean;
  maintenance: boolean;
  events: boolean;
  quietHours: boolean;
  roomUpdates: boolean;
}

export default function NotificationSettingsScreen({ navigation }: { navigation: any }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [pushEnabled, setPushEnabled] = useState(
    user?.preferences?.notificationsEnabled ?? true
  );
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    requests: true,
    announcements: true,
    temperature: false,
    emergencies: true,
    maintenance: true,
    events: false,
    quietHours: true,
    roomUpdates: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const notificationTypes = [
    {
      key: 'requests' as keyof NotificationSettings,
      title: 'Request Updates',
      subtitle: 'Status changes on your submitted requests',
      icon: 'document-text',
    },
    {
      key: 'announcements' as keyof NotificationSettings,
      title: 'Announcements',
      subtitle: 'Important dormitory announcements and updates',
      icon: 'megaphone',
    },
    {
      key: 'temperature' as keyof NotificationSettings,
      title: 'Temperature Voting',
      subtitle: 'Daily temperature voting reminders',
      icon: 'thermometer',
    },
    {
      key: 'emergencies' as keyof NotificationSettings,
      title: 'Emergency Alerts',
      subtitle: 'Critical safety and emergency notifications',
      icon: 'warning',
    },
    {
      key: 'maintenance' as keyof NotificationSettings,
      title: 'Maintenance Alerts',
      subtitle: 'Scheduled maintenance and service interruptions',
      icon: 'construct',
    },
    {
      key: 'events' as keyof NotificationSettings,
      title: 'House Events',
      subtitle: 'House meetings, activities, and social events',
      icon: 'calendar',
    },
    {
      key: 'quietHours' as keyof NotificationSettings,
      title: 'Quiet Hours',
      subtitle: 'Reminders about quiet hours and noise policies',
      icon: 'volume-off',
    },
    {
      key: 'roomUpdates' as keyof NotificationSettings,
      title: 'Room Updates',
      subtitle: 'Changes to room assignments and roommate info',
      icon: 'home',
    },
  ];

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user!,
        preferences: {
          ...user?.preferences,
          notificationsEnabled: pushEnabled,
          notificationSettings: settings,
        },
      };

      dispatch(setUser(updatedUser));
      
      Alert.alert(
        'Settings Saved',
        'Your notification preferences have been updated successfully.',
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
        <Text style={styles.headerTitle}>Notifications</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Methods</Text>
          <Text style={styles.sectionDescription}>
            Choose how you want to receive notifications
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>
                  Real-time notifications on your device
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingSubtitle}>
                  Important updates sent to your Georgetown email
                </Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <Text style={styles.sectionDescription}>
            Customize which types of notifications you receive
          </Text>
          
          {notificationTypes.map((type) => (
            <View key={type.key} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons 
                  name={type.icon as keyof typeof Ionicons.glyphMap} 
                  size={24} 
                  color={settings[type.key] ? Colors.primary : Colors.textLight} 
                />
                <View style={styles.settingText}>
                  <Text style={[
                    styles.settingTitle,
                    !settings[type.key] && styles.settingTitleDisabled,
                  ]}>
                    {type.title}
                  </Text>
                  <Text style={[
                    styles.settingSubtitle,
                    !settings[type.key] && styles.settingSubtitleDisabled,
                  ]}>
                    {type.subtitle}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings[type.key]}
                onValueChange={(value) => handleSettingChange(type.key, value)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.background}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSettings({
                requests: true,
                announcements: true,
                temperature: false,
                emergencies: true,
                maintenance: true,
                events: false,
                quietHours: true,
                roomUpdates: true,
              });
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Essential Only</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSettings({
                requests: true,
                announcements: true,
                temperature: true,
                emergencies: true,
                quietHours: true,
                roomUpdates: true,
                events: true,
                maintenance: true,
              });
            }}
          >
            <Ionicons name="notifications" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Enable All</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSettings({
                requests: false,
                announcements: false,
                temperature: false,
                emergencies: false,
                quietHours: false,
                roomUpdates: false,
                events: false,
                maintenance: false,
              });
            }}
          >
            <Ionicons name="notifications-off" size={20} color={Colors.error} />
            <Text style={[styles.actionButtonText, { color: Colors.error }]}>Disable All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Emergency notifications cannot be disabled for safety reasons. 
            You can adjust notification timing in your device settings. 
            Email notifications are sent to your Georgetown Prep email address.
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
  section: {
    marginVertical: 20,
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  settingTitleDisabled: {
    color: Colors.textLight,
  },
  settingSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  settingSubtitleDisabled: {
    color: Colors.separator,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    marginLeft: 12,
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