import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { Platform } from 'react-native';
import { RootState, AppDispatch } from '../store/store';
import { loadUserFromStorage } from '../store/authSlice';

// Auth screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import TemperatureScreen from '../screens/TemperatureScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';

// Additional screens
import CreateRequestScreen from '../screens/CreateRequestScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import RoomSettingsScreen from '../screens/RoomSettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';

// Components
import LoadingScreen from '../components/LoadingScreen';
import TabBarIcon from '../components/TabBarIcon';
import { Colors } from '../constants/Colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0.5,
          borderTopColor: Colors.border,
          paddingBottom: Platform.OS === 'ios' ? 0 : 8,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        headerShown: false, // We'll handle headers in individual screens
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="house.fill" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TemperatureTab"
        component={TemperatureScreen}
        options={{
          title: 'Temperature',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="thermometer" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RequestsTab"
        component={RequestsScreen}
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="exclamationmark.bubble.fill" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AnnouncementsTab"
        component={AnnouncementsScreen}
        options={{
          title: 'Announcements',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="megaphone.fill" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person.fill" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Request related screens */}
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
      
      {/* Profile related screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="RoomSettings" component={RoomSettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      
      {/* Admin screens */}
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      
      {/* Other screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Temperature" component={TemperatureScreen} />
      <Stack.Screen name="Requests" component={RequestsScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, isOnboarding, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}