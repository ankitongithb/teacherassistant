import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Building2, GraduationCap, Plus, X, Save, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ProfileSetup() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ collegeName: '', department: '', subjects: [] });
  const [newSubject, setNewSubject] = useState({ subjectName: '', subjectCode: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/teachers/profile');
      const p = res.data;
      setForm({
        collegeName: p.collegeName || '',
        department: p.department || '',
        subjects: p.subjects || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const addSubject = () => {
    if (!newSubject.subjectName || !newSubject.subjectCode) {
      toast.error('Both subject name and code are required');
      return;
    }
    if (form.subjects.some(s => s.subjectCode === newSubject.subjectCode)) {
      toast.error('Subject code already added');
      return;
    }
    setForm({ ...form, subjects: [{ ...newSubject }, ...form.subjects] });
    setNewSubject({ subjectName: '', subjectCode: '' });
  };

  const removeSubject = (index) => {
    setForm({ ...form, subjects: form.subjects.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.collegeName || !form.department) {
      toast.error('Please fill in college name and department');
      return;
    }
    if (form.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }
    setLoading(true);
    try {
      const res = await API.put('/teachers/profile', form);
      updateUser({ profileCompleted: true });
      toast.success('Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-950">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Complete Your Profile</h1>
          <p className="text-dark-400 mt-1">Set up your teaching profile to get started</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="College Name"
                icon={Building2}
                value={form.collegeName}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                placeholder="Enter college name"
                required
              />
              <Input
                label="Department"
                icon={GraduationCap}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-3">
                Subjects <span className="text-dark-400 font-normal">({form.subjects.length} added)</span>
              </label>

              {/* Subject list */}
              <div className="space-y-2 mb-4">
                {form.subjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 animate-scale-in">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{subject.subjectName}</span>
                      <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                        {subject.subjectCode}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeSubject(index)} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subject */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newSubject.subjectName}
                  onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                  className="input-base flex-1 w-full"
                  placeholder="Subject name"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubject.subjectCode}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value.toUpperCase() })}
                    className="input-base w-full sm:w-32"
                    placeholder="Code"
                  />
                  <button
                    type="button"
                    onClick={addSubject}
                    className="btn-secondary flex items-center justify-center gap-1 whitespace-nowrap min-w-[80px]"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" loading={loading} icon={Save} className="w-full">
              Save & Continue
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
