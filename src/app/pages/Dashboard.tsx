import { useApp } from '@/app/context/AppContext';
import CircularProgress from '@/app/components/CircularProgress';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Calendar, BookOpen, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user, subjects, attendanceRecords } = useApp();

  // Calculate overall stats
  const totalSubjects = subjects.length;
  const calculatedAvgAttendance = totalSubjects > 0
    ? subjects.reduce((sum, sub) => {
        const percentage = sub.totalLectures > 0 ? (sub.attendedLectures / sub.totalLectures) * 100 : 0;
        return sum + percentage;
      }, 0) / totalSubjects
    : 0;
  
  // Use user's current overall attendance if set, otherwise use calculated
  const avgAttendance = (user?.currentOverallAttendance !== null && user?.currentOverallAttendance !== undefined) 
    ? user.currentOverallAttendance 
    : calculatedAvgAttendance;

  // Calculate safe bunk count
  const calculateSafeBunks = (subject: any) => {
    const currentPercentage = (subject.attendedLectures / subject.totalLectures) * 100;
    if (currentPercentage <= subject.minimumAttendance) return 0;
    
    let bunks = 0;
    let attended = subject.attendedLectures;
    let total = subject.totalLectures;
    
    while (((attended / (total + 1)) * 100) >= subject.minimumAttendance) {
      bunks++;
      total++;
    }
    
    return bunks;
  };

  const totalSafeBunks = subjects.reduce((sum, sub) => sum + calculateSafeBunks(sub), 0);

  // Get today's attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceRecords.filter((r) => r.date === today);
  const todayPresent = todayAttendance.filter((r) => r.status === 'present').length;

  // Attendance status
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 75) return { label: 'Safe', color: 'bg-green-500', icon: CheckCircle };
    if (percentage >= 60) return { label: 'Risk', color: 'bg-yellow-500', icon: AlertTriangle };
    return { label: 'Danger', color: 'bg-red-500', icon: AlertTriangle };
  };

  const status = getAttendanceStatus(avgAttendance);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-600 mt-1">Here's your attendance overview</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Attendance */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <CircularProgress percentage={avgAttendance} />
            {user?.currentOverallAttendance !== null && user?.currentOverallAttendance !== undefined && (
              <p className="text-xs text-gray-500 mt-2">From college records</p>
            )}
          </CardContent>
        </Card>

        {/* Today's Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl mb-2">{todayPresent}/{todayAttendance.length}</div>
              <p className="text-sm text-gray-600">Classes Attended</p>
              <Badge className={`mt-3 ${status.color}`}>{status.label}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Subjects */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Total Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl text-purple-600 mb-2">{totalSubjects}</div>
              <p className="text-sm text-gray-600">Subjects this semester</p>
            </div>
          </CardContent>
        </Card>

        {/* Safe Bunks */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Safe Bunk Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl text-green-600 mb-2">{totalSafeBunks}</div>
              <p className="text-sm text-gray-600">Lectures you can skip</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semester Information */}
      {(user?.semesterStart || user?.semesterEnd) && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Semester Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.semesterStart && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Semester Start</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {new Date(user.semesterStart).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.floor((new Date().getTime() - new Date(user.semesterStart).getTime()) / (1000 * 60 * 60 * 24))} days ago
                  </p>
                </div>
              )}
              {user?.semesterEnd && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Semester End</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {new Date(user.semesterEnd).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.max(0, Math.floor((new Date(user.semesterEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                  </p>
                </div>
              )}
              {user?.semesterStart && user?.semesterEnd && (
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Semester Progress</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {(() => {
                      const total = new Date(user.semesterEnd).getTime() - new Date(user.semesterStart).getTime();
                      const elapsed = new Date().getTime() - new Date(user.semesterStart).getTime();
                      const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
                      return `${progress.toFixed(1)}%`;
                    })()}
                  </p>
                  <Progress 
                    value={(() => {
                      const total = new Date(user.semesterEnd).getTime() - new Date(user.semesterStart).getTime();
                      const elapsed = new Date().getTime() - new Date(user.semesterStart).getTime();
                      return Math.min(100, Math.max(0, (elapsed / total) * 100));
                    })()} 
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject-wise Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjects.map((subject) => {
              const percentage = (subject.attendedLectures / subject.totalLectures) * 100;
              const safeBunks = calculateSafeBunks(subject);
              const subjectStatus = getAttendanceStatus(percentage);

              return (
                <div
                  key={subject._id || subject.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                  style={{ borderLeft: `4px solid ${subject.color}` }}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-gray-900">{subject.name}</h3>
                      <Badge variant="outline" className={`${subjectStatus.color} text-white border-none`}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>
                        {subject.attendedLectures}/{subject.totalLectures} lectures
                      </span>
                      <span className="text-green-600">Safe Bunks: {safeBunks}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}

            {subjects.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No subjects added yet</p>
                <p className="text-sm">Add your subjects to start tracking attendance</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Warning */}
      {avgAttendance < 75 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-red-900 mb-1">Attendance Warning</h3>
                <p className="text-sm text-red-700">
                  Your overall attendance is below 75%. Attend more classes to improve your attendance percentage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
