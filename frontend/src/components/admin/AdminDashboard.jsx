import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api';
import toast from 'react-hot-toast';
import { FiUsers, FiFileText, FiClock, FiCheckCircle, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Reports', value: stats.totalReports, icon: FiFileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Reports Today', value: stats.reportsToday, icon: FiTrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Resolved Reports', value: stats.resolvedReports, icon: FiCheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Fraud Flags', value: stats.fraudReports, icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time statistics and insights</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className={`p-4 rounded-lg ${card.bg} ${card.color} mr-4`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Highlights</h3>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="text-red-800 font-medium">Most Problematic Area</span>
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">{stats.mostProblematicArea}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
              <span className="text-orange-800 font-medium">Most Common Category</span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">{stats.mostCommonCategory}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-800 font-medium">Escalated Reports</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{stats.escalatedReports}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Area-wise Complaints</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.areaWiseComplaints}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Reports Trend (Last 6 Months)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.reportsByMonth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
