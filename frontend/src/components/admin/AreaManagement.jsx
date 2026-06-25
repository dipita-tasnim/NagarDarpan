import { useState, useEffect } from 'react';
import { getDivisions, getDistricts, getThanas, createDivision, createDistrict, createThana } from '../../api';
import toast from 'react-hot-toast';
import { FiMapPin, FiPlus } from 'react-icons/fi';

export default function AreaManagement() {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  
  const [activeTab, setActiveTab] = useState('divisions');
  const [loading, setLoading] = useState(false);

  // Forms
  const [divName, setDivName] = useState('');
  const [divCode, setDivCode] = useState('');
  
  const [distName, setDistName] = useState('');
  const [distCode, setDistCode] = useState('');
  const [distDivId, setDistDivId] = useState('');
  
  const [thanaName, setThanaName] = useState('');
  const [thanaCode, setThanaCode] = useState('');
  const [thanaDistId, setThanaDistId] = useState('');
  const [thanaDivId, setThanaDivId] = useState(''); // Just for UI filtering

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const res = await getDivisions();
      setDivisions(res.data.data);
    } catch (err) { }
    finally { setLoading(false); }
  };

  const handleDivChangeForThana = async (e) => {
    const divId = e.target.value;
    setThanaDivId(divId);
    setThanaDistId('');
    if (divId) {
      const res = await getDistricts(divId);
      setDistricts(res.data.data);
    }
  };

  const handleAddDivision = async (e) => {
    e.preventDefault();
    try {
      await createDivision({ name: divName, code: divCode });
      toast.success('Division added');
      setDivName(''); setDivCode('');
      fetchDivisions();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleAddDistrict = async (e) => {
    e.preventDefault();
    try {
      await createDistrict({ name: distName, code: distCode, division: distDivId });
      toast.success('District added');
      setDistName(''); setDistCode('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleAddThana = async (e) => {
    e.preventDefault();
    try {
      await createThana({ name: thanaName, code: thanaCode, district: thanaDistId });
      toast.success('Thana added');
      setThanaName(''); setThanaCode('');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Area Management</h1>
        <p className="text-gray-500 text-sm mt-1">Manage geographic boundaries and locations for the platform</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('divisions')} className={`px-4 py-2 font-medium ${activeTab === 'divisions' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Divisions</button>
        <button onClick={() => setActiveTab('districts')} className={`px-4 py-2 font-medium ${activeTab === 'districts' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Districts</button>
        <button onClick={() => setActiveTab('thanas')} className={`px-4 py-2 font-medium ${activeTab === 'thanas' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-gray-500'}`}>Thanas / Upazilas</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'divisions' && (
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiMapPin /> Add New Division</h3>
            <form onSubmit={handleAddDivision} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division Name</label>
                <input required type="text" value={divName} onChange={e => setDivName(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Dhaka" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Division Code</label>
                <input required type="text" value={divCode} onChange={e => setDivCode(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" placeholder="e.g. DIV_DHAKA" />
              </div>
              <button type="submit" className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"><FiPlus /> Add Division</button>
            </form>
          </div>
        )}

        {activeTab === 'districts' && (
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiMapPin /> Add New District</h3>
            <form onSubmit={handleAddDistrict} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent Division</label>
                <select required value={distDivId} onChange={e => setDistDivId(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select Division...</option>
                  {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District Name</label>
                <input required type="text" value={distName} onChange={e => setDistName(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Gazipur" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District Code</label>
                <input required type="text" value={distCode} onChange={e => setDistCode(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. DIST_GAZIPUR" />
              </div>
              <button type="submit" className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"><FiPlus /> Add District</button>
            </form>
          </div>
        )}

        {activeTab === 'thanas' && (
          <div className="max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><FiMapPin /> Add New Thana / Upazila</h3>
            <form onSubmit={handleAddThana} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Division First</label>
                <select required value={thanaDivId} onChange={handleDivChangeForThana} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500">
                  <option value="">Select Division...</option>
                  {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Parent District</label>
                <select required value={thanaDistId} onChange={e => setThanaDistId(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500" disabled={!thanaDivId}>
                  <option value="">Select District...</option>
                  {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thana Name</label>
                <input required type="text" value={thanaName} onChange={e => setThanaName(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. Tongi" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thana Code</label>
                <input required type="text" value={thanaCode} onChange={e => setThanaCode(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. THANA_TONGI" />
              </div>
              <button type="submit" className="w-full flex justify-center items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"><FiPlus /> Add Thana</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
