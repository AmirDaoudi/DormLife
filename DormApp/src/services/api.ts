import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Always use production for now
    this.baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          try {
            await this.refreshToken();
            return this.api.request(error.config);
          } catch (refreshError) {
            // Silently fail refresh attempts - user will need to login again
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken } = response.data;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    roomNumber: string;
    graduationYear: number;
    schoolId: string;
  }) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async verifyEmail(token: string) {
    const response = await this.api.post('/auth/verify-email', { token });
    return response.data;
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // User endpoints
  async getUserProfile() {
    const response = await this.api.get('/user/profile');
    return response.data;
  }

  async updateProfile(userData: Partial<any>) {
    const response = await this.api.put('/user/profile', userData);
    return response.data;
  }

  async uploadProfilePhoto(photo: FormData) {
    const response = await this.api.post('/user/profile-photo', photo, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Schools endpoints
  async getSchools() {
    const response = await this.api.get('/schools');
    return response.data;
  }

  // Temperature endpoints
  async getTemperatureData(zone?: string) {
    const response = await this.api.get('/temperature/current', {
      params: { zone },
    });
    return response.data;
  }

  async voteTemperature(temperature: number, zone: string) {
    const response = await this.api.post('/temperature/vote', {
      temperature,
      zone,
    });
    return response.data;
  }

  // Requests endpoints
  async getRequests(filters?: {
    category?: string;
    status?: string;
    userId?: string;
  }) {
    const response = await this.api.get('/requests', { params: filters });
    return response.data;
  }

  async createRequest(requestData: {
    category: string;
    title: string;
    description: string;
    priority: string;
    isAnonymous: boolean;
    photos?: string[];
  }) {
    const response = await this.api.post('/requests', requestData);
    return response.data;
  }

  async updateRequest(id: string, data: Partial<any>) {
    const response = await this.api.put(`/requests/${id}`, data);
    return response.data;
  }

  async uploadRequestPhotos(photos: FormData) {
    const response = await this.api.post('/requests/upload-photos', photos, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Announcements endpoints
  async getAnnouncements() {
    const response = await this.api.get('/announcements');
    return response.data;
  }

  // Comments endpoints
  async addComment(requestId: string, content: string) {
    const response = await this.api.post(`/requests/${requestId}/comments`, {
      content,
    });
    return response.data;
  }

  async upvoteRequest(requestId: string) {
    const response = await this.api.post(`/requests/${requestId}/upvote`);
    return response.data;
  }
}

export default new ApiService();