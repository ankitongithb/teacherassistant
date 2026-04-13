import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Users, GraduationCap, CalendarCheck, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import { StatCard } from '../components/ui/Card';
import { CardSkeleton } from '../components/ui/Skeleton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back! Here's your overview.</p>
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
      <div>
        <h1 className="text-2xl font-bold text-dark-800 dark:text-white">Dashboard</h1>
        <p className="text-dark-400 mt-1">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Batches" value={stats?.totalBatches || 0} color="primary" />
        <StatCard icon={GraduationCap} label="Total Students" value={stats?.totalStudents || 0} color="accent" />
        <StatCard icon={CalendarCheck} label="Attendance %" value={`${stats?.overallAttendancePercentage || 0}%`} color="teal" />
        <StatCard icon={TrendingUp} label="Avg. Marks" value={`${stats?.averageMarks || 0}%`} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trends */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-4">Attendance Trends</h3>
          {stats?.attendanceTrends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.attendanceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => v.slice(5)} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Line type="monotone" dataKey="percentage" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-400">No attendance data yet</div>
          )}
        </div>

        {/* Marks Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-dark-800 dark:text-white mb-4">Marks Distribution</h3>
          {stats?.marksDistribution?.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.marksDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-dark-400">No marks data yet</div>
          )}
        </div>
      </div>

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-dark-800 dark:text-white">Top Performers</h3>
          </div>
          {stats?.topPerformers?.length > 0 ? (
            <div className="space-y-3">
              {stats.topPerformers.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-500' : 'bg-primary-400'}`}>
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{s.studentName}</p>
                      <p className="text-xs text-dark-400">{s.batchName} • {s.rollNumber}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">{s.averageMarks}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm py-8 text-center">No data available yet</p>
          )}
        </div>

        {/* Low Attendance */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-dark-800 dark:text-white">Low Attendance (&lt;75%)</h3>
          </div>
          {stats?.lowAttendanceStudents?.length > 0 ? (
            <div className="space-y-3">
              {stats.lowAttendanceStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-700/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-dark-700 dark:text-dark-200">{s.studentName}</p>
                    <p className="text-xs text-dark-400">{s.batchName} • {s.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-gray-200 dark:bg-dark-600 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.attendancePercentage}%` }} />
                    </div>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400 w-12 text-right">{s.attendancePercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm py-8 text-center">All students have good attendance! 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
}
