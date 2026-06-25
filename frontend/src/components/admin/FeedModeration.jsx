import { useState, useEffect } from 'react';
import { getAdminProblems, moderateProblem } from '../../api';
import toast from 'react-hot-toast';
import { FiEyeOff, FiEye, FiImage, FiStar, FiShield } from 'react-icons/fi';

export default function FeedModeration() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await getAdminProblems({ search, limit: 50 });
      setProblems(res.data.data);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  const toggleModeration = async (id, field, currentValue) => {
    try {
      await moderateProblem(id, { [field]: !currentValue });
      toast.success('Moderation applied');
      fetchProblems();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Public Feed Moderation</h1>
          <p className="text-gray-500 text-sm mt-1">Control visibility, pin important updates, and blur sensitive content</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-4">
          <input
            type="text"
            placeholder="Search Reference Number or Title..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No reports found.</div>
        ) : (
          problems.map((p) => (
            <div key={p._id} className={`bg-white rounded-xl shadow-sm border flex flex-col md:flex-row overflow-hidden ${p.isHidden ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
              
              <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative shrink-0">
                {p.image ? (
                  <img src={p.image} alt="Report" className={`w-full h-full object-cover ${p.isBlurred ? 'blur-md' : ''}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiImage size={32} />
                  </div>
                )}
                {p.isPinned && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded font-bold flex items-center gap-1 shadow-sm">
                    <FiStar size={12} /> Pinned
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">{p.referenceNumber}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-2">{p.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-500">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{p.category}</span>
                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">{p.thana}, {p.district}</span>
                    <span>By: {p.userName || 'Anonymous'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                  <button
                    onClick={() => toggleModeration(p._id, 'isHidden', p.isHidden)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${p.isHidden ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {p.isHidden ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    {p.isHidden ? 'Hidden from Public' : 'Hide from Public'}
                  </button>

                  <button
                    onClick={() => toggleModeration(p._id, 'isBlurred', p.isBlurred)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${p.isBlurred ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FiShield size={16} />
                    {p.isBlurred ? 'Image Blurred' : 'Blur Image'}
                  </button>

                  <button
                    onClick={() => toggleModeration(p._id, 'isPinned', p.isPinned)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${p.isPinned ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <FiStar size={16} />
                    {p.isPinned ? 'Unpin' : 'Pin to Top'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
