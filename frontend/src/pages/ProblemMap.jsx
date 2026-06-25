import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { getAllProblems } from '../api';
import StatusBadge from '../components/StatusBadge';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
const DEFAULT_CENTER = { lat: 23.8103, lng: 90.4125 };

const CATEGORY_COLORS = {
  'Road Damage': '#EF4444',
  'Water Supply': '#3B82F6',
  'Sewage': '#8B5CF6',
  'Street Light': '#F59E0B',
  'Waste Management': '#10B981',
  'Public Health': '#EC4899',
  'Safety': '#F97316',
  'Other': '#6B7280',
  'construction': '#A0522D',
};

function MarkerIcon({ color }) {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 border-white shadow-md"
      style={{ backgroundColor: color }}
    />
  );
}

export default function ProblemMap() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch all problems (large limit to get them all for the map)
        const res = await getAllProblems({ limit: 500 });
        // Only keep problems that have coordinates
        const withCoords = (res.data.data || []).filter(
          (p) => p.latitude && p.longitude
        );
        setProblems(withCoords);
      } catch {
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Problem Map</h1>
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          <p className="text-lg mb-2">Google Maps API key not configured.</p>
          <p className="text-sm">Add <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_KEY</code> to your <code className="bg-gray-100 px-1 rounded">.env</code> file to enable the map view.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Problem Map</h1>
        <span className="text-sm text-gray-500">
          {loading ? 'Loading...' : `${problems.length} problem${problems.length !== 1 ? 's' : ''} on map`}
        </span>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-wrap gap-4">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {cat}
          </div>
        ))}
      </div>

      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <div className="rounded-xl overflow-hidden shadow-md" style={{ height: 550 }}>
          <Map
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={7}
            gestureHandling="greedy"
            mapId="problem-map"
            style={{ width: '100%', height: '100%' }}
          >
            {problems.map((p) => (
              <AdvancedMarker
                key={p._id}
                position={{ lat: p.latitude, lng: p.longitude }}
                onClick={() => setSelectedProblem(p)}
              >
                <MarkerIcon color={CATEGORY_COLORS[p.category] || '#6B7280'} />
              </AdvancedMarker>
            ))}

            {selectedProblem && (
              <InfoWindow
                position={{ lat: selectedProblem.latitude, lng: selectedProblem.longitude }}
                onCloseClick={() => setSelectedProblem(null)}
              >
                <div className="max-w-xs p-1">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{selectedProblem.title}</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={selectedProblem.status} />
                    <span className="text-xs text-gray-500">📌 {selectedProblem.category}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">{selectedProblem.description}</p>
                  <p className="text-xs text-gray-400 mb-2">
                    📍 {selectedProblem.thana}, {selectedProblem.district}
                  </p>
                  <button
                    onClick={() => navigate(`/problems/${selectedProblem._id}`)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded transition"
                  >
                    View Details
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  );
}
