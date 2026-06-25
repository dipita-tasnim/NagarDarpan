const nodemailer = require('nodemailer');

// Create transporter lazily so missing env vars don't crash the server at startup
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — email notifications disabled');
    return null;
  }

  // Use explicit SMTP settings — works for both @gmail.com and Google Workspace accounts
  _transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, ''), // strip spaces from app password
    },
  });

  console.log(`[Email] Transporter configured for ${process.env.EMAIL_USER}`);
  return _transporter;
}

const STATUS_COLOR = {
  'Acknowledged': '#f59e0b',
  'In Progress':  '#3b82f6',
  'Resolved':     '#10b981',
};

/**
 * Send a status-change notification to the problem reporter.
 * Silently skips if email is not configured or reporter has no email.
 */
async function sendStatusChangeEmail({ toEmail, toName, problemTitle, referenceNumber, newStatus, notes, changedByName }) {
  const transporter = getTransporter();
  if (!transporter || !toEmail) return;

  const color = STATUS_COLOR[newStatus] || '#6b7280';
  const isResolved = newStatus === 'Resolved';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
      <div style="background: #065f46; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">⚙️ Nagar Darpan</h1>
        <p style="color: #a7f3d0; margin: 4px 0 0; font-size: 13px;">Problem Status Update</p>
      </div>

      <div style="background: white; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="color: #374151; margin-top: 0;">Hello <strong>${toName || 'there'}</strong>,</p>
        <p style="color: #374151;">The status of your reported problem has been updated.</p>

        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Problem</p>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">${problemTitle}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280; font-family: monospace;">#${referenceNumber}</p>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
          <span style="background: ${color}22; color: ${color}; font-weight: 600; padding: 6px 16px; border-radius: 20px; font-size: 14px; border: 1px solid ${color}44;">
            ${newStatus}
          </span>
        </div>

        ${notes ? `<div style="border-left: 3px solid ${color}; padding: 10px 16px; background: #f9fafb; border-radius: 0 6px 6px 0; margin: 16px 0;">
          <p style="margin: 0; color: #374151; font-size: 14px;">${notes}</p>
        </div>` : ''}

        <p style="color: #6b7280; font-size: 13px;">Updated by: <strong>${changedByName || 'System'}</strong></p>

        ${isResolved ? `
        <div style="background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #065f46; font-weight: 600;">✅ Your issue has been resolved!</p>
          <p style="margin: 8px 0 0; color: #047857; font-size: 13px;">Thank you for helping improve your community.</p>
        </div>` : ''}

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">This is an automated notification from Nagar Darpan. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Nagar Darpan" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: isResolved
        ? `✅ Your problem "${problemTitle}" has been Resolved — Nagar Darpan`
        : `🔔 Status Update: "${problemTitle}" is now ${newStatus} — Nagar Darpan`,
      html,
    });
    console.log(`[Email] Sent status update to ${toEmail} (${newStatus})`);
  } catch (err) {
    // Never crash the request if email fails
    console.error('[Email] Failed to send:', err.message);
  }
}

module.exports = { sendStatusChangeEmail };
