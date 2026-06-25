import { useState, useEffect } from 'react';
import { getContent, createContent, updateContent, deleteContent } from '../../api';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function ContentManagement() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('faq'); // faq, banner, policy
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'faq', title: '', content: '', isActive: true, order: 0
  });

  useEffect(() => {
    fetchContents();
  }, [activeTab]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await getContent({ type: activeTab });
      setContents(res.data.data);
    } catch (err) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (content = null) => {
    if (content) {
      setEditingContent(content);
      setFormData({
        type: content.type,
        title: content.title,
        content: content.content,
        isActive: content.isActive,
        order: content.order || 0
      });
    } else {
      setEditingContent(null);
      setFormData({
        type: activeTab,
        title: '',
        content: '',
        isActive: true,
        order: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContent) {
        await updateContent(editingContent._id, formData);
        toast.success('Content updated');
      } else {
        await createContent(formData);
        toast.success('Content created');
      }
      setIsModalOpen(false);
      fetchContents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving content');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    try {
      await deleteContent(id);
      toast.success('Deleted successfully');
      fetchContents();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleStatus = async (content) => {
    try {
      await updateContent(content._id, { isActive: !content.isActive });
      toast.success('Status updated');
      fetchContents();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Content Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage FAQs, UI Banners, and Platform Policies</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition">
          <FiPlus /> Add New
        </button>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('faq')} className={`px-4 py-2 font-medium ${activeTab === 'faq' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>FAQs</button>
        <button onClick={() => setActiveTab('banner')} className={`px-4 py-2 font-medium ${activeTab === 'banner' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Banners</button>
        <button onClick={() => setActiveTab('policy')} className={`px-4 py-2 font-medium ${activeTab === 'policy' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Policies</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No {activeTab} content found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Title / Question</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contents.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{c.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleStatus(c)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {c.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(c)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{editingContent ? 'Edit Content' : 'Add Content'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded" disabled={!!editingContent}>
                  <option value="faq">FAQ</option>
                  <option value="banner">Banner</option>
                  <option value="policy">Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'faq' ? 'Question' : 'Title'}
                </label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'faq' ? 'Answer' : formData.type === 'banner' ? 'Banner HTML/Text' : 'Policy Content'}
                </label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows="6" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="rounded text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">Make Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Save Content</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
