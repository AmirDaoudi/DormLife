export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  roomNumber?: string;
  profilePhotoUrl?: string;
  year?: string;
  graduationYear?: number;
  emergencyContact?: string;
  schoolId: string;
  role: 'student' | 'admin' | 'staff';
  preferences: UserPreferences;
  isVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  lastLogin?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  quietHoursStart?: string;
  quietHoursEnd?: string;
  temperaturePreference?: number;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  [key: string]: any;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  logoUrl?: string;
  timezone: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemperatureZone {
  id: string;
  name: string;
  description?: string;
  schoolId: string;
  currentTemperature?: number;
  targetTemperature?: number;
  minTemperature: number;
  maxTemperature: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemperatureVote {
  id: string;
  userId: string;
  zoneId: string;
  temperature: number;
  voteWeight: number;
  createdAt: Date;
}

export interface Request {
  id: string;
  userId?: string;
  categoryId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  isAnonymous: boolean;
  photos: string[];
  upvotes: number;
  assignedTo?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface RequestComment {
  id: string;
  requestId: string;
  userId?: string;
  content: string;
  isAdminReply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'emergency' | 'maintenance' | 'event';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  schoolId: string;
  authorId?: string;
  targetAudience: string[];
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  deviceType?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  schoolId: string;
  organizerId?: string;
  maxAttendees?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  userId: string;
  status: 'attending' | 'maybe' | 'not_attending';
  createdAt: Date;
}

export interface RoomBooking {
  id: string;
  roomName: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface LaundryMachine {
  id: string;
  machineNumber: string;
  machineType: 'washer' | 'dryer';
  schoolId: string;
  status: 'available' | 'in_use' | 'out_of_order';
  timeRemaining: number;
  currentUserId?: string;
  lastUpdated: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  schoolId: string;
  iat?: number;
  exp?: number;
}

// Socket.io event types
export interface SocketEvents {
  'temperature:update': (data: { zoneId: string; temperature: number; targetTemperature: number }) => void;
  'request:new': (data: Request) => void;
  'request:update': (data: { id: string; status: string; updatedAt: Date }) => void;
  'announcement:new': (data: Announcement) => void;
  'user:join': (data: { userId: string; schoolId: string }) => void;
  'user:leave': (data: { userId: string }) => void;
}

// Error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation schema types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}