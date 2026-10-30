import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import apiService from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isOnboarding: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
  isOnboarding: true,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        
        return {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        };
      } else {
        return rejectWithValue(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    email: string;
    password: string;
    fullName: string;
    roomNumber: string;
    graduationYear: number;
    schoolId: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        return {
          message: response.message,
          user: response.data.user,
        };
      } else {
        return rejectWithValue(response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await apiService.verifyEmail(token);
      
      if (response.success) {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        
        return {
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          user: response.data.user,
        };
      } else {
        return rejectWithValue(response.error || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      return rejectWithValue(error.response?.data?.error || 'Email verification failed');
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        // Silently fail - this is expected when user hasn't logged in yet
        return rejectWithValue('No token found');
      }
      
      // Get user profile from API
      const response = await apiService.getUserProfile();
      
      if (response.success) {
        return { user: response.data.user, token };
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (error: any) {
      // Only log actual errors, not expected "no token" cases
      if (error.message !== 'No token found') {
        console.error('Load user error:', error);
      }
      await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
      return rejectWithValue('Session expired');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProfile(userData);
      
      if (response.success) {
        return response.data.user;
      } else {
        return rejectWithValue(response.error || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      return rejectWithValue(error.response?.data?.error || 'Profile update failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    completeOnboarding: (state) => {
      state.isOnboarding = false;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isOnboarding = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Verify Email
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Load from storage
      .addCase(loadUserFromStorage.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isOnboarding = false;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isOnboarding = true;
      });
  },
});

export const { clearError, completeOnboarding, setUser } = authSlice.actions;
export default authSlice.reducer;