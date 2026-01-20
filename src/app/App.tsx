import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/app/context/AppContext';
import { Toaster } from '@/app/components/ui/sonner';
import { Toaster as ToastToaster } from '@/app/components/ui/toaster';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Pages
import Login from '@/app/pages/Login';
import Signup from '@/app/pages/Signup';
import VerifyEmail from '@/app/pages/VerifyEmail';
import Dashboard from '@/app/pages/Dashboard';
import Subjects from '@/app/pages/Subjects';
import DailyAttendance from '@/app/pages/DailyAttendance';
import Timetable from '@/app/pages/Timetable';
import BunkPredictor from '@/app/pages/BunkPredictor';
import Profile from '@/app/pages/Profile';
import Layout from '@/app/components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useApp();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 mb-4 animate-pulse">
            <span className="text-white text-2xl">📚</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="attendance" element={<DailyAttendance />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="bunk-predictor" element={<BunkPredictor />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      {/* Catch-all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '736379616148-ts5k9nvq2vr5o16b6lmihpdshgcsl9t1.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
          <Toaster />
          <ToastToaster />
        </AppProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
