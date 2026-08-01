import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { X, Mail, Download, ExternalLink, Calendar, ShieldCheck, AlertTriangle, ShieldAlert, Tag, Hash, DollarSign, FileText } from 'lucide-react';

export default function ReceiptDetailModal({ isOpen, onClose, receipt, onEmailSent }) {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  if (!isOpen || !receipt) return null;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  // QR Code Payload JSON string
  const qrPayload = JSON.stringify({
    receiptId: receipt._id,
    product: receipt.productName,
    brand: receipt.brand,
    invoice: receipt.invoiceNumber,
    purchaseDate: receipt.purchaseDate,
    expiryDate: receipt.expiryDate,
    warrantyStatus: receipt.status,
  });

  // Handle email test reminder
  const handleSendTestEmail = async () => {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await api.sendTestReminder(receipt._id);
      setEmailStatus({
        type: 'success',
        message: res.message,
        previewUrl: res.previewUrl,
      });
      if (onEmailSent) onEmailSent();
    } catch (err) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Failed to dispatch email reminder.',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Download QR Code as PNG image
  const handleDownloadQrCode = () => {
    const svgElement = document.getElementById('receipt-qr-code-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${receipt.productName.replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {receipt.productName}
              </h2>
              <p className="text-xs text-brand-200">
                Invoice #{receipt.invoiceNumber || 'N/A'} • {receipt.brand}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-brand-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Status Alert Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
            <div className="flex items-center space-x-3">
              {receipt.status === 'Active' && (
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
              {receipt.status === 'Expiring Soon' && (
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              {receipt.status === 'Expired' && (
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Warranty Status
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {receipt.status} ({receipt.daysRemaining} days remaining)
                </span>
              </div>
            </div>

            {/* Nodemailer Email Trigger Button */}
            <button
              onClick={handleSendTestEmail}
              disabled={sendingEmail}
              className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:bg-slate-300"
            >
              <Mail className="w-4 h-4" />
              <span>{sendingEmail ? 'Sending Email...' : 'Send Email Alert'}</span>
            </button>
          </div>

          {/* Email Status Notification Box */}
          {emailStatus && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                emailStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <p className="font-bold">{emailStatus.message}</p>
              {emailStatus.previewUrl && (
                <a
                  href={emailStatus.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 font-semibold text-brand-700 hover:underline"
                >
                  <span>Open Ethereal Email Preview</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Grid Layout: Receipt Details & QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1 & 2: Key Metadata */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase">Brand</span>
                  <span className="text-sm font-bold text-slate-900 block">{receipt.brand || 'Generic'}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase">Category</span>
                  <span className="text-sm font-bold text-slate-900 block">{receipt.category}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase">Purchase Date</span>
                  <span className="text-sm font-bold text-slate-900 block">{formatDate(receipt.purchaseDate)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase">Warranty Period</span>
                  <span className="text-sm font-bold text-slate-900 block">{receipt.warrantyMonths} Months</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase">Expiration Date</span>
                  <span className="text-sm font-bold text-slate-900 block">{formatDate(receipt.expiryDate)}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 font-semibold block uppercase">Amount Paid</span>
                  <span className="text-sm font-bold text-slate-900 block">{formatCurrency(receipt.price)}</span>
                </div>
              </div>

              {receipt.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                  <span className="text-slate-400 font-semibold uppercase block">Notes & Serial #</span>
                  <p className="text-slate-700 whitespace-pre-wrap">{receipt.notes}</p>
                </div>
              )}

              {/* Receipt Image / File Preview */}
              {receipt.receiptImageUrl ? (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Uploaded Receipt Image</span>
                  <a
                    href={receipt.receiptImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block group relative overflow-hidden rounded-xl border border-slate-200"
                  >
                    <img
                      src={receipt.receiptImageUrl}
                      alt="Receipt Document"
                      className="max-h-48 w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                      Click to expand full size
                    </div>
                  </a>
                </div>
              ) : null}
            </div>

            {/* Column 3: Generated Receipt QR Code */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center justify-between text-center space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Receipt Verification QR</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Scan to verify authenticity & warranty metadata</p>
              </div>

              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 inline-block">
                <QRCodeSVG
                  id="receipt-qr-code-svg"
                  value={qrPayload}
                  size={140}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <button
                onClick={handleDownloadQrCode}
                className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
