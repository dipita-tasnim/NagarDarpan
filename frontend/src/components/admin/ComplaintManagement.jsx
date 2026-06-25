import { useState, useEffect } from 'react';
import { getAdminProblems, updateProblemStatus, adminUploadAfterImage, deleteProblem } from '../../api';
import toast from 'react-hot-toast';
import StatusBadge from '../StatusBadge';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiX, FiUpload, FiClock, FiImage, FiTrash2 } from 'react-icons/fi';

export default function ComplaintManagement() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal State
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // After Image Upload State
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [afterImagePreview, setAfterImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, [statusFilter, categoryFilter]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await getAdminProblems(params);
      setProblems(res.data.data);
    } catch (err) {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const openModal = (problem) => {
    setSelectedProblem(problem);
    setUpdateStatus(problem.status);
    setAdminNotes('');
    setAfterImageFile(null);
    setAfterImagePreview(null);
    setIsModalOpen(true);
  };

  const handleAfterImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImageFile(file);
      setAfterImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadAfterImage = async () => {
    if (!afterImageFile) {
      toast.error('Please select an image first');
      return;
    }
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('afterImage', afterImageFile);

      await adminUploadAfterImage(selectedProblem._id, formData);
      toast.success('Proof-of-fix image uploaded successfully');
      setAfterImageFile(null);
      setAfterImagePreview(null);
      fetchProblems();
      // Refresh the selected problem data
      const res = await getAdminProblems({});
      const updated = res.data.data.find(p => p._id === selectedProblem._id);
      if (updated) setSelectedProblem(updated);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProblem = async (problem) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${problem.title}" (${problem.referenceNumber})? This action cannot be undone.`)) return;
    try {
      await deleteProblem(problem._id);
      toast.success('Problem deleted successfully');
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete problem');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateProblemStatus(selectedProblem._id, {
        status: updateStatus,
        adminComment: adminNotes
      });
      toast.success('Complaint status updated');
      setIsModalOpen(false);
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaint Management</h1>
          <p className="text-gray-500 text-sm mt-1">View, filter, and process citizen reports</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Reference, Title, or Name..."
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
            <option value="Acknowledged">Acknowledged</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Street Light">Street Light</option>
          </select>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition">
            Filter
          </button>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No complaints found matching criteria.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {problems.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-emerald-600 font-medium">{p.referenceNumber}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{p.category} • {p.thana}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.userName || 'Anonymous'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal(p)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition"
                        title="View & Edit Details"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(p)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                        title="Delete Problem"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail & Action Modal */}
      {isModalOpen && selectedProblem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800">Complaint Details</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-mono font-medium text-emerald-600">{selectedProblem.referenceNumber}</p>
                  
                  <p className="text-sm text-gray-500 mt-4">Title</p>
                  <p className="font-medium text-gray-900">{selectedProblem.title}</p>
                  
                  <p className="text-sm text-gray-500 mt-4">Category</p>
                  <p className="font-medium text-gray-900">{selectedProblem.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reporter</p>
                  <p className="font-medium text-gray-900">{selectedProblem.userName || 'Anonymous'}</p>
                  
                  <p className="text-sm text-gray-500 mt-4">Location</p>
                  <p className="font-medium text-gray-900">{selectedProblem.thana}, {selectedProblem.district}</p>
                  
                  <p className="text-sm text-gray-500 mt-4">Current Status</p>
                  <div className="mt-1"><StatusBadge status={selectedProblem.status} /></div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedProblem.description}</p>
              </div>

              {/* Evidence Images */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Before Fix</p>
                  {selectedProblem.image?.url ? (
                    <img 
                      src={selectedProblem.image.url} 
                      alt="Before" 
                      className="rounded-lg w-full h-40 object-cover border" 
                      onClick={() => window.open(selectedProblem.image.url, '_blank')}
                    />
                  ) : (
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No image provided</div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">After Fix (Proof)</p>
                  {selectedProblem.afterImage?.url ? (
                    <img 
                      src={selectedProblem.afterImage.url} 
                      alt="After" 
                      className="rounded-lg w-full h-40 object-cover border border-emerald-200" 
                      onClick={() => window.open(selectedProblem.afterImage.url, '_blank')}
                    />
                  ) : (
                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No proof uploaded yet</div>
                  )}
                </div>
              </div>

              {/* Admin After-Image Upload */}
              <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <h3 className="text-md font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <FiImage size={18} /> Upload Proof-of-Fix Image
                </h3>
                <p className="text-xs text-emerald-600 mb-3">As an admin, upload a photo showing the issue has been fixed.</p>
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <label className="flex items-center gap-2 cursor-pointer bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-lg text-sm font-medium transition">
                    <FiUpload size={16} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleAfterImageSelect}
                    />
                  </label>
                  {afterImagePreview && (
                    <img src={afterImagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover border border-emerald-200" />
                  )}
                  {afterImageFile && (
                    <button
                      onClick={handleUploadAfterImage}
                      disabled={isUploadingImage}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      {isUploadingImage ? 'Uploading...' : 'Upload Proof'}
                    </button>
                  )}
                </div>
                {afterImageFile && (
                  <p className="text-xs text-emerald-600 mt-2">Selected: {afterImageFile.name}</p>
                )}
              </div>

              {/* Evidence Timeline */}
              {selectedProblem.timeline && selectedProblem.timeline.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FiClock size={18} /> Evidence Timeline
                  </h3>
                  <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                    {selectedProblem.timeline.map((entry, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusBadge status={entry.status} />
                            <span className="text-xs text-gray-400">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{entry.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Official Action</h3>
                <form onSubmit={handleUpdateStatus}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Acknowledged">Acknowledged</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes / Official Comment</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add an internal note or official update for the citizen..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
