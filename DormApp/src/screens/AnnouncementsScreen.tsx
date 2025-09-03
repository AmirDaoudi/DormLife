import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'maintenance' | 'event';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Georgetown Prep Winter Break Schedule',
    content: 'Dormitories will close at 6:00 PM on December 15th for winter break. All students must check out by this time. Check-in for spring semester begins January 8th at 2:00 PM.',
    type: 'general',
    priority: 'high',
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    title: 'Scheduled Maintenance - Heating System',
    content: 'The heating system in Bishop Walsh Hall will undergo routine maintenance on Saturday from 8 AM to 12 PM. Temporary heaters will be provided if needed.',
    type: 'maintenance',
    priority: 'medium',
    timestamp: '6 hours ago',
  },
  {
    id: '3',
    title: 'House Meeting - Sunday 7 PM',
    content: 'Monthly house meeting in the Bishop Walsh common room. We\'ll discuss upcoming winter activities, study hall policies, and address any resident concerns.',
    type: 'event',
    priority: 'low',
    timestamp: '1 day ago',
  },
  {
    id: '4',
    title: 'Updated Quiet Hours Policy',
    content: 'Starting Monday, quiet hours during exam week will be extended from 9 PM - 9 AM to support studying. Regular quiet hours (10 PM - 8 AM) resume after exams.',
    type: 'general',
    priority: 'medium',
    timestamp: '2 days ago',
  },
  {
    id: '5',
    title: 'Fire Safety Inspection Results',
    content: 'Annual fire safety inspection completed successfully. Reminder: candles, incense, and cooking appliances are prohibited in dormitory rooms. Report any safety concerns to your House Advisor immediately.',
    type: 'general',
    priority: 'high',
    timestamp: '5 days ago',
  },
];

export default function AnnouncementsScreen() {
  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'emergency': return 'warning';
      case 'maintenance': return 'construct';
      case 'event': return 'calendar';
      case 'general': return 'megaphone';
      default: return 'megaphone';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return Colors.error;
      case 'high': return Colors.warning;
      case 'medium': return Colors.primary;
      case 'low': return Colors.textLight;
      default: return Colors.textLight;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Announcements</Text>
      </View>

      <ScrollView style={styles.announcementsList}>
        {mockAnnouncements.map((announcement) => (
          <View key={announcement.id} style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.typeContainer}>
                <Ionicons 
                  name={getTypeIcon(announcement.type)} 
                  size={20} 
                  color={Colors.primary} 
                  style={styles.typeIcon} 
                />
                <Text style={styles.typeText}>{announcement.type.toUpperCase()}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(announcement.priority) }]}>
                <Text style={styles.priorityText}>{announcement.priority.toUpperCase()}</Text>
              </View>
            </View>
            
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementContent}>{announcement.content}</Text>
            
            <View style={styles.announcementFooter}>
              <Text style={styles.timestamp}>{announcement.timestamp}</Text>
            </View>
          </View>
        ))}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
  },
  announcementsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  announcementCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementContent: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  announcementFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  timestamp: {
    fontSize: 14,
    color: Colors.textLight,
  },
});