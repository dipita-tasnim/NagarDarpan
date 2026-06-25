import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProblemById, updateProblemStatus, getProblemTimeline, supportProblem, escalateProblem } from '../api';
import StatusBadge from '../components/StatusBadge';
import EscalateModal from '../components/EscalateModal';
import { useAuth } from '../context/AuthContext';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';

const STATUSES = ['Acknowledged', 'In Progress', 'Resolved'];
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

export default function ProblemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supporting, setSupporting] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);

  // Status update form
  const [showUpdate, setShowUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [afterImage, setAfterImage] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    try {
      const [probRes, timeRes] = await Promise.all([
        getProblemById(id),
        getProblemTimeline(id),
      ]);
      setProblem(probRes.data.data);
      setTimeline(timeRes.data.data.timeline || []);
    } catch {
      toast.error('Failed to load problem details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const hasSupported = user && problem?.supporters?.includes(user._id);

  const handleSupport = async () => {
    if (!user) { toast.error('Please log in to support this issue'); return; }
    setSupporting(true);
    try {
      await supportProblem(id);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to support');
    } finally {
      setSupporting(false);
    }
  };

  const isEscalationEligible = problem && !problem.escalated && problem.status !== 'Resolved' && (
    (problem.supportCount || 0) >= 2 ||
    (Date.now() - new Date(problem.submissionTime).getTime()) / (1000 * 60 * 60 * 24) >= 14
  );

  const handleEscalate = async () => {
    try {
      await escalateProblem(id);
      toast.success('Issue escalated successfully!');
      setShowEscalate(false);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Escalation failed');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);
      formData.append('notes', notes);
      if (afterImage) formData.append('afterImage', afterImage);

      await updateProblemStatus(id, formData);
      toast.success('Status updated!');
      setShowUpdate(false);
      setNewStatus('');
      setNotes('');
      setAfterImage(null);
      setAfterPreview(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!problem) {
    return <p className="text-center py-20 text-gray-500">Problem not found.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{problem.title}</h1>
          <StatusBadge status={problem.status} />
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
          <span className="font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">#{problem.referenceNumber}</span>
          <span>📌 {problem.category}</span>
          <span>📍 {problem.division} → {problem.district} → {problem.thana}</span>
        </div>
        <p className="text-gray-700 mb-4">{problem.description}</p>

        <div className="text-sm text-gray-400">
          Reported on: <strong>{new Date(problem.submissionTime).toLocaleString()}</strong>
        </div>

        {/* Support & Escalate */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
          {user && problem.reportedBy === user._id ? (
            <span className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-400 cursor-default">
              👍 Your Issue ({problem.supportCount || 0})
            </span>
          ) : (
            <button
              onClick={handleSupport}
              disabled={supporting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                hasSupported
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {hasSupported ? '👍 Supported' : '👍 Support'} ({problem.supportCount || 0})
            </button>
          )}

          {(isEscalationEligible || problem.escalated) && (
            <button
              onClick={() => setShowEscalate(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                problem.escalated
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              {problem.escalated ? '⚠️ Escalated' : '⚠️ Escalate Issue'}
            </button>
          )}
        </div>
      </div>

      {/* Location Map */}
      {GOOGLE_MAPS_KEY && problem.latitude && problem.longitude && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">📍 Pinned Location</h3>
          <APIProvider apiKey={GOOGLE_MAPS_KEY}>
            <div className="rounded-lg overflow-hidden" style={{ height: 250 }}>
              <Map
                defaultCenter={{ lat: problem.latitude, lng: problem.longitude }}
                defaultZoom={15}
                gestureHandling="cooperative"
                mapId="detail-map"
                style={{ width: '100%', height: '100%' }}
              >
                <AdvancedMarker position={{ lat: problem.latitude, lng: problem.longitude }} />
              </Map>
            </div>
          </APIProvider>
        </div>
      )}

      {/* Images */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {problem.image?.url && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Before Image</h3>
            <img src={problem.image.url} alt="Before" className="rounded-lg w-full max-h-72 object-cover" />
          </div>
        )}
        {problem.afterImage?.url && (
          <div className="bg-white rounded-xl shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3">After Image</h3>
            <img src={problem.afterImage.url} alt="After" className="rounded-lg w-full max-h-72 object-cover" />
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-gray-500 text-sm">No timeline entries yet.</p>
        ) : (
          <div className="space-y-4">
            {timeline.map((entry, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mt-1.5 ${entry.status === 'Resolved' ? 'bg-green-500' : entry.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200"></div>}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={entry.status} />
                    <span className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                    {entry.changedByName && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        👤 {entry.changedByName}
                      </span>
                    )}
                  </div>
                  {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Status */}
      {problem.status !== 'Resolved' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          {!user ? (
            <p className="text-sm text-gray-500">
              <Link to="/login" className="text-emerald-600 font-medium hover:underline">Log in</Link> to update the status of this problem.
            </p>
          ) : !showUpdate ? (
            <button
              onClick={() => setShowUpdate(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition"
            >
              Update Status
            </button>
          ) : (
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <h3 className="font-semibold text-gray-800">Update Status</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status *</label>
                <select
                  required value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">Select status</option>
                  {STATUSES.filter((s) => s !== problem.status).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3} value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  placeholder="Add notes about this update"
                />
              </div>
              {newStatus === 'Resolved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload "After" Image</label>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setAfterImage(file);
                        setAfterPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="text-sm"
                  />
                  {afterPreview && (
                    <img src={afterPreview} alt="After preview" className="mt-3 rounded-lg max-h-48 object-cover" />
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update'}
                </button>
                <button type="button" onClick={() => setShowUpdate(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalate && (
        <EscalateModal
          problem={problem}  //entire problem object passed
          onClose={() => setShowEscalate(false)}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  );
}
