import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      const response = await authAPI.googleAuth(credentialResponse.credential);
      
      if (response.success) {
        toast.success('Signup successful!');
        navigate('/dashboard');
        window.location.reload(); // Reload to update auth state
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            <span className="text-white text-2xl"></span>
          </div>
          <h1 className="text-3xl mb-2 text-gray-900">Join Bunk Buzz</h1>
          <p className="text-gray-600">Track your attendance smartly</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Google Signup */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="continue_with"
                width="400"
              />
            </div>

            {loading && (
              <p className="text-center text-sm text-gray-500">Creating your account...</p>
            )}
          </div>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
