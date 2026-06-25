import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiFileText, FiUsers, FiAlertTriangle, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import AdminDashboard from '../components/admin/AdminDashboard';
import ComplaintManagement from '../components/admin/ComplaintManagement';

import UserManagement from '../components/admin/UserManagement';
import FraudDetection from '../components/admin/FraudDetection';
import AuthorityManagement from '../components/admin/AuthorityManagement';
import AreaManagement from '../components/admin/AreaManagement';
import ContentManagement from '../components/admin/ContentManagement';
import FeedModeration from '../components/admin/FeedModeration';
import EscalationCenter from '../components/admin/EscalationCenter';
import AnalyticsPanel from '../components/admin/AnalyticsPanel';
import NotificationManagement from '../components/admin/NotificationManagement';
import SystemSettings from '../components/admin/SystemSettings';
import { FiMapPin, FiBriefcase, FiLayers, FiShield, FiAlertOctagon, FiPieChart, FiBell } from 'react-icons/fi';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-gray-500">
        You do not have permission to view the Admin Panel.
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'analytics', label: 'Advanced Analytics', icon: FiPieChart },
    { id: 'complaints', label: 'Complaints', icon: FiFileText },
    { id: 'moderation', label: 'Feed Moderation', icon: FiShield },
    { id: 'escalations', label: 'Escalation Center', icon: FiAlertOctagon },
    { id: 'fraud', label: 'Fraud Detection', icon: FiAlertTriangle },
    { id: 'users', label: 'User Management', icon: FiUsers },
    { id: 'authorities', label: 'Local Authorities', icon: FiBriefcase },
    { id: 'areas', label: 'Area Management', icon: FiMapPin },
    { id: 'content', label: 'Platform Content', icon: FiLayers },
    { id: 'notifications', label: 'Global Notifications', icon: FiBell },
    { id: 'settings', label: 'System Settings', icon: FiSettings },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="md:hidden absolute top-20 left-4 z-20">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md text-gray-600"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-10 transition-transform duration-300 ease-in-out pt-16 md:pt-6 flex flex-col`}
      >
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Center</h2>
          <p className="text-sm text-gray-500 mt-1">Control Panel</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'complaints' && <ComplaintManagement />}
          {activeTab === 'moderation' && <FeedModeration />}
          {activeTab === 'escalations' && <EscalationCenter />}
          {activeTab === 'fraud' && <FraudDetection />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'authorities' && <AuthorityManagement />}
          {activeTab === 'areas' && <AreaManagement />}
          {activeTab === 'content' && <ContentManagement />}
          {activeTab === 'notifications' && <NotificationManagement />}
          {activeTab === 'settings' && <SystemSettings />}
        </div>
      </main>
    </div>
  );
}
