import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  BarChart3, Clock, Users, AlertTriangle, Download, BookOpen,
  TrendingUp, ChevronDown, ChevronUp
} from 'lucide-react';
import { StatCard } from '../components/ui/Card';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { getPercentageColor, getPercentageBg } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function SubjectAnalytics() {
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [summary, setSummary] = useState(null);
  const [allSummaries, setAllSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [sortField, setSortField] = useState('percentage');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [subRes, batchRes, summaryRes] = await Promise.all([
        API.get('/teachers/subjects'),
        API.get('/batches'),
        API.get('/subjects/attendance-summary'),
      ]);
      setSubjects(subRes.data);
      setBatches(batchRes.data);
      setAllSummaries(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectDetail();
    } else {
      setSummary(null);
    }
  }, [selectedSubject, selectedBatch]);

  const fetchSubjectDetail = async () => {
    setDetailLoading(true);
    try {
      const params = {};
      if (selectedBatch) params.batchId = selectedBatch;
      const res = await API.get(`/subjects/${selectedSubject}/attendance-summary`, { params });
      setSummary(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setDetailLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!selectedSubject) { toast.error('Select a subject first'); return; }
    try {
      const params = {};
      if (selectedBatch) params.batchId = selectedBatch;
      const res = await API.get(`/subjects/${selectedSubject}/attendance-summary/pdf`, { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_analytics_${summary?.subjectCode || 'report'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  // Sort and filter students
  const getFilteredStudents = () => {
    if (!summary?.students) return [];
    let students = [...summary.students];
    if (showLowOnly) {
      students = students.filter(s => s.attendancePercentage < 75);
    }
    students.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'name': valA = a.name; valB = b.name; break;
        case 'rollNumber': valA = a.rollNumber; valB = b.rollNumber; break;
        case 'attendedHours': valA = a.attendedHours; valB = b.attendedHours; break;
        default: valA = a.attendancePercentage; valB = b.attendancePercentage;
      }
      if (typeof valA === 'string') return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortAsc ? valA - valB : valB - valA;
    });
    return students;
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;
  };

  // Chart data
  const chartData = summary?.students?.map(s => ({
    name: s.rollNumber,
    percentage: s.attendancePercentage,
    fullName: s.name,
  })) || [];

  const getBarColor = (pct) => {
    if (pct >= 75) return '#22c55e';
    if (pct >= 50) return '#eab308';
    return '#ef4444';
  };

  const lowAttendanceCount = summary?.students?.filter(s => s.attendancePercentage < 75).length || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Subject Analytics</h1>
          <p className="text-dark-400 mt-1">Hours-based attendance analysis per subject</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Subject Analytics</h1>
          <p className="text-dark-400 mt-1">Hours-based attendance analysis per subject</p>
        </div>
        {selectedSubject && (
          <Button variant="secondary" icon={Download} onClick={downloadPdf}>Export PDF</Button>
        )}
      </div>

      {/* Overview Cards — All subjects quick stats */}
      {!selectedSubject && allSummaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allSummaries.map((s) => (
            <Card key={s.subjectId} hover onClick={() => setSelectedSubject(String(s.subjectId))} className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-dark-800 dark:text-white">{s.subjectName}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                    {s.subjectCode}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-dark-700">
                <div className="text-center">
                  <p className="text-lg font-bold text-dark-800 dark:text-white">{s.totalHours}</p>
                  <p className="text-xs text-dark-400">Hours</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-dark-800 dark:text-white">{s.totalSessions}</p>
                  <p className="text-xs text-dark-400">Sessions</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${getPercentageColor(s.classAveragePercentage)}`}>
                    {s.classAveragePercentage}%
                  </p>
                  <p className="text-xs text-dark-400">Average</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={selectedSubject}
          onChange={(e) => { setSelectedSubject(e.target.value); setSelectedBatch(''); }}
          placeholder="Select a subject..."
          options={subjects.map(s => ({ value: s.id, label: `${s.subjectName} (${s.subjectCode})` }))}
          className="sm:w-72"
        />
        {selectedSubject && (
          <Select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            placeholder="All Batches"
            options={batches.map(b => ({ value: b.id, label: b.batchName }))}
            className="sm:w-48"
          />
        )}
      </div>

      {/* No subject selected prompt */}
      {!selectedSubject && allSummaries.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No analytics data"
          description="Mark attendance for your subjects to see analytics here."
        />
      )}

      {/* Detail View */}
      {selectedSubject && (
        <>
          {detailLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
              </div>
              <TableSkeleton rows={6} cols={5} />
            </div>
          ) : !summary ? (
            <EmptyState icon={BarChart3} title="No data" description="No attendance data found for this subject." />
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={BookOpen} label="Subject" value={summary.subjectCode} color="primary" />
                <StatCard icon={Clock} label="Total Hours Taught" value={summary.totalHours} color="teal" />
                <StatCard icon={Users} label="Total Students" value={summary.students?.length || 0} color="accent" />
                <StatCard icon={TrendingUp} label="Class Average" value={`${summary.classAveragePercentage}%`} color="orange" />
              </div>

              {/* Low attendance alert */}
              {lowAttendanceCount > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 animate-slide-up">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      {lowAttendanceCount} student{lowAttendanceCount > 1 ? 's' : ''} with attendance below 75%
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLowOnly(!showLowOnly)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                      showLowOnly
                        ? 'bg-red-500 text-white'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200'
                    }`}
                  >
                    {showLowOnly ? 'Show All' : 'Show Low Only'}
                  </button>
                </div>
              )}

              {/* Chart */}
              {chartData.length > 0 && chartData.length <= 40 && (
                <Card>
                  <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-4">
                    Attendance Distribution by Student
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(value, name, props) => [`${value}%`, props.payload.fullName]}
                        labelFormatter={(label) => `Roll: ${label}`}
                      />
                      <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={getBarColor(entry.percentage)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded bg-green-500" /> ≥75%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded bg-yellow-500" /> 50–75%
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded bg-red-500" /> &lt;50%
                    </div>
                  </div>
                </Card>
              )}

              {/* Student Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dark-800/50">
                        <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => toggleSort('rollNumber')}>
                          <span className="inline-flex items-center gap-1">Roll No. <SortIcon field="rollNumber" /></span>
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => toggleSort('name')}>
                          <span className="inline-flex items-center gap-1">Student Name <SortIcon field="name" /></span>
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400">Batch</th>
                        <th className="px-4 py-3 text-center font-semibold text-dark-500 dark:text-dark-400 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => toggleSort('attendedHours')}>
                          <span className="inline-flex items-center gap-1">Attended Hrs <SortIcon field="attendedHours" /></span>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-dark-500 dark:text-dark-400">Total Hrs</th>
                        <th className="px-4 py-3 text-left font-semibold text-dark-500 dark:text-dark-400 cursor-pointer hover:text-primary-600 transition-colors" onClick={() => toggleSort('percentage')}>
                          <span className="inline-flex items-center gap-1">Attendance % <SortIcon field="percentage" /></span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                      {getFilteredStudents().map((s) => (
                        <tr key={s.studentId} className={`transition-colors ${
                          s.attendancePercentage < 50
                            ? 'bg-red-50/50 dark:bg-red-900/5 hover:bg-red-50 dark:hover:bg-red-900/10'
                            : s.attendancePercentage < 75
                              ? 'bg-yellow-50/30 dark:bg-yellow-900/5 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10'
                              : 'bg-white dark:bg-dark-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                        }`}>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded-md">{s.rollNumber}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
                                {s.name?.charAt(0)}
                              </div>
                              <span className="font-medium text-dark-700 dark:text-dark-200">{s.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="info">{s.batchName}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-dark-700 dark:text-dark-200">
                            {s.attendedHours}
                          </td>
                          <td className="px-4 py-3 text-center text-dark-500 dark:text-dark-400">
                            {s.totalHours}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-28 h-2.5 rounded-full bg-gray-200 dark:bg-dark-600 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${getPercentageBg(s.attendancePercentage)}`}
                                  style={{ width: `${Math.min(s.attendancePercentage, 100)}%` }}
                                />
                              </div>
                              <span className={`text-sm font-bold w-14 text-right ${getPercentageColor(s.attendancePercentage)}`}>
                                {s.attendancePercentage}%
                              </span>
                              {s.attendancePercentage < 50 && (
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {getFilteredStudents().length === 0 && (
                  <div className="py-12 text-center text-dark-400">
                    {showLowOnly ? 'No students with attendance below 75% 🎉' : 'No student data available'}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
