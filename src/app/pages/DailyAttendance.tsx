import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { Calendar } from '@/app/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { format } from 'date-fns';
import { toast } from '@/app/components/ui/use-toast';

export default function DailyAttendance() {
  const { timetable, attendanceRecords, markAttendance } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);

  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const dayName = format(selectedDate, 'EEEE');
  
  // Get classes for selected day
  const classesForDay = timetable.filter((entry) => entry.day === dayName);
  
  // Get attendance records for selected date
  const attendanceForDate = attendanceRecords.filter((record) => record.date === dateString);

  const getAttendanceStatus = (subjectId: string) => {
    const record = attendanceForDate.find((r) => r.subjectId === subjectId);
    return record?.status;
  };

  const handleMarkAttendance = async (subjectId: string, subjectName: string, status: 'present' | 'absent') => {
    try {
      setMarkingAttendance(subjectId);
      await markAttendance({
        date: dateString,
        subjectId,
        subjectName,
        status,
      });
      
      // Show success toast
      toast({
        title: status === 'present' ? '✓ Marked Present' : '✗ Marked Absent',
        description: `${subjectName}`,
        variant: status === 'present' ? 'default' : 'destructive',
      });
      
      setTimeout(() => setMarkingAttendance(null), 300);
    } catch (error) {
      setMarkingAttendance(null);
      // Error is already handled by the context
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900">Daily Attendance</h1>
        <p className="text-gray-600 mt-1">Mark your attendance for each class</p>
      </div>

      {/* Date Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')} ({dayName})
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Classes for the day */}
      <Card>
        <CardHeader>
          <CardTitle>Classes on {dayName}</CardTitle>
        </CardHeader>
        <CardContent>
          {classesForDay.length > 0 ? (
            <div className="space-y-3">
              {classesForDay.map((classEntry) => {
                const status = getAttendanceStatus(classEntry.subjectId);
                const isMarking = markingAttendance === classEntry.subjectId;
                return (
                  <div
                    key={classEntry._id || classEntry.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                      status === 'present' 
                        ? 'bg-green-50 border-green-300 shadow-sm' 
                        : status === 'absent' 
                        ? 'bg-red-50 border-red-300 shadow-sm' 
                        : 'hover:shadow-md bg-white'
                    } ${isMarking ? 'scale-[0.98]' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`mb-1 font-medium ${
                          status === 'present' 
                            ? 'text-green-900' 
                            : status === 'absent' 
                            ? 'text-red-900' 
                            : 'text-gray-900'
                        }`}>
                          {classEntry.subjectName}
                        </h3>
                        {status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            status === 'present' 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-red-200 text-red-800'
                          }`}>
                            {status === 'present' ? 'Marked Present' : 'Marked Absent'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {classEntry.startTime} - {classEntry.endTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={status === 'present' ? 'default' : 'outline'}
                        disabled={isMarking}
                        className={`transition-all duration-300 ${
                          status === 'present'
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                            : 'hover:bg-green-50 hover:text-green-600 hover:border-green-600'
                        }`}
                        onClick={() => handleMarkAttendance(classEntry.subjectId, classEntry.subjectName, 'present')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={status === 'absent' ? 'default' : 'outline'}
                        disabled={isMarking}
                        className={`transition-all duration-300 ${
                          status === 'absent'
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                            : 'hover:bg-red-50 hover:text-red-600 hover:border-red-600'
                        }`}
                        onClick={() => handleMarkAttendance(classEntry.subjectId, classEntry.subjectName, 'absent')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Absent
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No classes scheduled for {dayName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {attendanceForDate.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <h3 className="text-purple-900 mb-2">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-purple-700">Present</p>
                <p className="text-2xl text-green-600">
                  {attendanceForDate.filter((r) => r.status === 'present').length}
                </p>
              </div>
              <div>
                <p className="text-purple-700">Absent</p>
                <p className="text-2xl text-red-600">
                  {attendanceForDate.filter((r) => r.status === 'absent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
