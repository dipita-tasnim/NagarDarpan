import { useState, useEffect } from 'react';
import { getAdminNotifications, createNotification, deleteNotification } from '../../api';
import toast from 'react-hot-toast';
import { FiBell, FiTrash2, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [audience, setAudience] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getAdminNotifications();
      setNotifications(res.data.data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createNotification({ title, message, type, audience });
      toast.success('Notification broadcasted');
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to broadcast');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const getTypeIcon = (nType) => {
    switch (nType) {
      case 'alert': return <FiAlertCircle className="text-red-500" />;
      case 'warning': return <FiAlertCircle className="text-orange-500" />;
      case 'success': return <FiCheckCircle className="text-green-500" />;
      default: return <FiInfo className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiBell className="text-indigo-600" /> Global Notifications
          </h1>
          <p className="text-gray-500 text-sm mt-1">Broadcast system alerts, updates, and maintenance warnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Broadcast</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="E.g., System Maintenance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  required
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Enter details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="info">Information</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Critical Alert</option>
                    <option value="success">Success</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Everyone</option>
                    <option value="citizens">Citizens Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition font-medium mt-2"
              >
                Broadcast Notification
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Recent Broadcasts</h3>
            </div>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No active notifications.</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <li key={n._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3">
                        <div className="mt-1">{getTypeIcon(n.type)}</div>
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            {n.title}
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-200 text-gray-600">
                              {n.audience}
                            </span>
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(n._id)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                        title="Delete Broadcast"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
