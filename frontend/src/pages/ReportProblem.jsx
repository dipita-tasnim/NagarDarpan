import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProblem, getDivisions, getDistricts, getThanas, checkSimilarProblems, supportProblem } from '../api';
import { useAuth } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';
import SimilarIssueModal from '../components/SimilarIssueModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['Road Damage', 'Water Supply', 'Sewage', 'Street Light', 'Waste Management', 'Public Health', 'Safety', 'Other', 'Construction'];

export default function ReportProblem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [similarIssues, setSimilarIssues] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', category: '',
    division: '', district: '', thana: '',
    divisionId: '', districtId: '',
    latitude: null, longitude: null,
  });

  useEffect(() => {
    getDivisions().then((res) => setDivisions(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.divisionId) {
      setDistricts([]);
      setThanas([]);
      setForm((f) => ({ ...f, district: '', thana: '', districtId: '' }));
      getDistricts(form.divisionId).then((res) => setDistricts(res.data.data)).catch(() => {});
    }
  }, [form.divisionId]);

  useEffect(() => {
    if (form.districtId) {
      setThanas([]);
      setForm((f) => ({ ...f, thana: '' }));
      getThanas(form.districtId).then((res) => setThanas(res.data.data)).catch(() => {});
    }
  }, [form.districtId]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.thana) return;

    setLoading(true);
    try {
      const res = await checkSimilarProblems({ category: form.category, thana: form.thana });
      if (res.data.data.length > 0) {
        setSimilarIssues(res.data.data);
        setShowModal(true);
        setLoading(false);
        return;
      }
      await proceedCreate();
    } catch (err) {
      toast.error('Failed to check similar problems');
      setLoading(false);
    }
  };

  const proceedCreate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('division', form.division);
      formData.append('district', form.district);
      formData.append('thana', form.thana);
      formData.append('userName', user.name);
      formData.append('userEmail', user.email);
      if (form.latitude) formData.append('latitude', form.latitude);
      if (form.longitude) formData.append('longitude', form.longitude);
      if (image) formData.append('image', image);

      const res = await createProblem(formData);
      const refNum = res.data.data.referenceNumber;
      toast.success(`Problem reported! Reference: ${refNum}`);
      navigate(`/problems/${res.data.data.problem._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report problem');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const handleSupportExisting = async (issueId) => {
    try {
      await supportProblem(issueId);
      toast.success('Supported existing issue!');
      navigate(`/problems/${issueId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to support issue');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Report a Problem</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text" required minLength={5}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Brief title of the problem"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            required minLength={10} rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
            placeholder="Describe the problem in detail"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            required value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Area: Division → District → Thana */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division *</label>
            <select
              required value={form.divisionId}
              onChange={(e) => {
                const div = divisions.find((d) => d._id === e.target.value);
                setForm({ ...form, divisionId: e.target.value, division: div?.name || '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Select</option>
              {divisions.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
            <select
              required value={form.districtId}
              onChange={(e) => {
                const dist = districts.find((d) => d._id === e.target.value);
                setForm({ ...form, districtId: e.target.value, district: dist?.name || '' });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={!form.divisionId}
            >
              <option value="">Select</option>
              {districts.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thana *</label>
            <select
              required value={form.thana}
              onChange={(e) => setForm({ ...form, thana: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={!form.districtId}
            >
              <option value="">Select</option>
              {thanas.map((t) => <option key={t._id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Pin Location on Map */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pin Location on Map (optional)</label>
          <LocationPicker
            value={form.latitude ? { lat: form.latitude, lng: form.longitude } : null}
            onChange={({ lat, lng }) => setForm({ ...form, latitude: lat, longitude: lng })}
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload "Before" Image (optional)</label>
          <input type="file" accept="image/*" onChange={handleImage} className="text-sm" />
          {preview && (
            <img src={preview} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />
          )}
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>

      {showModal && (
        <SimilarIssueModal
          matches={similarIssues}
          onClose={() => setShowModal(false)}
          onSupport={handleSupportExisting}
          onProceed={proceedCreate}
        />
      )}
    </div>
  );
}
