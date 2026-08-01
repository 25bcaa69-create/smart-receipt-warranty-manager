import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DashboardStats from '../components/DashboardStats';
import EmailReminderNotification from '../components/EmailReminderNotification';
import ReceiptTable from '../components/ReceiptTable';

export default function DashboardPage({ onOpenUploadModal, onSelectReceipt }) {
  const [summary, setSummary] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumData, recData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getReceipts(),
      ]);
      setSummary(sumData);
      setReceipts(recData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteReceipt = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt record?')) {
      try {
        await api.deleteReceipt(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Error deleting receipt');
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Metric Stat Cards */}
      <DashboardStats
        summary={summary}
        onFilterByStatus={(status) => setSelectedStatusFilter(status)}
      />

      {/* Email Expiry Reminder Engine Widget */}
      <EmailReminderNotification />

      {/* Main Receipts Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Product & Warranty Directory
            </h2>
            <p className="text-xs text-slate-500">
              Filter by warranty lifecycle status, brand, or search by invoice number.
            </p>
          </div>
        </div>

        <ReceiptTable
          receipts={receipts}
          onSelectReceipt={onSelectReceipt}
          onDeleteReceipt={handleDeleteReceipt}
          selectedStatusFilter={selectedStatusFilter}
          setSelectedStatusFilter={setSelectedStatusFilter}
        />
      </div>
    </div>
  );
}
