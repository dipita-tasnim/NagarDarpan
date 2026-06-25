import React from 'react';

export default function SimilarIssueModal({ matches, onClose, onSupport, onProceed }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Similar Unresolved Issues Found</h2>
        <p className="text-sm text-gray-600 mb-4">
          Before creating a new report, please check if someone has already reported the same issue in your area. Supporting an existing issue helps prioritize it faster!
        </p>
        
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-6">
          {matches.map((issue) => (
            <div key={issue._id} className="border rounded-lg p-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">{issue.title}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-mono bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded mr-2">#{issue.referenceNumber}</span>
                  👍 {issue.supportCount || 0} Supports
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSupport(issue._id)}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                I face this too
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition"
          >
            My issue is different (Proceed)
          </button>
        </div>
      </div>
    </div>
  );
}
