import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Types
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface UserData {
  email: string;
  password: string;
  name?: string;
  enrollmentNumber?: string;
  college?: string;
}

interface SubjectData {
  name: string;
  totalLectures?: number;
  attendedLectures?: number;
  minimumAttendance?: number;
  color?: string;
}

interface TimetableEntry {
  day: string;
  subjectId: string;
  startTime: string;
  endTime: string;
}

interface AttendanceData {
  subjectId: string;
  date: string;
  attended?: boolean;
  status?: 'present' | 'absent';
  subjectName?: string;
}

interface AttendanceFilters {
  subjectId?: string;
  startDate?: string;
  endDate?: string;
  attended?: boolean;
}

interface ProfileData {
  name?: string;
  email?: string;
  enrollmentNumber?: string;
  college?: string;
  semesterStart?: string;
  semesterEnd?: string;
  currentOverallAttendance?: number | null;
  overallMinimumAttendance?: number;
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  signup: async (userData: UserData): Promise<ApiResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-email', { token });
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  login: async (email: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  googleAuth: async (token: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/google', { token });
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  resendVerification: async (email: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

// Subjects API
export const subjectsAPI = {
  getAll: async (): Promise<ApiResponse> => {
    const response = await api.get('/subjects');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (subjectData: SubjectData): Promise<ApiResponse> => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  update: async (id: string, subjectData: Partial<SubjectData>): Promise<ApiResponse> => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  getStats: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/subjects/${id}/stats`);
    return response.data;
  },
};

// Timetable API
export const timetableAPI = {
  getAll: async (day?: string): Promise<ApiResponse> => {
    const response = await api.get('/timetable', { params: { day } });
    return response.data;
  },

  getToday: async (): Promise<ApiResponse> => {
    const response = await api.get('/timetable/today');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/timetable/${id}`);
    return response.data;
  },

  create: async (entryData: TimetableEntry): Promise<ApiResponse> => {
    const response = await api.post('/timetable', entryData);
    return response.data;
  },

  update: async (id: string, entryData: Partial<TimetableEntry>): Promise<ApiResponse> => {
    const response = await api.put(`/timetable/${id}`, entryData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/timetable/${id}`);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (filters?: AttendanceFilters): Promise<ApiResponse> => {
    const response = await api.get('/attendance', { params: filters });
    return response.data;
  },

  getByDate: async (date: string): Promise<ApiResponse> => {
    const response = await api.get(`/attendance/date/${date}`);
    return response.data;
  },

  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/attendance/stats');
    return response.data;
  },

  getSubjectHistory: async (subjectId: string, limit?: number): Promise<ApiResponse> => {
    const response = await api.get(`/attendance/subject/${subjectId}/history`, {
      params: { limit },
    });
    return response.data;
  },

  mark: async (attendanceData: AttendanceData): Promise<ApiResponse> => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  update: async (id: string, attendanceData: Partial<AttendanceData>): Promise<ApiResponse> => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

// Bunk Predictor API
export const bunkPredictorAPI = {
  predict: async (subjectId: string): Promise<ApiResponse> => {
    const response = await api.post('/bunk-predictor/predict', { subjectId });
    return response.data;
  },

  bulkPredict: async (): Promise<ApiResponse> => {
    const response = await api.get('/bunk-predictor/bulk-predict');
    return response.data;
  },

  simulate: async (subjectId: string, numberOfBunks: number): Promise<ApiResponse> => {
    const response = await api.post('/bunk-predictor/simulate', {
      subjectId,
      numberOfBunks,
    });
    return response.data;
  },
};

// Profile API
export const profileAPI = {
  get: async (): Promise<ApiResponse> => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (profileData: ProfileData): Promise<ApiResponse> => {
    const response = await api.put('/profile', profileData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.put('/profile/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  deactivate: async (): Promise<ApiResponse> => {
    const response = await api.delete('/profile');
    if (response.data.success) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
    return response.data;
  },
};

export default api;
