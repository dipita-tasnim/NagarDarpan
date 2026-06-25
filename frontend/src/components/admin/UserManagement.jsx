import { useState, useEffect } from 'react';
import { getAdminUsers, updateUserStatus, warnUser } from '../../api';
import toast from 'react-hot-toast';
import { FiSearch, FiShield, FiAlertTriangle, FiCheckCircle, FiUser } from 'react-icons/fi';

// Trust Score visual component
function TrustScoreBadge({ score, level }) {
  const getColor = () => {
    if (score >= 90) return { bg: 'bg-emerald-100', text: 'text-emerald-800', bar: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' };
    if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-500' };
    return { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' };
  };

  const colors = getColor();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className="text-xs font-bold text-gray-700">{score}</span>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block w-fit ${colors.bg} ${colors.text}`}>
        {level}
      </span>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await getAdminUsers(params);
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
    try {
      await updateUserStatus(userId, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleWarnUser = async (userId) => {
    if (!window.confirm('Are you sure you want to issue a warning to this user?')) return;
    try {
      await warnUser(userId);
      toast.success('Warning issued successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to warn user');
    }
  };

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      await updateUserStatus(userId, { isVerifiedCitizen: !isVerified });
      toast.success(`User verification ${!isVerified ? 'granted' : 'revoked'}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage citizens, apply bans, and view trust scores</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name or Email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition">
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No users found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trust Score</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      {u.isVerifiedCitizen && <FiShield className="text-blue-500" title="Verified Citizen" />}
                      {u.role === 'admin' && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded ml-2">Admin</span>}
                    </div>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <TrustScoreBadge 
                      score={u.trustScore ?? 70} 
                      level={u.trustLevel || 'Normal User'} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600"><span className="font-medium">{u.reportCount}</span> Reports</p>
                      <p className="text-xs text-green-600"><span className="font-medium">{u.resolvedCount || 0}</span> Resolved</p>
                      <p className="text-xs text-red-500"><span className="font-medium">{u.warnings}</span> Warnings</p>
                      {(u.fraudCount || 0) > 0 && (
                        <p className="text-xs text-red-600 font-semibold"><span className="font-medium">{u.fraudCount}</span> Fraud Flags</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      u.status === 'active' ? 'bg-green-100 text-green-800' :
                      u.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleVerifyUser(u._id, u.isVerifiedCitizen)}
                        className={`p-2 rounded-lg transition ${u.isVerifiedCitizen ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title={u.isVerifiedCitizen ? "Revoke Verification" : "Verify Citizen"}
                      >
                        <FiCheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleWarnUser(u._id)}
                        className="p-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition"
                        title="Issue Warning"
                      >
                        <FiAlertTriangle size={16} />
                      </button>
                      <select
                        value={u.status}
                        onChange={(e) => handleStatusChange(u._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="suspended">Suspend</option>
                        <option value="banned">Ban</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
