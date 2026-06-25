import { useState, useEffect } from 'react';
import { getAreaStats } from '../api';

const CATEGORY_ICONS = {
  'Road Damage': '🛣️',
  'Water Supply': '💧',
  'Sewage': '🚰',
  'Street Light': '💡',
  'Waste Management': '🗑️',
  'Public Health': '🏥',
  'Safety': '🛡️',
  'Construction': '🏗️',
  'Other': '📋',
  'N/A': '❓',
};

function StatCard({ item, onClick, clickable }) {
  const resolvedPct = item.total > 0 ? Math.round((item.resolved / item.total) * 100) : 0;
  const icon = CATEGORY_ICONS[item.topCategory] || '📋';

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 transition ${
        clickable ? 'cursor-pointer hover:shadow-md hover:border-emerald-200' : ''
      }`}
    >
      {/* Area name */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-base truncate">{item.area}</h3>
        {clickable && (
          <span className="text-xs text-emerald-600 whitespace-nowrap ml-2">View Districts →</span>
        )}
      </div>

      {/* Totals row */}
      <div className="flex gap-4 text-sm">
        <div className="flex flex-col items-center bg-gray-50 rounded-lg px-3 py-2 flex-1">
          <span className="text-xl font-bold text-gray-800">{item.total}</span>
          <span className="text-xs text-gray-500">Total</span>
        </div>
        <div className="flex flex-col items-center bg-green-50 rounded-lg px-3 py-2 flex-1">
          <span className="text-xl font-bold text-green-700">{item.resolved}</span>
          <span className="text-xs text-green-600">Resolved</span>
        </div>
        <div className="flex flex-col items-center bg-orange-50 rounded-lg px-3 py-2 flex-1">
          <span className="text-xl font-bold text-orange-600">{item.unresolved}</span>
          <span className="text-xs text-orange-500">Unresolved</span>
        </div>
      </div>

      {/* Resolution bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Resolution rate</span>
          <span>{resolvedPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all"
            style={{ width: `${resolvedPct}%` }}
          />
        </div>
      </div>

      {/* Top category */}
      <div className="flex items-center gap-2 text-sm text-gray-600 border-t pt-3">
        <span className="text-base">{icon}</span>
        <span>Most common: <strong>{item.topCategory}</strong></span>
      </div>
    </div>
  );
}

export default function AreaStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('division');

  // Drill-down state
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const fetchStats = async (gb, division = null, district = null) => {
    setLoading(true);
    try {
      const params = { groupBy: gb };
      if (division) params.division = division;
      if (district) params.district = district;
      const res = await getAreaStats(params);
      setStats(res.data.data);
    } catch {
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats('division');
  }, []);

  const handleDivisionClick = (divisionName) => {
    setSelectedDivision(divisionName);
    setSelectedDistrict(null);
    setGroupBy('district');
    fetchStats('district', divisionName);
  };

  const handleDistrictClick = (districtName) => {
    setSelectedDistrict(districtName);
    setGroupBy('thana');
    fetchStats('thana', selectedDivision, districtName);
  };

  const breadcrumb = [
    { label: 'All Divisions', onClick: () => { setSelectedDivision(null); setSelectedDistrict(null); setGroupBy('division'); fetchStats('division'); } },
    ...(selectedDivision ? [{ label: selectedDivision, onClick: () => { setSelectedDistrict(null); setGroupBy('district'); fetchStats('district', selectedDivision); } }] : []),
    ...(selectedDistrict ? [{ label: selectedDistrict, onClick: null }] : []),
  ];

  const totals = stats.reduce(
    (acc, s) => ({ total: acc.total + s.total, resolved: acc.resolved + s.resolved, unresolved: acc.unresolved + s.unresolved }),
    { total: 0, resolved: 0, unresolved: 0 }
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Area Statistics</h1>
      <p className="text-sm text-gray-500 mb-6">Problem breakdown by geographic area. Click a division to drill down.</p>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm mb-6 flex-wrap">
        {breadcrumb.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-400">/</span>}
            {crumb.onClick ? (
              <button onClick={crumb.onClick} className="text-emerald-600 hover:underline font-medium">
                {crumb.label}
              </button>
            ) : (
              <span className="text-gray-700 font-semibold">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Summary banner */}
      {!loading && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-700">{totals.total}</div>
            <div className="text-sm text-emerald-600 mt-1">Total Problems</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-700">{totals.resolved}</div>
            <div className="text-sm text-green-600 mt-1">Resolved</div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{totals.unresolved}</div>
            <div className="text-sm text-orange-500 mt-1">Unresolved</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : stats.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No data found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <StatCard
              key={item.area}
              item={item}
              clickable={groupBy === 'division'}
              onClick={() => handleDivisionClick(item.area)}
            />
          ))}
        </div>
      )}

      {/* Thana level — no further drill-down, just show note */}
      {groupBy === 'thana' && !loading && stats.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-6">Showing thana-level breakdown (deepest level)</p>
      )}
    </div>
  );
}
