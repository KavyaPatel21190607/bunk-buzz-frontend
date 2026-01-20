import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

export default function Subjects() {
  const { subjects, addSubject, updateSubject, deleteSubject } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    totalLectures: '',
    attendedLectures: '',
    minimumAttendance: '75',
    color: '#8B5CF6',
  });

  const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      name: formData.name,
      totalLectures: parseInt(formData.totalLectures),
      attendedLectures: parseInt(formData.attendedLectures),
      minimumAttendance: parseInt(formData.minimumAttendance),
      color: formData.color,
    };

    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id || editingSubject.id, data);
      } else {
        await addSubject(data);
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      // Error is already handled by the context
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      totalLectures: '',
      attendedLectures: '',
      minimumAttendance: '75',
      color: '#8B5CF6',
    });
    setEditingSubject(null);
  };

  const handleEdit = (subject: any) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      totalLectures: subject.totalLectures.toString(),
      attendedLectures: subject.attendedLectures.toString(),
      minimumAttendance: subject.minimumAttendance.toString(),
      color: subject.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      try {
        await deleteSubject(id);
      } catch (error) {
        // Error is already handled by the context
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900">Subject Management</h1>
          <p className="text-gray-600 mt-1">Add and manage your subjects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              onClick={resetForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total">Total Lectures</Label>
                  <Input
                    id="total"
                    type="number"
                    min="0"
                    value={formData.totalLectures}
                    onChange={(e) => setFormData({ ...formData, totalLectures: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="attended">Attended</Label>
                  <Input
                    id="attended"
                    type="number"
                    min="0"
                    value={formData.attendedLectures}
                    onChange={(e) => setFormData({ ...formData, attendedLectures: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="minimum">Minimum Attendance (%)</Label>
                <Input
                  id="minimum"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.minimumAttendance}
                  onChange={(e) => setFormData({ ...formData, minimumAttendance: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Subject Color</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingSubject ? 'Update' : 'Add'} Subject
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const percentage = (subject.attendedLectures / subject.totalLectures) * 100;
            return (
              <Card key={subject._id || subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader
                  className="pb-3"
                  style={{ borderTop: `4px solid ${subject.color}` }}
                >
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{subject.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(subject)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete((subject._id || subject.id)!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Attendance</span>
                    <span
                      className="text-lg"
                      style={{ color: percentage >= subject.minimumAttendance ? '#10B981' : '#EF4444' }}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Attended</p>
                      <p className="text-xl font-semibold text-green-600">{subject.attendedLectures}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Absent</p>
                      <p className="text-xl font-semibold text-red-600">
                        {subject.absentLectures ?? (subject.totalLectures - subject.attendedLectures)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="text-xl font-semibold text-gray-900">{subject.totalLectures}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t text-sm text-gray-600">
                    Minimum: {subject.minimumAttendance}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl text-gray-900 mb-2">No Subjects Added</h3>
            <p className="text-gray-600 mb-6">Start by adding your first subject</p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
