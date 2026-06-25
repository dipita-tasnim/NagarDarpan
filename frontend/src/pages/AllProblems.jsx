import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllProblems, getDivisions, getDistricts, getThanas } from '../api';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES = ['Road Damage', 'Water Supply', 'Sewage', 'Street Light', 'Waste Management', 'Public Health', 'Safety', 'Other', 'Construction'];

export default function AllProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Filter state
  const [category, setCategory] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');

  // Area dropdown data
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);

  // Load divisions on mount
  useEffect(() => {
    getDivisions().then((res) => setDivisions(res.data.data)).catch(() => {});
  }, []);

  // Load districts when division changes
  useEffect(() => {
    if (division) {
      const found = divisions.find((d) => d.name === division);
      if (found) {
        setDistricts([]);
        setThanas([]);
        setDistrict('');
        setThana('');
        getDistricts(found._id).then((res) => setDistricts(res.data.data)).catch(() => {});
      }
    } else {
      setDistricts([]);
      setThanas([]);
      setDistrict('');
      setThana('');
    }
  }, [division]);

  // Load thanas when district changes
  useEffect(() => {
    if (district) {
      const found = districts.find((d) => d.name === district);
      if (found) {
        setThanas([]);
        setThana('');
        getThanas(found._id).then((res) => setThanas(res.data.data)).catch(() => {});
      }
    } else {
      setThanas([]);
      setThana('');
    }
  }, [district]);

  // Fetch problems whenever filters or page change
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (category) params.category = category;
        if (division) params.division = division;
        if (district) params.district = district;
        if (thana) params.thana = thana;
        const res = await getAllProblems(params);
        setProblems(res.data.data);
        setPagination(res.data.pagination);
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [page, category, division, district, thana]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter) => (e) => {
    setPage(1);
    setter(e.target.value);
  };

  const hasFilters = category || division || district || thana;

  const clearFilters = () => {
    setPage(1);
    setCategory('');
    setDivision('');
    setDistrict('');
    setThana('');
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Reported Problems</h1>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Division */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Division</label>
            <select
              value={division}
              onChange={handleFilterChange(setDivision)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-w-32"
            >
              <option value="">All Divisions</option>
              {divisions.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">District</label>
            <select
              value={district}
              onChange={handleFilterChange(setDistrict)}
              disabled={!division || districts.length === 0}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-w-32 disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Thana */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Thana</label>
            <select
              value={thana}
              onChange={handleFilterChange(setThana)}
              disabled={!district || thanas.length === 0}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-w-32 disabled:opacity-50"
            >
              <option value="">All Thanas</option>
              {thanas.map((t) => (
                <option key={t._id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Category</label>
            <select
              value={category}
              onChange={handleFilterChange(setCategory)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-w-36"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : problems.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No problems found.</p>
      ) : (
        <>
          <div className="grid gap-4">
            {problems.map((p) => (
              <Link key={p._id} to={`/problems/${p._id}`} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 flex flex-col md:flex-row md:items-center gap-4">
                {p.image?.url && (
                  <img src={p.image.url} alt="" className="w-full md:w-24 h-24 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">{p.title}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{p.description}</p>
                  <div className="text-xs text-gray-400 mt-2 flex flex-wrap gap-3">
                    <span>📌 {p.category}</span>
                    <span>📍 {p.thana}, {p.district}, {p.division}</span>
                    <span>🕒 {new Date(p.submissionTime).toLocaleString()}</span>
                    <span className="font-mono text-emerald-600">#{p.referenceNumber}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-40 hover:bg-emerald-700 transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {pagination.pages}</span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-40 hover:bg-emerald-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
