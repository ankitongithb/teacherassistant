import { useState, useEffect } from 'react';
import API from '../api/axios';
import { CalendarCheck, Clock, BookOpen, CheckCircle2, XCircle, Download, Plus, Edit2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

export default function Attendance() {
  const [sessions, setSessions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [markingOpen, setMarkingOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  // Filters
  const [filterBatch, setFilterBatch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // Session form
  const [sessionForm, setSessionForm] = useState({ date: new Date().toISOString().split('T')[0], hours: 1, topic: '', subjectId: '', batchId: '' });
  const [records, setRecords] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get('/batches'),
      API.get('/teachers/subjects'),
    ]).then(([b, s]) => {
      setBatches(b.data);
      setSubjects(s.data);
    }).catch(() => {});
    fetchSessions();
  }, []);

  useEffect(() => { fetchSessions(); }, [filterBatch, filterSubject]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBatch) params.batchId = filterBatch;
      if (filterSubject) params.subjectId = filterSubject;
      const res = await API.get('/attendance/sessions', { params });
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openMarkAttendance = () => {
    setEditing(null);
    setSessionForm({ date: new Date().toISOString().split('T')[0], hours: 1, topic: '', subjectId: '', batchId: '' });
    setRecords([]);
    setModalOpen(true);
  };

  const openEditSession = async (session) => {
    setEditing(session);
    setSessionForm({
      date: session.date,
      hours: session.hours,
      topic: session.topic || '',
      subjectId: session.subjectId,
      batchId: session.batchId,
    });
    setRecords(session.records.map(r => ({ studentId: r.studentId, studentName: r.studentName, rollNumber: r.rollNumber, status: r.status })));
    setMarkingOpen(true);
  };

  const loadStudents = async () => {
    if (!sessionForm.batchId) { toast.error('Select a batch first'); return; }
    if (!sessionForm.subjectId) { toast.error('Select a subject first'); return; }
    try {
      const res = await API.get(`/students/batch/${sessionForm.batchId}`);
      const studentList = res.data.map(s => ({ studentId: s.id, studentName: s.name, rollNumber: s.rollNumber, status: 'PRESENT' }));
      setRecords(studentList);
      setModalOpen(false);
      setMarkingOpen(true);
    } catch (err) {
      toast.error('Failed to load students');
    }
  };

  const toggleStatus = (index) => {
    setRecords(prev => prev.map((r, i) => i === index ? { ...r, status: r.status === 'PRESENT' ? 'ABSENT' : 'PRESENT' } : r));
  };

  const markAllPresent = () => {
    setRecords(prev => prev.map(r => ({ ...r, status: 'PRESENT' })));
  };

  const handleSubmit = async () => {
    if (records.length === 0) { toast.error('No students to mark'); return; }
    setSaving(true);
    const payload = {
      ...sessionForm,
      records: records.map(r => ({ studentId: r.studentId, status: r.status })),
    };
    try {
      if (editing) {
        await API.put(`/attendance/sessions/${editing.id}`, payload);
        toast.success('Attendance updated');
      } else {
        await API.post('/attendance/sessions', payload);
        toast.success('Attendance marked!');
      }
      setMarkingOpen(false);
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const downloadReport = async () => {
    if (!filterBatch) { toast.error('Select a batch to download report'); return; }
    try {
      const params = { batchId: filterBatch };
      if (filterSubject) params.subjectId = filterSubject;
      const res = await API.get('/reports/attendance', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };

  const presentCount = records.filter(r => r.status === 'PRESENT').length;

  // Batch-specific subjects for filters
  const batchSubjects = filterBatch
    ? batches.find(b => String(b.id) === String(filterBatch))?.subjects || []
    : subjects;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Attendance</h1>
          <p className="text-dark-400 mt-1">Track and manage class attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download} onClick={downloadReport}>Export PDF</Button>
          <Button icon={Plus} onClick={openMarkAttendance}>Mark Attendance</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterBatch} onChange={(e) => { setFilterBatch(e.target.value); setFilterSubject(''); }}
          placeholder="All Batches" options={batches.map(b => ({ value: b.id, label: b.batchName }))} className="sm:w-48" />
        <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
          placeholder="All Subjects" options={batchSubjects.map(s => ({ value: s.id, label: `${s.subjectName} (${s.subjectCode})` }))} className="sm:w-64" />
      </div>

      {/* Session Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : sessions.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No attendance sessions" description="Start by marking attendance for your class." action={<Button icon={Plus} onClick={openMarkAttendance}>Mark Attendance</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <Card key={session.id} hover onClick={() => openEditSession(session)} className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-dark-800 dark:text-white">{formatDate(session.date)}</h3>
                    <Badge variant="info"><Clock className="w-3 h-3 mr-1" />{session.hours}h</Badge>
                  </div>
                  <p className="text-sm text-dark-400">{session.subjectName} <span className="font-mono text-xs">({session.subjectCode})</span></p>
                  {session.topic && <p className="text-xs text-dark-400 mt-1">Topic: {session.topic}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); openEditSession(session); }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-400">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-dark-700">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" /><span className="text-sm font-medium">{session.presentCount} Present</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <XCircle className="w-4 h-4" /><span className="text-sm font-medium">{session.absentCount} Absent</span>
                </div>
                <div className="ml-auto">
                  <Badge variant="gray">{session.batchName}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Step 1: Session Setup Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Setup Attendance Session">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} />
            <Input label="Number of Hours" type="number" min="1" max="8" value={sessionForm.hours} onChange={(e) => setSessionForm({ ...sessionForm, hours: parseInt(e.target.value) || 1 })} />
          </div>
          <Select label="Batch" value={sessionForm.batchId} onChange={(e) => setSessionForm({ ...sessionForm, batchId: e.target.value })}
            placeholder="Select batch" options={batches.map(b => ({ value: b.id, label: b.batchName }))} />
          <Select label="Subject" value={sessionForm.subjectId} onChange={(e) => setSessionForm({ ...sessionForm, subjectId: e.target.value })}
            placeholder="Select subject" options={subjects.map(s => ({ value: s.id, label: `${s.subjectName} (${s.subjectCode})` }))} />
          <Input label="Topic (Optional)" value={sessionForm.topic} onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} placeholder="e.g. Chapter 5 - Arrays" />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={loadStudents} className="flex-1">Load Students →</Button>
          </div>
        </div>
      </Modal>

      {/* Step 2: Mark Attendance Modal */}
      <Modal isOpen={markingOpen} onClose={() => setMarkingOpen(false)} title={editing ? 'Edit Attendance' : 'Mark Attendance'} size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Badge variant="success">{presentCount} Present</Badge>
              <Badge variant="danger">{records.length - presentCount} Absent</Badge>
            </div>
            <Button variant="secondary" onClick={markAllPresent} className="text-xs">Mark All Present</Button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {records.map((record, index) => (
              <div key={record.studentId}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  record.status === 'PRESENT'
                    ? 'border-green-200 bg-green-50/50 dark:border-green-800/30 dark:bg-green-900/10'
                    : 'border-red-200 bg-red-50/50 dark:border-red-800/30 dark:bg-red-900/10'
                }`}
                onClick={() => toggleStatus(index)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-dark-400 w-20">{record.rollNumber}</span>
                  <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{record.studentName}</span>
                </div>
                <button
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    record.status === 'PRESENT'
                      ? 'bg-green-500 text-white shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                  }`}
                >
                  {record.status === 'PRESENT' ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>
                    : <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Absent</span>}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setMarkingOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={saving} className="flex-1">{editing ? 'Update' : 'Submit'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
