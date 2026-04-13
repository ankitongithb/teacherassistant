import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SearchBar from '../components/shared/SearchBar';
import Pagination from '../components/shared/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState({ name: '', rollNumber: '', email: '', batchId: '' });

  useEffect(() => {
    API.get('/batches').then(res => setBatches(res.data)).catch(() => {});
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (filterBatch) params.batchId = filterBatch;
      if (search) params.search = search;

      const res = await API.get('/students', { params });
      setStudents(res.data.students || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [page, filterBatch, search]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', rollNumber: '', email: '', batchId: batches[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (student) => {
    setEditing(student);
    setForm({ name: student.name, rollNumber: student.rollNumber, email: student.email || '', batchId: student.batchId });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber || !form.batchId) {
      toast.error('Name, roll number, and batch are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await API.put(`/students/${editing.id}`, { ...form, batchId: Number(form.batchId) });
        toast.success('Student updated');
      } else {
        await API.post('/students', { ...form, batchId: Number(form.batchId) });
        toast.success('Student added');
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await API.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
          {row.name?.charAt(0)}
        </div>
        <span className="font-medium">{row.name}</span>
      </div>
    )},
    { header: 'Roll No.', accessor: 'rollNumber', render: (row) => (
      <span className="font-mono text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-md">{row.rollNumber}</span>
    )},
    { header: 'Email', accessor: 'email', render: (row) => row.email || <span className="text-dark-400">—</span> },
    { header: 'Batch', accessor: 'batchName', render: (row) => <Badge variant="info">{row.batchName}</Badge> },
    { header: 'Attendance', render: (row) => {
      if (row.attendancePercentage == null) return <span className="text-dark-400 text-xs">N/A</span>;
      const pct = row.attendancePercentage;
      const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-dark-600 overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-medium">{pct}%</span>
        </div>
      );
    }},
    { header: '', render: (row) => (
      <div className="flex gap-1 justify-end">
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-600 transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-dark-400 hover:text-red-600 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Students</h1>
          <p className="text-dark-400 mt-1">Manage students across all batches</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Student</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or roll number..." className="flex-1" />
        <Select
          value={filterBatch}
          onChange={(e) => { setFilterBatch(e.target.value); setPage(0); }}
          placeholder="All Batches"
          options={batches.map(b => ({ value: b.id, label: b.batchName }))}
          className="sm:w-48"
        />
      </div>

      {/* Table */}
      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description={search ? 'Try a different search term' : 'Add your first student to get started'}
            action={!search && <Button icon={Plus} onClick={openCreate}>Add Student</Button>}
          />
        ) : (
          <Table columns={columns} data={students} />
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Student name" required />
          <Input label="Roll Number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="e.g. CS2024001" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@email.com" />
          <Select
            label="Batch"
            value={form.batchId}
            onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            options={batches.map(b => ({ value: b.id, label: b.batchName }))}
            placeholder="Select batch"
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
