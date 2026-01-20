import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  authAPI,
  subjectsAPI,
  timetableAPI,
  attendanceAPI,
  profileAPI,
} from '@/services/api';
import { toast } from 'sonner';

// Types
export interface Subject {
  _id: string;
  id?: string;
  name: string;
  totalLectures: number;
  attendedLectures: number;
  absentLectures?: number;
  minimumAttendance: number;
  color: string;
}

export interface TimetableEntry {
  _id: string;
  id?: string;
  day: string;
  subjectId: string;
  subjectName: string;
  startTime: string;
  endTime: string;
}

export interface AttendanceRecord {
  _id: string;
  id?: string;
  date: string;
  subjectId: string;
  subjectName: string;
  status: 'present' | 'absent';
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  college?: string;
  semesterStart?: string;
  semesterEnd?: string;
  currentOverallAttendance?: number | null;
  overallAttendance?: number;
  overallMinimumAttendance?: number;
  isVerified?: boolean;
}

interface AppContextType {
  user: User | null;
  subjects: Subject[];
  timetable: TimetableEntry[];
  attendanceRecords: AttendanceRecord[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  addSubject: (subject: Omit<Subject, '_id' | 'id'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTimetableEntry: (entry: Omit<TimetableEntry, '_id' | 'id'>) => Promise<void>;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;
  markAttendance: (record: Omit<AttendanceRecord, '_id' | 'id'>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  getAttendanceForDate: (date: string) => AttendanceRecord[];
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          await loadUserData();
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Load all user data
  const loadUserData = async () => {
    try {
      const [profileRes, subjectsRes, timetableRes, attendanceRes] = await Promise.all([
        profileAPI.get(),
        subjectsAPI.getAll(),
        timetableAPI.getAll(),
        attendanceAPI.getAll(),
      ]);

      if (profileRes.success && profileRes.data.user) {
        setUser(profileRes.data.user);
        localStorage.setItem('user', JSON.stringify(profileRes.data.user));
      }
      if (subjectsRes.success) {
        setSubjects(subjectsRes.data.subjects || []);
      }
      if (timetableRes.success) {
        setTimetable(timetableRes.data.timetable || []);
      }
      if (attendanceRes.success) {
        setAttendanceRecords(attendanceRes.data.attendance || []);
      }
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      toast.error(error.response?.data?.message || 'Failed to load data');
    }
  };

  const refreshData = async () => {
    if (isAuthenticated) {
      await loadUserData();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        await loadUserData();
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const signup = async (data: any) => {
    try {
      const response = await authAPI.signup({
        name: data.fullName,
        email: data.email,
        password: data.password,
        college: data.college,
      });
      if (response.success) {
        if (response.data?.emailSent === false) {
          toast.warning('Account created but verification email could not be sent. Please contact support.');
        } else {
          toast.success('Verification email sent! Please check your inbox to verify your account.');
        }
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setSubjects([]);
      setTimetable([]);
      setAttendanceRecords([]);
      toast.success('Logged out successfully!');
    }
  };

  const addSubject = async (subject: Omit<Subject, '_id' | 'id'>) => {
    try {
      const response = await subjectsAPI.create(subject);
      if (response.success) {
        setSubjects([...subjects, response.data.subject]);
        toast.success('Subject added successfully!');
      }
    } catch (error: any) {
      console.error('Failed to add subject:', error);
      toast.error(error.response?.data?.message || 'Failed to add subject');
      throw error;
    }
  };

  const updateSubject = async (id: string, subjectData: Partial<Subject>) => {
    try {
      const response = await subjectsAPI.update(id, subjectData);
      if (response.success) {
        setSubjects(subjects.map((s) => (s._id === id || s.id === id ? response.data.subject : s)));
        toast.success('Subject updated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to update subject:', error);
      toast.error(error.response?.data?.message || 'Failed to update subject');
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      const response = await subjectsAPI.delete(id);
      if (response.success) {
        setSubjects(subjects.filter((s) => s._id !== id && s.id !== id));
        setTimetable(timetable.filter((t) => t.subjectId !== id));
        setAttendanceRecords(attendanceRecords.filter((a) => a.subjectId !== id));
        toast.success('Subject deleted successfully!');
      }
    } catch (error: any) {
      console.error('Failed to delete subject:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subject');
      throw error;
    }
  };

  const addTimetableEntry = async (entry: Omit<TimetableEntry, '_id' | 'id'>) => {
    try {
      const response = await timetableAPI.create(entry);
      if (response.success) {
        setTimetable([...timetable, response.data.timetable]);
        toast.success('Timetable entry added!');
      }
    } catch (error: any) {
      console.error('Failed to add timetable entry:', error);
      toast.error(error.response?.data?.message || 'Failed to add timetable entry');
      throw error;
    }
  };

  const updateTimetableEntry = async (id: string, entry: Partial<TimetableEntry>) => {
    try {
      const response = await timetableAPI.update(id, entry);
      if (response.success) {
        setTimetable(timetable.map((t) => (t._id === id || t.id === id ? response.data.timetable : t)));
        toast.success('Timetable updated!');
      }
    } catch (error: any) {
      console.error('Failed to update timetable entry:', error);
      toast.error(error.response?.data?.message || 'Failed to update timetable entry');
      throw error;
    }
  };

  const deleteTimetableEntry = async (id: string) => {
    try {
      const response = await timetableAPI.delete(id);
      if (response.success) {
        setTimetable(timetable.filter((t) => t._id !== id && t.id !== id));
        toast.success('Entry deleted!');
      }
    } catch (error: any) {
      console.error('Failed to delete timetable entry:', error);
      toast.error(error.response?.data?.message || 'Failed to delete timetable entry');
      throw error;
    }
  };

  const markAttendance = async (record: Omit<AttendanceRecord, '_id' | 'id'>) => {
    try {
      const response = await attendanceAPI.mark(record);
      if (response.success) {
        // Check if attendance already exists for this date and subject
        const existingIndex = attendanceRecords.findIndex(
          (a) => a.date === record.date && a.subjectId === record.subjectId
        );

        if (existingIndex !== -1) {
          // Update existing record
          const updated = [...attendanceRecords];
          updated[existingIndex] = response.data.attendance;
          setAttendanceRecords(updated);
        } else {
          // Add new record
          setAttendanceRecords([...attendanceRecords, response.data.attendance]);
        }

        // Update subject with the new attendance counts from backend
        if (response.data.subject) {
          setSubjects(subjects.map((s) => 
            (s._id === response.data.subject.id || s.id === response.data.subject.id) 
              ? {
                  ...s,
                  totalLectures: response.data.subject.totalLectures,
                  attendedLectures: response.data.subject.attendedLectures,
                  absentLectures: response.data.subject.absentLectures,
                }
              : s
          ));
        }

        toast.success(`Marked as ${record.status}`);
      }
    } catch (error: any) {
      console.error('Failed to mark attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await profileAPI.update(userData);
      if (response.success) {
        setUser(response.data.user);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const getAttendanceForDate = (date: string): AttendanceRecord[] => {
    return attendanceRecords.filter((a) => a.date === date);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        subjects,
        timetable,
        attendanceRecords,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        addSubject,
        updateSubject,
        deleteSubject,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        markAttendance,
        updateUser,
        getAttendanceForDate,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
