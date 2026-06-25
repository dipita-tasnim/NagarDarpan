import { useState, useEffect } from 'react';
import { getFraudProblems, getFraudStats, runFraudScan, toggleFraudProblem, rejectProblem, updateUserStatus } from '../../api';
import toast from 'react-hot-toast';
import {
  FiAlertTriangle, FiCheckCircle, FiXCircle, FiUserX,
  FiShield, FiRefreshCw, FiActivity, FiAlertOctagon, FiUser
} from 'react-icons/fi';

function ScoreBadge({ score }) {
  if (score >= 80) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Critical ({score})</span>;
  if (score >= 50) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">High ({score})</span>;
  if (score >= 30) return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">Medium ({score})</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Low ({score})</span>;
}

export default function FraudDetection() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('flagged'); // 'flagged' | 'users'

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [problemsRes, statsRes] = await Promise.all([getFraudProblems(), getFraudStats()]);
      setProblems(problemsRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load fraud data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScan = async () => {
    try {
      setScanning(true);
      const res = await runFraudScan();
      toast.success(res.data.message);
      fetchAll();
    } catch (err) {
      toast.error('Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleMarkClean = async (id) => {
    try {
      await toggleFraudProblem(id);
      toast.success('Marked as clean');
      fetchAll();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleReject = async (problem) => {
    if (!window.confirm(`Reject and hide "${problem.title}"? It will be removed from public view.`)) return;
    try {
      await rejectProblem(problem._id);
      toast.success('Report rejected and hidden');
      fetchAll();
    } catch (err) {
      toast.error('Failed to reject report');
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!userId) { toast.error('Anonymous user cannot be suspended'); return; }
    if (!window.confirm('Suspend this user account?')) return;
    try {
      await updateUserStatus(userId, { status: 'suspended' });
      toast.success('User suspended');
      fetchAll();
    } catch (err) {
      toast.error('Failed to suspend user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fraud Detection</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor misuse, auto-flagged reports, and high-risk users</p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          <FiRefreshCw size={15} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Scanning...' : 'Run Fraud Scan'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg"><FiAlertOctagon className="text-red-600" size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">Total Flagged</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalFlagged}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><FiActivity className="text-orange-600" size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">Auto-Detected</p>
                <p className="text-2xl font-bold text-gray-800">{stats.autoFlagged}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg"><FiAlertTriangle className="text-yellow-600" size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">Manual Flags</p>
                <p className="text-2xl font-bold text-gray-800">{stats.manualFlagged}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg"><FiXCircle className="text-gray-600" size={20} /></div>
              <div>
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-gray-800">{stats.rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('flagged')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'flagged' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Flagged Reports ({problems.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'users' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          High-Risk Users ({stats?.highRiskUsers?.length ?? 0})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : activeTab === 'flagged' ? (
        /* --- Flagged Reports Table --- */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {problems.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FiCheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
              <p>No fraudulent activities detected. The system is clean!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-red-50 border-b border-red-100">
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Reference</th>
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Report</th>
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Fraud Score</th>
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Reasons</th>
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Reporter</th>
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-4 text-xs font-semibold text-red-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {problems.map((p) => (
                  <tr key={p._id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono text-red-600 font-medium">{p.referenceNumber}</td>
                    <td className="px-5 py-4 max-w-45">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.category} • {p.thana}</p>
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBadge score={p.fraudScore || 0} />
                    </td>
                    <td className="px-5 py-4 max-w-55">
                      {p.fraudReasons && p.fraudReasons.length > 0 ? (
                        <ul className="space-y-1">
                          {p.fraudReasons.map((r, i) => (
                            <li key={i} className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded flex items-start gap-1">
                              <FiAlertTriangle size={11} className="mt-0.5 shrink-0" />{r}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Manually flagged</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      <p className="font-medium">{p.userName || 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">{p.userEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleMarkClean(p._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-medium transition"
                        >
                          <FiCheckCircle size={13} /> Mark Clean
                        </button>
                        <button
                          onClick={() => handleReject(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-medium transition"
                        >
                          <FiXCircle size={13} /> Reject Report
                        </button>
                        <button
                          onClick={() => handleSuspendUser(p.reportedBy?._id || p.reportedBy)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-medium transition"
                        >
                          <FiUserX size={13} /> Suspend User
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* --- High-Risk Users Table --- */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {!stats?.highRiskUsers?.length ? (
            <div className="text-center py-16 text-gray-500">
              <FiShield className="mx-auto h-12 w-12 text-green-300 mb-4" />
              <p>No high-risk users detected.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-orange-50 border-b border-orange-100">
                  <th className="px-6 py-4 text-xs font-semibold text-orange-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-700 uppercase tracking-wider">Fraud Reports</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-700 uppercase tracking-wider">Trust Score</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-700 uppercase tracking-wider">Warnings</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-orange-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.highRiskUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <FiUser size={14} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{u.fraudCount} reports</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${(u.trustScore || 0) < 30 ? 'bg-red-500' : (u.trustScore || 0) < 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${u.trustScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">{u.trustScore ?? 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{u.warnings ?? 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${u.status === 'active' ? 'bg-green-100 text-green-700' : u.status === 'suspended' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.status !== 'suspended' && u.status !== 'banned' ? (
                        <button
                          onClick={() => handleSuspendUser(u._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-medium transition"
                        >
                          <FiUserX size={13} /> Suspend
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Already restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Category Breakdown */}
      {stats?.fraudByCategory?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FiActivity size={16} /> Fraud by Category
          </h3>
          <div className="space-y-2">
            {stats.fraudByCategory.map((c) => {
              const pct = stats.totalFlagged > 0 ? Math.round((c.count / stats.totalFlagged) * 100) : 0;
              return (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 shrink-0">{c._id || 'Unknown'}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-14 text-right">{c.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

