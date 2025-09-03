export interface User {
  id: string;
  email: string;
  fullName: string;
  roomNumber: string;
  profilePhoto?: string;
  year: string;
  graduationYear: number;
  emergencyContact: string;
  preferences: UserPreferences;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  quietHoursStart: string;
  quietHoursEnd: string;
  temperaturePreference: number;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  logo?: string;
  timezone: string;
}

export interface TemperatureVote {
  id: string;
  userId: string;
  temperature: number;
  zone: string;
  timestamp: string;
  weight: number;
}

export interface Request {
  id: string;
  userId: string;
  category: RequestCategory;
  title: string;
  description: string;
  photos: string[];
  priority: Priority;
  status: RequestStatus;
  isAnonymous: boolean;
  upvotes: number;
  comments: Comment[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RequestCategory {
  MAINTENANCE = 'maintenance',
  NOISE_COMPLAINT = 'noise_complaint',
  SUGGESTION = 'suggestion',
  EMERGENCY = 'emergency',
  LOST_FOUND = 'lost_found',
  PACKAGE_PICKUP = 'package_pickup'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RequestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  isAdminReply: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: Priority;
  targetAudience: string[];
  createdAt: string;
  expiresAt?: string;
}

export enum AnnouncementType {
  GENERAL = 'general',
  EMERGENCY = 'emergency',
  MAINTENANCE = 'maintenance',
  EVENT = 'event'
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}