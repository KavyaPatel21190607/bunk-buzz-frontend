import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { User, Mail, Building2, Calendar, Target, Edit2, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    college: user?.college || '',
    semesterStart: user?.semesterStart || '',
    semesterEnd: user?.semesterEnd || '',
    currentOverallAttendance: user?.currentOverallAttendance?.toString() || '',
    overallMinimumAttendance: user?.overallMinimumAttendance?.toString() || '75',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        college: formData.college,
        semesterStart: formData.semesterStart,
        semesterEnd: formData.semesterEnd,
        currentOverallAttendance: formData.currentOverallAttendance ? parseFloat(formData.currentOverallAttendance) : undefined,
        overallMinimumAttendance: parseInt(formData.overallMinimumAttendance),
      });
      setIsEditing(false);
    } catch (error) {
      // Error is already handled by the context
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      college: user?.college || '',
      semesterStart: user?.semesterStart || '',
      semesterEnd: user?.semesterEnd || '',
      currentOverallAttendance: user?.currentOverallAttendance?.toString() || '',
      overallMinimumAttendance: user?.overallMinimumAttendance?.toString() || '75',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl">
              {user?.name?.[0]}
            </div>
            <div>
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{user?.name}</p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{user?.email}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  College Name
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{user?.college}</p>
                )}
              </div>
            </div>
          </div>

          {/* Semester Information */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg">Semester Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Semester Start Date
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.semesterStart}
                    onChange={(e) => setFormData({ ...formData, semesterStart: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">
                    {user?.semesterStart ? new Date(user.semesterStart).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Semester End Date
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.semesterEnd}
                    onChange={(e) => setFormData({ ...formData, semesterEnd: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">
                    {user?.semesterEnd ? new Date(user.semesterEnd).toLocaleDateString() : 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Criteria */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="text-lg">Attendance Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Current Overall Attendance (%)
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Enter current attendance"
                    value={formData.currentOverallAttendance}
                    onChange={(e) => setFormData({ ...formData, currentOverallAttendance: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">
                    {user?.currentOverallAttendance !== null && user?.currentOverallAttendance !== undefined 
                      ? `${user.currentOverallAttendance.toFixed(2)}%` 
                      : 'Not set'}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Your current attendance from college records</p>
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Minimum Required Attendance (%)
                </Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.overallMinimumAttendance}
                    onChange={(e) => setFormData({ ...formData, overallMinimumAttendance: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="mt-2 text-gray-900">{user?.overallMinimumAttendance}%</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Minimum attendance required by college</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-6 border-t">
              <Button 
                onClick={handleSave} 
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={loading}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <h3 className="text-purple-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Current Semester</p>
              <p className="text-2xl text-purple-600">2026 Spring</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Current Attendance</p>
              <p className="text-2xl text-purple-600">
                {user?.currentOverallAttendance !== null && user?.currentOverallAttendance !== undefined
                  ? `${user.currentOverallAttendance.toFixed(1)}%`
                  : user?.overallAttendance?.toFixed(1) ? `${user.overallAttendance.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Days Since Semester Start</p>
              <p className="text-2xl text-purple-600">
                {user?.semesterStart
                  ? Math.floor((new Date().getTime() - new Date(user.semesterStart).getTime()) / (1000 * 60 * 60 * 24))
                  : 0}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Days Until Semester End</p>
              <p className="text-2xl text-purple-600">
                {user?.semesterEnd
                  ? Math.max(0, Math.floor((new Date(user.semesterEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
