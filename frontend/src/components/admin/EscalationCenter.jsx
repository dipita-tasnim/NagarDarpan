import { useState, useEffect } from 'react';
import { getAdminProblems, moderateProblem } from '../../api';
import toast from 'react-hot-toast';
import { FiPrinter, FiAlertOctagon, FiClock, FiChevronDown } from 'react-icons/fi';

export default function EscalationCenter() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEscalatedProblems();
  }, []);

  const fetchEscalatedProblems = async () => {
    try {
      setLoading(true);
      // We assume an escalated problem is one with status 'Escalated' or high priority
      const res = await getAdminProblems({ status: 'Escalated', limit: 100 });
      setProblems(res.data.data);
    } catch (err) {
      toast.error('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const updatePriority = async (id, priority) => {
    try {
      await moderateProblem(id, { priority });
      toast.success('Priority updated');
      fetchEscalatedProblems();
    } catch (err) {
      toast.error('Failed to update priority');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const priorityColors = {
    Low: 'bg-gray-100 text-gray-800',
    Medium: 'bg-blue-100 text-blue-800',
    High: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800 font-bold border border-red-300'
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      <div className="flex justify-between items-end mb-6 print:mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiAlertOctagon className="text-red-600" /> Escalation Center
          </h1>
          <p className="text-gray-500 text-sm mt-1 print:hidden">Manage critical issues requiring immediate authority intervention</p>
        </div>
        <button 
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg transition"
        >
          <FiPrinter /> Print / Export PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-none">
        {loading ? (
          <div className="flex justify-center py-12 print:hidden">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No escalated reports at the moment.</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-red-50/50 border-b border-red-100 print:bg-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Case Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Location & Duration</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Priority Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {problems.map((p) => {
                const daysOpen = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p.referenceNumber}</span>
                      </div>
                      <p className="font-bold text-gray-900 mt-1">{p.title}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 max-w-md print:line-clamp-none">{p.description}</p>
                      <div className="mt-2 text-xs font-medium text-gray-500 flex gap-3">
                        <span>Category: {p.category}</span>
                        <span>Support: {p.supportCount} citizens</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p className="font-medium">{p.thana}, {p.district}</p>
                      <div className="flex items-center gap-1 mt-2 text-orange-600 font-medium">
                        <FiClock size={14} /> Open for {daysOpen} days
                      </div>
                    </td>
                    <td className="px-6 py-4 print:hidden">
                      <div className="relative inline-block w-32">
                        <select
                          value={p.priority || 'Medium'}
                          onChange={(e) => updatePriority(p._id, e.target.value)}
                          className={`w-full appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer ${priorityColors[p.priority || 'Medium']}`}
                        >
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High Priority</option>
                          <option value="Critical">Critical Issue</option>
                        </select>
                        <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-current opacity-50" />
                      </div>
                    </td>
                    <td className="hidden print:table-cell px-6 py-4 font-bold">
                      {p.priority || 'Medium'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print\\:m-0 { margin: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
          #root > div > div > main > div > div {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #root > div > div > main > div > div * {
            visibility: visible;
          }
        }
      `}} />
    </div>
  );
}
