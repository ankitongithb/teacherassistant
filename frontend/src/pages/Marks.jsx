import { useState, useEffect } from 'react';
import API from '../api/axios';
import { ClipboardList, Plus, Download, Trophy, Edit2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { getPercentageColor, getPercentageBg } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Marks() {
  const [marks, setMarks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');

  // Form
  const [form, setForm] = useState({ subjectId: '', examName: '', examType: 'INTERNAL', totalMarks: 100, batchId: '' });
  const [studentMarks, setStudentMarks] = useState([]);

  // Inline edit
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    Promise.all([
      API.get('/batches'),
      API.get('/teachers/subjects'),
    ]).then(([b, s]) => {
      setBatches(b.data);
      setSubjects(s.data);
    }).catch(() => {});
    fetchMarks();
  }, []);

  useEffect(() => { fetchMarks(); }, [filterSubject, filterExamType]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterSubject) params.subjectId = filterSubject;
      if (filterExamType) params.examType = filterExamType;
      const res = await API.get('/marks', { params });
      setMarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ subjectId: '', examName: '', examType: 'INTERNAL', totalMarks: 100, batchId: '' });
    setStudentMarks([]);
    setModalOpen(true);
  };

  const loadStudentsForMarks = async () => {
    if (!form.batchId) { toast.error('Select a batch'); return; }
    try {
      const res = await API.get(`/students/batch/${form.batchId}`);
      setStudentMarks(res.data.map(s => ({ studentId: s.id, studentName: s.name, rollNumber: s.rollNumber, marksObtained: 0 })));
    } catch (err) {
      toast.error('Failed to load students');
    }
  };

  const handleSubmit = async () => {
    if (!form.subjectId || !form.examName || studentMarks.length === 0) {
      toast.error('Please fill all fields and load students');
      return;
    }
    setSaving(true);
    try {
      await API.post('/marks', {
        subjectId: Number(form.subjectId),
        examName: form.examName,
        examType: form.examType,
        totalMarks: Number(form.totalMarks),
        studentMarks: studentMarks.map(s => ({ studentId: s.studentId, marksObtained: Number(s.marksObtained) })),
      });
      toast.success('Marks added!');
      setModalOpen(false);
      fetchMarks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleInlineEdit = async (id) => {
    try {
      await API.put(`/marks/${id}`, { marksObtained: Number(editValue) });
      toast.success('Marks updated');
      setEditingId(null);
      fetchMarks();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const downloadReport = async () => {
    try {
      const params = {};
      if (filterSubject) params.subjectId = filterSubject;
      if (filterExamType) params.examType = filterExamType;
      const res = await API.get('/reports/marks', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'marks_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
    }
  };

  const examTypes = [
    { value: 'INTERNAL', label: 'Internal' },
    { value: 'MID', label: 'Mid Term' },
    { value: 'FINAL', label: 'Final' },
  ];

  const avgPercentage = marks.length > 0
    ? Math.round(marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length * 100) / 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Marks</h1>
          <p className="text-dark-400 mt-1">Manage exam marks and view performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download} onClick={downloadReport}>Export PDF</Button>
          <Button icon={Plus} onClick={openCreate}>Add Marks</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
          placeholder="All Subjects" options={subjects.map(s => ({ value: s.id, label: `${s.subjectName} (${s.subjectCode})` }))} className="sm:w-64" />
        <Select value={filterExamType} onChange={(e) => setFilterExamType(e.target.value)}
          placeholder="All Exam Types" options={examTypes} className="sm:w-48" />
        {marks.length > 0 && (
          <div className="flex items-center gap-2 ml-auto px-4 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20">
            <span className="text-sm text-dark-500 dark:text-dark-400">Class Average:</span>
            <span className={`text-sm font-bold ${getPercentageColor(avgPercentage)}`}>{avgPercentage}%</span>
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} cols={6} /></div>
        ) : marks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No marks recorded" description="Add marks for your students to track performance."
            action={<Button icon={Plus} onClick={openCreate}>Add Marks</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-800/50">
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Student</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Exam</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Marks</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Progress</th>
                  <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {marks.map((m) => (
                  <tr key={m.id} className="bg-white dark:bg-dark-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors">
                    <td className="px-4 py-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                        m.rank === 1 ? 'bg-yellow-500' : m.rank === 2 ? 'bg-gray-400' : m.rank === 3 ? 'bg-orange-500' : 'bg-primary-300'
                      }`}>
                        {m.rank <= 3 ? <Trophy className="w-3.5 h-3.5" /> : m.rank}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-dark-700 dark:text-dark-200">{m.studentName}</p>
                        <p className="text-xs text-dark-400 font-mono">{m.rollNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{m.subjectCode}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-dark-700 dark:text-dark-200">{m.examName}</p>
                      <Badge variant={m.examType === 'FINAL' ? 'danger' : m.examType === 'MID' ? 'warning' : 'info'} className="mt-1">{m.examType}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === m.id ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            className="w-16 px-2 py-1 text-sm rounded-lg border border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-dark-700"
                            onKeyDown={(e) => e.key === 'Enter' && handleInlineEdit(m.id)} autoFocus />
                          <span className="text-dark-400">/{m.totalMarks}</span>
                        </div>
                      ) : (
                        <span className={`font-bold ${m.percentage < 40 ? 'text-red-600 dark:text-red-400' : 'text-dark-700 dark:text-dark-200'}`}>
                          {m.marksObtained}<span className="font-normal text-dark-400">/{m.totalMarks}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-dark-600 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${getPercentageBg(m.percentage)}`}
                            style={{ width: `${m.percentage}%` }} />
                        </div>
                        <span className={`text-xs font-bold w-12 ${getPercentageColor(m.percentage)}`}>{m.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditingId(m.id); setEditValue(m.marksObtained); }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-dark-400 hover:text-primary-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Marks Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Marks" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Batch" value={form.batchId} onChange={(e) => setForm({ ...form, batchId: e.target.value })}
              placeholder="Select batch" options={batches.map(b => ({ value: b.id, label: b.batchName }))} />
            <Select label="Subject" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              placeholder="Select subject" options={subjects.map(s => ({ value: s.id, label: `${s.subjectName} (${s.subjectCode})` }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Exam Name" value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} placeholder="e.g. Unit Test 1" />
            <Select label="Exam Type" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}
              options={examTypes} />
            <Input label="Total Marks" type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
          </div>

          {studentMarks.length === 0 ? (
            <Button variant="secondary" onClick={loadStudentsForMarks} className="w-full">Load Students</Button>
          ) : (
            <div className="max-h-[40vh] overflow-y-auto space-y-2">
              {studentMarks.map((s, i) => (
                <div key={s.studentId} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-dark-400 w-20">{s.rollNumber}</span>
                    <span className="text-sm font-medium text-dark-700 dark:text-dark-200">{s.studentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" min="0" max={form.totalMarks}
                      value={s.marksObtained}
                      onChange={(e) => {
                        const updated = [...studentMarks];
                        updated[i].marksObtained = e.target.value;
                        setStudentMarks(updated);
                      }}
                      className="w-20 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-dark-600 dark:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-center"
                    />
                    <span className="text-sm text-dark-400">/{form.totalMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} loading={saving} className="flex-1" disabled={studentMarks.length === 0}>Submit Marks</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
