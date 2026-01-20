import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

export default function Timetable() {
  const { subjects, timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    day: '',
    subjectId: '',
    startTime: '',
    endTime: '',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find((s) => (s._id || s.id) === formData.subjectId);
    if (!subject) return;

    const data = {
      day: formData.day,
      subjectId: formData.subjectId,
      subjectName: subject.name,
      startTime: formData.startTime,
      endTime: formData.endTime,
    };

    try {
      if (editingEntry) {
        await updateTimetableEntry(editingEntry._id || editingEntry.id, data);
      } else {
        await addTimetableEntry(data);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled by the context
    }
  };

  const resetForm = () => {
    setFormData({ day: '', subjectId: '', startTime: '', endTime: '' });
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this entry?')) {
      try {
        await deleteTimetableEntry(id);
      } catch (error) {
        // Error is already handled by the context
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Timetable</h1>
          <p className="text-gray-600 mt-1">Manage your weekly schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit' : 'Add'} Timetable Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Day</Label>
                <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id || subject.id} value={(subject._id || subject.id)!}>{subject.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full">{editingEntry ? 'Update' : 'Add'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {timetable.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const dayEntries = timetable.filter((e) => e.day === day);
            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dayEntries.length > 0 ? (
                    <div className="space-y-2">
                      {dayEntries.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((entry) => (
                        <div key={entry._id || entry.id} className="p-3 rounded-lg bg-gray-50 border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{entry.subjectName}</p>
                              <p className="text-xs text-gray-600">{entry.startTime} - {entry.endTime}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setEditingEntry(entry); setFormData({ day: entry.day, subjectId: entry.subjectId, startTime: entry.startTime, endTime: entry.endTime }); setIsDialogOpen(true); }}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete((entry._id || entry.id)!)} className="text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No classes</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl text-gray-900 mb-2">No Timetable Entries</h3>
            <p className="text-gray-600 mb-6">Start by adding your first class</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Class
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
