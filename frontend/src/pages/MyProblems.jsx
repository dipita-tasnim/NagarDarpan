import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProblems } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function MyProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProblems()
      .then((res) => setProblems(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Reported Problems</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven't reported any problems yet.</p>
          <Link to="/report" className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
            Report Your First Problem
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {problems.map((p) => (
            <Link key={p._id} to={`/problems/${p._id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{p.title}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{p.description}</p>
              <div className="text-xs text-gray-400 flex flex-wrap gap-3">
                <span className="font-mono text-emerald-600">#{p.referenceNumber}</span>
                <span>📌 {p.category}</span>
                <span>📍 {p.thana}, {p.district}</span>
                <span>🕒 {new Date(p.submissionTime).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
