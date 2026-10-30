export interface User {
  id: string;
  email: string;
  fullName: string;
  roomNumber?: string;
  profilePhotoUrl?: string;
  year?: string;
  emergencyContact?: string;
  schoolId: string;
  role: 'student' | 'admin' | 'staff';
  preferences?: UserPreferences;
  isVerified: boolean;
  createdAt: string;
}

export interface UserPreferences {
  quietHoursStart?: string;
  quietHoursEnd?: string;
  temperaturePreference?: number;
  notificationsEnabled?: boolean;
  biometricEnabled?: boolean;
  notificationSettings?: NotificationSettings;
}

export interface NotificationSettings {
  requests: boolean;
  announcements: boolean;
  temperature: boolean;
  emergencies: boolean;
  maintenance: boolean;
  events: boolean;
  quietHours: boolean;
  roomUpdates: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  timezone: string;
}