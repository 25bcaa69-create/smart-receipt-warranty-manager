import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ReceiptTable from '../components/ReceiptTable';
import { PlusCircle, FileText } from 'lucide-react';

export default function ReceiptsPage({ onOpenUploadModal, onSelectReceipt }) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await api.getReceipts();
      setReceipts(data);
    } catch (err) {
      console.error('Error loading receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleDeleteReceipt = async (id) => {
    if (window.confirm('Are you sure you want to delete this receipt record?')) {
      try {
        await api.deleteReceipt(id);
        fetchReceipts();
      } catch (err) {
        alert(err.message || 'Error deleting receipt');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Receipts Vault</h1>
            <p className="text-xs text-slate-500">
              Manage your scanned invoices, warranty periods, and original purchase documents.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Receipt</span>
        </button>
      </div>

      {/* Receipts Table */}
      <ReceiptTable
        receipts={receipts}
        onSelectReceipt={onSelectReceipt}
        onDeleteReceipt={handleDeleteReceipt}
        selectedStatusFilter={selectedStatusFilter}
        setSelectedStatusFilter={setSelectedStatusFilter}
      />
    </div>
  );
}
