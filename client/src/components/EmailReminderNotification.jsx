import React, { useState } from 'react';
import { api } from '../services/api';
import { Bell, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';

export default function EmailReminderNotification() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunScan = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.checkAllReminders();
      setResult({
        type: 'success',
        message: res.message,
        details: res.details || [],
      });
    } catch (err) {
      setResult({
        type: 'error',
        message: err.message || 'Failed to scan for expiring warranties.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-brand-50 to-indigo-50/60 rounded-2xl p-5 border border-brand-200/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-600/20">
          <Bell className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900">Automated Expiry Email Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Scans all active receipts for 30-day and 7-day expiration thresholds and sends formatted Nodemailer notifications.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        <button
          onClick={handleRunScan}
          disabled={loading}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-brand-700 border border-brand-300 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Scanning Database...' : 'Run Scanner Now'}</span>
        </button>
      </div>

      {result && (
        <div className="w-full mt-2 p-3 bg-white rounded-xl border border-brand-200 text-xs text-slate-700 space-y-1">
          <div className="flex items-center space-x-1.5 font-bold text-brand-800">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{result.message}</span>
          </div>
          {result.details && result.details.length > 0 && (
            <ul className="pl-5 list-disc text-[11px] text-slate-600 space-y-0.5">
              {result.details.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
