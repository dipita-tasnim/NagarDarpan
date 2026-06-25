import { useState } from 'react';
import { jsPDF } from 'jspdf';

const AUTHORITY_CONTACTS = {
  Dhaka: { name: 'Dhaka South City Corporation', phone: '02-55167751', email: 'info@dscc.gov.bd' },
  Chattogram: { name: 'Chattogram City Corporation', phone: '031-610085', email: 'info@ccc.gov.bd' },
  Rajshahi: { name: 'Rajshahi City Corporation', phone: '0721-775001', email: 'info@rajshahicity.gov.bd' },
  Khulna: { name: 'Khulna City Corporation', phone: '041-720045', email: 'info@khulnacity.gov.bd' },
  Sylhet: { name: 'Sylhet City Corporation', phone: '0821-714623', email: 'info@sylhetcity.gov.bd' },
  Barishal: { name: 'Barishal City Corporation', phone: '0431-62547', email: 'info@barishalcity.gov.bd' },
  Rangpur: { name: 'Rangpur City Corporation', phone: '0521-63456', email: 'info@rangpurcity.gov.bd' },
  Mymensingh: { name: 'Mymensingh City Corporation', phone: '091-66777', email: 'info@mymensinghcity.gov.bd' },
};

function getComplaintText(problem) {
  const date = new Date(problem.submissionTime).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(
    `${problem.thana}, ${problem.district}, ${problem.division}`
  )}`;

  return `
OFFICIAL COMPLAINT DOCUMENT
============================
Nagar Darpan - Community Issue Escalation

Greetings
==================================
Hello, From Nagar Darpan Community
==================================

Reference Number: ${problem.referenceNumber}
Date of Report: ${date}
Current Status: ${problem.status}
Escalation Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

ISSUE DETAILS
-----------------------------
Title: ${problem.title}
Category: ${problem.category}
Description: ${problem.description}

LOCATION
-----------------------------
Division: ${problem.division}
District: ${problem.district}
Thana/Upazila: ${problem.thana}
Google Maps: ${mapsLink}

COMMUNITY SUPPORT
-----------------------------
Total Supporters: ${problem.supportCount || 0}

This issue has been escalated by the community through the Nagar Darpan platform due to ${
    (problem.supportCount || 0) >= 2 ? 'significant community support' : 'remaining unresolved for an extended period'
  }. We respectfully request prompt attention and resolution.

Submitted via Nagar Darpan - নগর দর্পণ
`.trim();
}

function generatePDF(problem) {
  const doc = new jsPDF();
  const margin = 20;
  let y = 20;

  const addLine = (text, fontSize = 11, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, 170);
    lines.forEach((line) => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.text(line, margin, y);
      y += fontSize * 0.5 + 2;
    });
  };

  const addGap = (gap = 4) => { y += gap; };

  // Header
  addLine('OFFICIAL COMPLAINT DOCUMENT', 16, true);
  addGap(2);
  addLine('Nagar Darpan - Community Issue Escalation', 10);
  addLine('Greetings', 14, true);
  
  addGap(6);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  y += 8;

  // Reference info
  addLine(`Reference Number: ${problem.referenceNumber}`, 11, true);
  const date = new Date(problem.submissionTime).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  addLine(`Date of Report: ${date}`);
  addLine(`Current Status: ${problem.status}`);
  addLine(`Escalation Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  addGap(6);

  // Issue details
  addLine('ISSUE DETAILS', 13, true);
  addGap(2);
  addLine(`Title: ${problem.title}`);
  addLine(`Category: ${problem.category}`);
  addGap(2);
  addLine('Description:');
  addLine(problem.description);
  addGap(6);

  // Location
  addLine('LOCATION', 13, true);
  addGap(2);
  addLine(`Division: ${problem.division}`);
  addLine(`District: ${problem.district}`);
  addLine(`Thana/Upazila: ${problem.thana}`);
  const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(
    `${problem.thana}, ${problem.district}, ${problem.division}`
  )}`;
  addLine(`Google Maps: ${mapsLink}`);
  addGap(6);

  // Support
  addLine('COMMUNITY SUPPORT', 13, true);
  addGap(2);
  addLine(`Total Supporters: ${problem.supportCount || 0}`);
  addGap(6);

  // Footer note
  const reason = (problem.supportCount || 0) >= 2
    ? 'significant community support'
    : 'remaining unresolved for an extended period';
  addLine(
    `This issue has been escalated by the community through the Nagar Darpan platform due to ${reason}. We respectfully request prompt attention and resolution.`
  );
  addGap(8);
  addLine('Submitted via Nagar Darpan', 10);

  doc.save(`Complaint_${problem.referenceNumber}.pdf`);
}

export default function EscalateModal({ problem, onClose, onEscalate }) {
  const [escalating, setEscalating] = useState(false);
  const [copied, setCopied] = useState(false);

  const authority = AUTHORITY_CONTACTS[problem.division] || {
    name: 'Local Ward Councillor Office',
    phone: 'Contact your local ward councillor',
    email: 'N/A',
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      await onEscalate();
    } finally {
      setEscalating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getComplaintText(problem));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    generatePDF(problem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center z-10">
          <h3 className="text-xl font-bold text-gray-800">Escalate Issue</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Problem summary */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-800 mb-1">{problem.title}</h4>
            <div className="text-sm text-emerald-700 space-y-0.5">
              <p>Ref: <span className="font-mono">{problem.referenceNumber}</span></p>
              <p>Location: {problem.division} → {problem.district} → {problem.thana}</p>
              <p>Supporters: {problem.supportCount || 0}</p>
              <p>Status: {problem.status}</p>
            </div>
          </div>

          {/* Authority contact */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Local Authority Contact</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><span className="font-medium">Authority:</span> {authority.name}</p>
              <p><span className="font-medium">Phone:</span> {authority.phone}</p>
              <p><span className="font-medium">Email:</span> {authority.email}</p>
            </div>
          </div>

          {/* Complaint preview */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Complaint Document Preview</h4>
            <pre className="bg-gray-50 border rounded-lg p-4 text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
              {getComplaintText(problem)}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              📄 Download PDF
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              {copied ? '✅ Copied!' : '📋 Copy Text'}
            </button>
          </div>

          {/* Escalation confirmation */}
          {!problem.escalated && (
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Clicking "Confirm Escalation" will officially mark this issue as escalated and add it to the problem timeline.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleEscalate}
                  disabled={escalating}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 font-medium"
                >
                  {escalating ? 'Escalating...' : '⚠️ Confirm Escalation'}
                </button>
                <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {problem.escalated && (
            <div className="border-t pt-4">
              <div className="bg-orange-50 text-orange-800 rounded-lg p-3 text-sm">
                This issue was escalated on {new Date(problem.escalatedAt).toLocaleDateString()}. You can still download the complaint document or copy the text.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
