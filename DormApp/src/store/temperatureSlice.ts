import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../services/api';

interface TemperatureData {
  current: number;
  target: number;
  lastUpdated: string;
  zone: string;
  trend: 'rising' | 'falling' | 'stable';
}

interface TemperatureVote {
  userId: string;
  temperature: number;
  timestamp: string;
}

interface TemperatureStats {
  totalVotes: number;
  averagePreference: number;
  userLastVote?: number;
  nextVoteAvailable?: string;
}

interface TemperatureState {
  currentData: TemperatureData;
  stats: TemperatureStats;
  votes: TemperatureVote[];
  loading: boolean;
  error: string | null;
  hasVotedToday: boolean;
}

const initialState: TemperatureState = {
  currentData: {
    current: 74,
    target: 72,
    lastUpdated: new Date().toISOString(),
    zone: 'Bishop Walsh Hall - Main Floor',
    trend: 'falling',
  },
  stats: {
    totalVotes: 24,
    averagePreference: 71,
    userLastVote: 72,
  },
  votes: [],
  loading: false,
  error: null,
  hasVotedToday: false,
};

export const submitTemperatureVote = createAsyncThunk(
  'temperature/submitVote',
  async ({ temperature, userId }: { temperature: number; userId: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.voteTemperature(temperature, 'main');
      
      const vote: TemperatureVote = {
        userId,
        temperature,
        timestamp: new Date().toISOString(),
      };
      
      return vote;
    } catch (error: any) {
      console.error('Temperature vote error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to submit temperature vote');
    }
  }
);

export const fetchTemperatureData = createAsyncThunk(
  'temperature/fetchData',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if user is authenticated before making API call
      const state = getState() as any;
      if (!state.auth.isAuthenticated || !state.auth.token) {
        // Return default data for unauthenticated users - no error
        return {
          current: 72,
          target: 72,
          lastUpdated: new Date().toISOString(),
          zone: 'Main Floor',
          trend: 'stable' as const,
        };
      }

      const response = await apiService.getTemperatureData();
      
      // Transform API response to match our interface
      const data: TemperatureData = {
        current: response.data.temperature || 72,
        target: response.data.targetTemperature || 72,
        lastUpdated: new Date().toISOString(),
        zone: response.data.zone?.name || 'Main Floor',
        trend: 'stable', // API doesn't provide trend yet
      };
      
      return data;
    } catch (error: any) {
      // Only log actual API errors, not auth errors
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        console.error('Temperature fetch error:', error);
      }
      
      // Fall back to default data if API fails
      return {
        current: 72,
        target: 72,
        lastUpdated: new Date().toISOString(),
        zone: 'Main Floor',
        trend: 'stable' as const,
      };
    }
  }
);

const temperatureSlice = createSlice({
  name: 'temperature',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateCurrentTemperature: (state, action: PayloadAction<number>) => {
      state.currentData.current = action.payload;
      state.currentData.lastUpdated = new Date().toISOString();
    },
    setHasVotedToday: (state, action: PayloadAction<boolean>) => {
      state.hasVotedToday = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit vote
      .addCase(submitTemperatureVote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTemperatureVote.fulfilled, (state, action) => {
        state.loading = false;
        state.votes.push(action.payload);
        state.hasVotedToday = true;
        
        // Update stats
        state.stats.totalVotes += 1;
        state.stats.userLastVote = action.payload.temperature;
        
        // Recalculate average
        const allTemperatures = state.votes.map(v => v.temperature);
        const sum = allTemperatures.reduce((acc, temp) => acc + temp, 0);
        state.stats.averagePreference = Math.round(sum / allTemperatures.length);
        
        // Set next vote available time (24 hours from now)
        const nextVote = new Date();
        nextVote.setHours(nextVote.getHours() + 24);
        state.stats.nextVoteAvailable = nextVote.toISOString();
      })
      .addCase(submitTemperatureVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch temperature data
      .addCase(fetchTemperatureData.fulfilled, (state, action) => {
        state.currentData = action.payload;
      });
  },
});

export const { clearError, updateCurrentTemperature, setHasVotedToday } = temperatureSlice.actions;
export default temperatureSlice.reducer;