import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store/store';
import { Colors } from '../constants/Colors';
import GeorgetownLogo from '../components/GeorgetownLogo';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentData } = useSelector((state: RootState) => state.temperature);
  const { requests } = useSelector((state: RootState) => state.requests);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsHeaderCollapsed(offsetY > 50);
      }
    }
  );
  
  // Calculate user's active requests
  const userActiveRequests = requests.filter(
    request => request.userId === user?.id && request.status !== 'resolved'
  ).length;
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const quickActions = [
    {
      id: 1,
      title: 'Temperature',
      subtitle: 'Vote Daily',
      icon: 'thermometer' as keyof typeof Ionicons.glyphMap,
      color: Colors.error,
      action: () => navigation.navigate('TemperatureTab' as never),
    },
    {
      id: 2,
      title: 'Requests',
      subtitle: 'Get Help',
      icon: 'construct' as keyof typeof Ionicons.glyphMap,
      color: Colors.primary,
      action: () => navigation.navigate('CreateRequest' as never),
    },
    {
      id: 3,
      title: 'News',
      subtitle: 'Updates',
      icon: 'megaphone' as keyof typeof Ionicons.glyphMap,
      color: Colors.warning,
      action: () => navigation.navigate('AnnouncementsTab' as never),
    },
    {
      id: 4,
      title: 'Profile',
      subtitle: 'Account',
      icon: 'person-circle' as keyof typeof Ionicons.glyphMap,
      color: Colors.success,
      action: () => navigation.jumpTo('ProfileTab'),
    },
    {
      id: 5,
      title: 'Room',
      subtitle: 'Settings',
      icon: 'home' as keyof typeof Ionicons.glyphMap,
      color: Colors.accent,
      action: () => navigation.navigate('RoomSettings' as never),
    },
    {
      id: 6,
      title: 'Students',
      subtitle: 'Directory',
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      color: '#8E44AD',
      action: () => navigation.jumpTo('ProfileTab'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[
        styles.header,
        {
          paddingBottom: scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [25, 15],
            extrapolate: 'clamp',
          }),
        }
      ]}>
        <View style={styles.headerTop}>
          <View style={styles.logoSection}>
            <GeorgetownLogo size="small" variant="dark" showAppName={false} />
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.jumpTo('ProfileTab')}
          >
            <View style={styles.profileImageSmall}>
              <Text style={styles.profileInitial}>
                {user?.fullName?.charAt(0) || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[
          styles.headerContent,
          {
            opacity: scrollY.interpolate({
              inputRange: [0, 80],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 80],
                outputRange: [0, -20],
                extrapolate: 'clamp',
              }),
            }],
          }
        ]}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.fullName || 'Student'}</Text>
          <View style={styles.roomBadge}>
            <Ionicons name="home" size={14} color={Colors.textOnPrimary} />
            <Text style={styles.roomText}>Room {user?.roomNumber || 'N/A'}</Text>
          </View>
        </Animated.View>
      </Animated.View>
      
      <Animated.ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('TemperatureTab' as never)}
          >
            <Text style={styles.statValue}>{currentData.current}°F</Text>
            <Text style={styles.statLabel}>Current Temp</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('RequestsTab' as never)}
          >
            <Text style={styles.statValue}>{userActiveRequests}</Text>
            <Text style={styles.statLabel}>Your Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('RoomSettings' as never)}
          >
            <Text style={styles.statValue}>
              {user?.preferences?.temperaturePreference || 72}°F
            </Text>
            <Text style={styles.statLabel}>Your Preference</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.action}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                  <Ionicons 
                    name={action.icon} 
                    size={24} 
                    color={Colors.textOnPrimary} 
                  />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentActivityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Ionicons 
                name="thermometer" 
                size={24} 
                color={Colors.primary} 
                style={styles.activityIcon} 
              />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Temperature voted</Text>
                <Text style={styles.activitySubtitle}>You voted for 72°F • 2h ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={Colors.success} 
                style={styles.activityIcon} 
              />
              <View style={styles.activityText}>
                <Text style={styles.activityTitle}>Request resolved</Text>
                <Text style={styles.activitySubtitle}>Air conditioning fixed • Yesterday</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoSection: {
    flex: 1,
  },
  profileButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textLight,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roomBadge: {
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textOnPrimary,
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  quickActionCard: {
    width: (width - 64) / 3, // 3 columns with more spacing for text
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    aspectRatio: 1, // Makes it square
    minHeight: 100,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.1,
    flexShrink: 1,
  },
  recentActivityContainer: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityIcon: {
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  activitySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});