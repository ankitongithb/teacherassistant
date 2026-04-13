import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ batchName: '', subjectIds: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [batchRes, subjectRes] = await Promise.all([
        API.get('/batches'),
        API.get('/teachers/subjects'),
      ]);
      setBatches(batchRes.data);
      setSubjects(subjectRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ batchName: '', subjectIds: [] });
    setModalOpen(true);
  };

  const openEdit = (batch) => {
    setEditing(batch);
    setForm({ batchName: batch.batchName, subjectIds: batch.subjects.map(s => s.id) });
    setModalOpen(true);
  };

  const toggleSubject = (id) => {
    setForm(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(id)
        ? prev.subjectIds.filter(s => s !== id)
        : [...prev.subjectIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.batchName.trim()) { toast.error('Batch name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/batches/${editing.id}`, form);
        toast.success('Batch updated');
      } else {
        await API.post('/batches', form);
        toast.success('Batch created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save batch');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      await API.delete(`/batches/${id}`);
      toast.success('Batch deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete batch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Batches</h1>
          <p className="text-dark-400 mt-1">Manage your class batches and assign subjects</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>New Batch</Button>
      </div>

      {/* Batch Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : batches.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No batches yet"
          description="Create your first batch to start managing students."
          action={<Button icon={Plus} onClick={openCreate}>Create Batch</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((batch) => (
            <Card key={batch.id} hover className="animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-800 dark:text-white">{batch.batchName}</h3>
                    <p className="text-xs text-dark-400">{batch.studentCount} students</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(batch)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(batch.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-dark-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1.5">
                {batch.subjects?.map((s) => (
                  <Badge key={s.id} variant="primary">
                    <BookOpen className="w-3 h-3 mr-1" />{s.subjectCode}
                  </Badge>
                ))}
                {(!batch.subjects || batch.subjects.length === 0) && (
                  <span className="text-xs text-dark-400">No subjects assigned</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Batch' : 'Create Batch'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Batch Name"
            value={form.batchName}
            onChange={(e) => setForm({ ...form, batchName: e.target.value })}
            placeholder="e.g. CSE 2024 - Section A"
            required
          />

          <div>
            <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
              Assign Subjects
            </label>
            {subjects.length === 0 ? (
              <p className="text-sm text-dark-400">No subjects available. Add subjects in Profile Settings first.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {subjects.map((subject) => (
                  <label
                    key={subject.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      form.subjectIds.includes(subject.id)
                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                        : 'border-gray-200 dark:border-dark-600 hover:border-primary-200 dark:hover:border-primary-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.subjectIds.includes(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{subject.subjectName}</p>
                      <p className="text-xs text-dark-400 font-mono">{subject.subjectCode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
