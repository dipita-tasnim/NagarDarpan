import { useState, useEffect } from 'react';
import { getAuthorities, createAuthority, updateAuthority, deleteAuthority, getDivisions, getDistricts, getThanas } from '../../api';
import toast from 'react-hot-toast';
import { FiUsers, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function AuthorityManagement() {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuth, setEditingAuth] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', role: '', phone: '', email: '',
    division: '', district: '', thana: '', ward: '', officeAddress: ''
  });

  // Location data for form dropdowns (optional, but good for validation)
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);

  useEffect(() => {
    fetchAuthorities();
    fetchDivisions();
  }, []);

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      const res = await getAuthorities();
      setAuthorities(res.data.data);
    } catch (err) {
      toast.error('Failed to load authorities');
    } finally {
      setLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const res = await getDivisions();
      setDivisions(res.data.data);
    } catch (err) { }
  };

  const handleDivisionChange = async (e) => {
    const divId = e.target.value;
    const divName = e.target.options[e.target.selectedIndex]?.text;
    setFormData({ ...formData, division: divName, district: '', thana: '' });
    if (divId) {
      const res = await getDistricts(divId);
      setDistricts(res.data.data);
    }
  };

  const handleDistrictChange = async (e) => {
    const distId = e.target.value;
    const distName = e.target.options[e.target.selectedIndex]?.text;
    setFormData({ ...formData, district: distName, thana: '' });
    if (distId) {
      const res = await getThanas(distId);
      setThanas(res.data.data);
    }
  };

  const openModal = (auth = null) => {
    if (auth) {
      setEditingAuth(auth);
      setFormData(auth);
    } else {
      setEditingAuth(null);
      setFormData({
        name: '', role: '', phone: '', email: '',
        division: '', district: '', thana: '', ward: '', officeAddress: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuth) {
        await updateAuthority(editingAuth._id, formData);
        toast.success('Authority updated');
      } else {
        await createAuthority(formData);
        toast.success('Authority created');
      }
      setIsModalOpen(false);
      fetchAuthorities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving authority');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this authority record?')) return;
    try {
      await deleteAuthority(id);
      toast.success('Deleted successfully');
      fetchAuthorities();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Local Authority Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage profiles for officials and route escalation targets</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition">
          <FiPlus /> Add Official
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : authorities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No authority records found.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Official</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Jurisdiction</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {authorities.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{a.name}</p>
                    <p className="text-xs text-emerald-600 font-semibold">{a.role}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{a.phone}</p>
                    <p className="text-xs text-gray-400">{a.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p>{a.thana}, {a.district}</p>
                    {a.ward && <p className="text-xs">Ward: {a.ward}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(a)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(a._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"><FiTrash2 size={16} /></button>
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
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">{editingAuth ? 'Edit Official' : 'Add Official'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role (e.g. Mayor, Ward Councillor)</label>
                  <input required type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Jurisdiction</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Division</label>
                    {editingAuth ? (
                      <input type="text" value={formData.division} onChange={e => setFormData({...formData, division: e.target.value})} className="w-full p-2 border rounded" />
                    ) : (
                      <select onChange={handleDivisionChange} className="w-full p-2 border rounded" required>
                        <option value="">Select Division</option>
                        {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District</label>
                    {editingAuth ? (
                      <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full p-2 border rounded" />
                    ) : (
                      <select onChange={handleDistrictChange} className="w-full p-2 border rounded" required>
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Thana</label>
                    {editingAuth ? (
                      <input type="text" value={formData.thana} onChange={e => setFormData({...formData, thana: e.target.value})} className="w-full p-2 border rounded" />
                    ) : (
                      <select onChange={(e) => setFormData({...formData, thana: e.target.options[e.target.selectedIndex]?.text})} className="w-full p-2 border rounded" required>
                        <option value="">Select Thana</option>
                        {thanas.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Ward (Optional)</label>
                    <input type="text" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Ward 12" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                <textarea value={formData.officeAddress} onChange={e => setFormData({...formData, officeAddress: e.target.value})} rows="2" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Save Official</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
