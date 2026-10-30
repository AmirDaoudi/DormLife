import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../services/api';

export interface Request {
  id: string;
  title: string;
  description: string;
  category: 'maintenance' | 'noise' | 'safety' | 'cleaning' | 'suggestion' | 'other';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isAnonymous: boolean;
  userId: string;
  roomNumber: string;
  upvotes: string[]; // Array of user IDs who upvoted
  timestamp: string;
  resolvedAt?: string;
  adminNotes?: string;
}

interface RequestsState {
  requests: Request[];
  userRequests: Request[];
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  userRequests: [],
  loading: false,
  error: null,
};

export const fetchRequests = createAsyncThunk(
  'requests/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getRequests();
      
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error || 'Failed to fetch requests');
      }
    } catch (error: any) {
      console.error('Fetch requests error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch requests');
    }
  }
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (requestData: {
    title: string;
    description: string;
    category: Request['category'];
    priority: Request['priority'];
    isAnonymous: boolean;
    photos?: string[];
  }, { rejectWithValue }) => {
    try {
      const payload = {
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        priority: requestData.priority,
        isAnonymous: requestData.isAnonymous,
        photos: requestData.photos || [],
      };
      
      console.log('📤 Sending request data:', payload);
      console.log('📏 Data lengths:', {
        titleLength: payload.title.length,
        descriptionLength: payload.description.length,
      });
      
      const response = await apiService.createRequest(payload);
      
      console.log('📥 Received response:', response);
      
      if (response.success) {
        return response.data;
      } else {
        console.error('❌ Request failed:', response);
        return rejectWithValue(response.error || 'Failed to create request');
      }
    } catch (error: any) {
      console.error('❌ Create request error:', error);
      if (error.response?.status === 400) {
        console.error('❌ 400 Error details:', error.response?.data);
      }
      return rejectWithValue(error.response?.data?.error || error.message || 'Failed to create request');
    }
  }
);

export const toggleUpvote = createAsyncThunk(
  'requests/toggleUpvote',
  async ({ requestId, userId }: { requestId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.upvoteRequest(requestId);
      
      if (response.success) {
        return { requestId, userId };
      } else {
        return rejectWithValue(response.error || 'Failed to toggle upvote');
      }
    } catch (error: any) {
      console.error('Toggle upvote error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to toggle upvote');
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'requests/updateStatus',
  async ({ requestId, status, adminNotes }: { 
    requestId: string; 
    status: Request['status']; 
    adminNotes?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateRequest(requestId, { status, adminNotes });
      
      if (response.success) {
        return { 
          requestId, 
          status, 
          adminNotes, 
          resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined 
        };
      } else {
        return rejectWithValue(response.error || 'Failed to update request status');
      }
    } catch (error: any) {
      console.error('Update request status error:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to update request status');
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.map((request: any) => ({
          ...request,
          upvotes: Array.isArray(request.upvotes) ? request.upvotes : []
        }));
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false;
        const requestWithUpvotes = {
          ...action.payload,
          upvotes: Array.isArray(action.payload.upvotes) ? action.payload.upvotes : []
        };
        state.requests.unshift(requestWithUpvotes);
        if (!action.payload.isAnonymous) {
          state.userRequests.unshift(requestWithUpvotes);
        }
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Toggle upvote
      .addCase(toggleUpvote.fulfilled, (state, action) => {
        const { requestId, userId } = action.payload;
        const request = state.requests.find(r => r.id === requestId);
        if (request) {
          const upvoteIndex = request.upvotes.indexOf(userId);
          if (upvoteIndex === -1) {
            request.upvotes.push(userId);
          } else {
            request.upvotes.splice(upvoteIndex, 1);
          }
        }
        
        // Update userRequests as well
        const userRequest = state.userRequests.find(r => r.id === requestId);
        if (userRequest) {
          const upvoteIndex = userRequest.upvotes.indexOf(userId);
          if (upvoteIndex === -1) {
            userRequest.upvotes.push(userId);
          } else {
            userRequest.upvotes.splice(upvoteIndex, 1);
          }
        }
      })
      
      // Update request status
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const { requestId, status, adminNotes, resolvedAt } = action.payload;
        const request = state.requests.find(r => r.id === requestId);
        if (request) {
          request.status = status;
          if (adminNotes) request.adminNotes = adminNotes;
          if (resolvedAt) request.resolvedAt = resolvedAt;
        }
        
        const userRequest = state.userRequests.find(r => r.id === requestId);
        if (userRequest) {
          userRequest.status = status;
          if (adminNotes) userRequest.adminNotes = adminNotes;
          if (resolvedAt) userRequest.resolvedAt = resolvedAt;
        }
      });
  },
});

export const { clearError } = requestsSlice.actions;
export default requestsSlice.reducer;