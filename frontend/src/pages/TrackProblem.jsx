import { useState } from 'react';
import { getProblemByReference } from '../api';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

export default function TrackProblem() {
  const [refNumber, setRefNumber] = useState('');
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refNumber.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await getProblemByReference(refNumber.trim());
      setProblem(res.data.data);
    } catch {
      setProblem(null);
      toast.error('Problem not found. Check your reference number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Track Your Issue</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Enter your Reference Number</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="e.g. ND-A1B2C3D4"
          />
          <button
            type="submit" disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {searched && !loading && problem && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-semibold text-gray-800">{problem.title}</h2>
            <StatusBadge status={problem.status} />
          </div>
          <p className="text-gray-600 mb-3">{problem.description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
            <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">#{problem.referenceNumber}</span>
            <span>📌 {problem.category}</span>
            <span>📍 {problem.thana}, {problem.district}</span>
            <span>🕒 {new Date(problem.submissionTime).toLocaleString()}</span>
          </div>

          {/* Timeline */}
          {problem.timeline?.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-700 mb-3">Status History</h3>
              <div className="space-y-3">
                {problem.timeline.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${entry.status === 'Resolved' ? 'bg-green-500' : entry.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      {entry.notes && <p className="text-sm text-gray-500 mt-0.5">{entry.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to={`/problems/${problem._id}`} className="inline-block mt-4 text-emerald-600 hover:underline text-sm font-medium">
            View Full Details →
          </Link>
        </div>
      )}

      {searched && !loading && !problem && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-500">No problem found with that reference number.</p>
        </div>
      )}
    </div>
  );
}
