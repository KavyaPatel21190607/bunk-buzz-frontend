import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
import { bunkPredictorAPI } from '@/services/api';
import { toast } from 'sonner';

export default function BunkPredictor() {
  const { subjects } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    
    setLoading(true);
    try {
      const response = await bunkPredictorAPI.predict(selectedSubject);
      if (response.success) {
        setPrediction(response.data.prediction);
        toast.success('Prediction calculated successfully!');
      }
    } catch (error: any) {
      console.error('Prediction failed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to predict. Please try again.';
      toast.error(errorMsg);
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Bunk Predictor</h1>
        <p className="text-gray-600 mt-1">Check if you can skip a lecture safely</p>
      </div>

      {/* Prediction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Predict Attendance Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No subjects found. Please add subjects first.</p>
              <Button
                onClick={() => window.location.href = '/subjects'}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Add Subjects
              </Button>
            </div>
          ) : (
            <>
              <div>
                <Label>Select Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id || subject.id} value={(subject._id || subject.id)!}>
                        {subject.name} ({((subject.attendedLectures / subject.totalLectures) * 100).toFixed(1)}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handlePredict}
                disabled={!selectedSubject || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {loading ? 'Calculating...' : 'Calculate Prediction'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Prediction Result */}
      {prediction && (
        <Card className={prediction.canBunk ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6 space-y-6">
            {/* Result Header */}
            <div className="flex items-start gap-3">
              {prediction.canBunk ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`text-xl mb-2 ${prediction.canBunk ? 'text-green-900' : 'text-red-900'}`}>
                  {prediction.canBunk ? 'You can bunk this lecture ✅' : 'You should NOT bunk this lecture ❌'}
                </h3>
                <p className={prediction.canBunk ? 'text-green-700' : 'text-red-700'}>
                  {prediction.recommendation}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Current Attendance</p>
                <p className="text-2xl text-gray-900">{prediction.currentAttendance?.toFixed(1)}%</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">After Bunking</p>
                <p className={`text-2xl ${prediction.canBunk ? 'text-green-600' : 'text-red-600'}`}>
                  {prediction.afterBunkAttendance?.toFixed(1)}%
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Safe Bunks Left</p>
                <p className="text-2xl text-blue-600">{prediction.safeBunks || 0}</p>
              </div>
            </div>

            {/* Risk Level Indicator */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Risk Level</span>
                <span className="text-sm text-gray-600">Minimum: {prediction.minimumRequired}%</span>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full transition-all ${
                    prediction.canBunk ? 'bg-green-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${Math.min((prediction.afterBunkAttendance || 0), 100)}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-yellow-500"
                  style={{ left: `${prediction.minimumRequired}%` }}
                />
              </div>
            </div>

            {/* Additional Info */}
            {prediction.classesNeededToRecover > 0 && (
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-sm text-gray-700">
                  ⚠️ If you bunk, you'll need to attend <strong>{prediction.classesNeededToRecover} consecutive classes</strong> to recover to {prediction.minimumRequired}% attendance.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Select a subject to see the impact of bunking one lecture</li>
            <li>The predictor calculates your attendance percentage after bunking</li>
            <li>Green means it's safe, red means you'll fall below the minimum requirement</li>
            <li>Use this to make informed decisions about attending classes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
