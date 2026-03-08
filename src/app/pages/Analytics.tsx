import { useState, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Button } from '@/app/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen,
  Calendar,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { attendanceAPI } from '@/services/api';
import { toast } from 'sonner';
import CircularProgress from '@/app/components/CircularProgress';

interface AnalyticsData {
  overall: {
    currentAttendance: number;
    targetAttendance: number;
    totalLectures: number;
    totalAttended: number;
    totalAbsent: number;
    subjectsAboveMin: number;
    subjectsBelowMin: number;
    totalSubjects: number;
    status: 'safe' | 'risk';
  };
  predictions: {
    classesNeededToReachTarget: number;
    safeBunksAvailable: number;
    projectedAfter5Classes: number;
    projectedAfter10Classes: number;
    estimatedDaysToTarget: number;
  };
  recentActivity: {
    last7Days: {
      present: number;
      absent: number;
      total: number;
      percentage: string;
      trend: string;
      trendDirection: 'improving' | 'declining' | 'stable';
    };
  };
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    attendance: number;
    totalLectures: number;
    attendedLectures: number;
    minimumRequired: number;
    safeBunks: number;
    classesNeeded: number;
    status: 'safe' | 'risk';
  }>;
  recommendations: Array<{
    type: 'success' | 'warning' | 'action';
    message: string;
    priority: 'high' | 'medium' | 'low';
    subjects?: string[];
  }>;
}

export default function Analytics() {
  const { user } = useApp();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getStats();
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
        <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
      </div>
    );
  }

  const { overall, predictions, recentActivity, subjects, recommendations } = analyticsData;

  // Use user's manually set attendance if available (from college records)
  const displayAttendance = user?.currentOverallAttendance ?? overall.currentAttendance;
  const isFromCollegeRecords = user?.currentOverallAttendance !== null && user?.currentOverallAttendance !== undefined;

  const getTrendIcon = () => {
    if (recentActivity.last7Days.trendDirection === 'improving') {
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    } else if (recentActivity.last7Days.trendDirection === 'declining') {
      return <TrendingDown className="w-5 h-5 text-red-600" />;
    }
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Attendance Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and predictions</p>
        </div>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Attendance */}
        <Card className={displayAttendance >= overall.targetAttendance ? 'border-green-200' : 'border-red-200'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Current Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <CircularProgress percentage={displayAttendance} />
            {isFromCollegeRecords && (
              <p className="text-xs text-gray-500 mt-2">From college records</p>
            )}
            {!isFromCollegeRecords && overall.currentAttendance !== displayAttendance && (
              <p className="text-xs text-gray-500 mt-2">Calculated: {overall.currentAttendance}%</p>
            )}
            <Badge className={`mt-3 ${displayAttendance >= overall.targetAttendance ? 'bg-green-500' : 'bg-red-500'}`}>
              {displayAttendance >= overall.targetAttendance ? 'On Track' : 'Below Target'}
            </Badge>
          </CardContent>
        </Card>

        {/* Classes Needed */}
        <Card className={predictions.classesNeededToReachTarget > 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {predictions.classesNeededToReachTarget > 0 ? 'Classes Needed' : 'Above Target'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {predictions.classesNeededToReachTarget}
              </div>
              <p className="text-sm text-gray-600">
                {predictions.classesNeededToReachTarget > 0 
                  ? `to reach ${overall.targetAttendance}%`
                  : `Target achieved! ✨`
                }
              </p>
              {predictions.estimatedDaysToTarget > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  ~{predictions.estimatedDaysToTarget} days
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Safe Bunks */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Safe Bunks Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {predictions.safeBunksAvailable}
              </div>
              <p className="text-sm text-gray-600">
                lectures you can skip
              </p>
              <p className="text-xs text-gray-500 mt-2">
                while staying ≥{overall.targetAttendance}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTrendIcon()}
                <span className="text-3xl font-bold">
                  {recentActivity.last7Days.percentage}%
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {recentActivity.last7Days.present}/{recentActivity.last7Days.total} classes
              </p>
              <Badge 
                className={`mt-2 ${
                  recentActivity.last7Days.trendDirection === 'improving' 
                    ? 'bg-green-500' 
                    : recentActivity.last7Days.trendDirection === 'declining'
                    ? 'bg-red-500'
                    : 'bg-gray-500'
                }`}
              >
                {recentActivity.last7Days.trend}% trend
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-4 rounded-lg bg-white border ${
                    rec.type === 'success' 
                      ? 'border-green-200' 
                      : rec.type === 'warning'
                      ? 'border-yellow-200'
                      : 'border-blue-200'
                  }`}
                >
                  {rec.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      rec.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`} />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{rec.message}</p>
                    {rec.priority === 'high' && (
                      <Badge variant="destructive" className="mt-2">High Priority</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Attendance Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">After attending next 5 classes</span>
                <span className="text-lg font-semibold text-blue-600">
                  {predictions.projectedAfter5Classes}%
                </span>
              </div>
              <Progress 
                value={predictions.projectedAfter5Classes} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">After attending next 10 classes</span>
                <span className="text-lg font-semibold text-green-600">
                  {predictions.projectedAfter10Classes}%
                </span>
              </div>
              <Progress 
                value={predictions.projectedAfter10Classes} 
                className="h-2"
              />
            </div>
            <div className="pt-2 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Current</p>
                  <p className="text-lg font-semibold">{displayAttendance.toFixed(2)}%</p>
                  {isFromCollegeRecords && (
                    <p className="text-xs text-gray-400 mt-1">(College records)</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Target</p>
                  <p className="text-lg font-semibold text-purple-600">{overall.targetAttendance}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gap</p>
                  <p className={`text-lg font-semibold ${
                    displayAttendance >= overall.targetAttendance ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(displayAttendance - overall.targetAttendance).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subject-wise Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                className={`p-4 rounded-lg border ${
                  subject.status === 'safe' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{subject.name}</h4>
                    {subject.code && (
                      <p className="text-xs text-gray-500">{subject.code}</p>
                    )}
                  </div>
                  <Badge className={subject.status === 'safe' ? 'bg-green-500' : 'bg-red-500'}>
                    {subject.attendance.toFixed(1)}%
                  </Badge>
                </div>
                
                <Progress value={subject.attendance} className="h-2 mb-3" />
                
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="text-gray-500">Attended</p>
                    <p className="font-semibold">{subject.attendedLectures}/{subject.totalLectures}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Min Required</p>
                    <p className="font-semibold">{subject.minimumRequired}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Safe Bunks</p>
                    <p className="font-semibold text-blue-600">{subject.safeBunks}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Classes Needed</p>
                    <p className="font-semibold text-orange-600">{subject.classesNeeded}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
