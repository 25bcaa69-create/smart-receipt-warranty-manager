import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, QrCode, Trash2, Eye, FileText, Calendar, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ReceiptTable({ receipts, onSelectReceipt, onDeleteReceipt, selectedStatusFilter, setSelectedStatusFilter }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('purchaseDate_desc');

  const categories = ['All', 'Electronics', 'Appliances', 'Furniture', 'Automotive', 'Clothing', 'Tools', 'Other'];

  // Client-side search and filtering
  const filteredReceipts = receipts.filter((item) => {
    // Search query check
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.productName.toLowerCase().includes(query) ||
      (item.brand && item.brand.toLowerCase().includes(query)) ||
      (item.invoiceNumber && item.invoiceNumber.toLowerCase().includes(query));

    // Status filter check
    const matchesStatus = selectedStatusFilter === 'All' || item.status === selectedStatusFilter;

    // Category filter check
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Client-side sorting
  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    if (sortBy === 'purchaseDate_desc') {
      return new Date(b.purchaseDate) - new Date(a.purchaseDate);
    }
    if (sortBy === 'purchaseDate_asc') {
      return new Date(a.purchaseDate) - new Date(b.purchaseDate);
    }
    if (sortBy === 'expiryDate_asc') {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    }
    if (sortBy === 'price_desc') {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  // Format status badge helper
  const getStatusBadge = (status, daysRemaining) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active ({daysRemaining}d)</span>
        </span>
      );
    }
    if (status === 'Expiring Soon') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Expiring Soon ({daysRemaining}d)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        <span>Expired</span>
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
      
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, brand, or invoice #..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {['All', 'Active', 'Expiring Soon', 'Expired'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedStatusFilter === st
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-1 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xl text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="purchaseDate_desc">Newest Purchase</option>
              <option value="purchaseDate_asc">Oldest Purchase</option>
              <option value="expiryDate_asc">Expiring Soonest</option>
              <option value="price_desc">Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 text-xs uppercase font-semibold tracking-wider">
              <th className="py-3.5 px-4 rounded-l-xl">Product</th>
              <th className="py-3.5 px-4">Brand & Category</th>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Purchase Date</th>
              <th className="py-3.5 px-4">Warranty Expiry</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedReceipts.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-3">
                    <FileText className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">No receipts found</p>
                    <p className="text-xs text-slate-400">
                      Try adjusting your search filters or upload your first product receipt.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedReceipts.map((item) => (
                <tr
                  key={item._id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectReceipt(item)}
                >
                  {/* Product Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {item.brand ? item.brand.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <span className="truncate max-w-[200px]">{item.productName}</span>
                    </div>
                  </td>

                  {/* Brand & Category */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    <span className="font-semibold text-slate-800 block">{item.brand || 'Generic'}</span>
                    <span className="text-slate-400">{item.category}</span>
                  </td>

                  {/* Invoice # */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {item.invoiceNumber || 'N/A'}
                  </td>

                  {/* Purchase Date */}
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {formatDate(item.purchaseDate)}
                  </td>

                  {/* Warranty Status & Expiry */}
                  <td className="py-3.5 px-4 space-y-1">
                    <div>{getStatusBadge(item.status, item.daysRemaining)}</div>
                    <span className="text-[11px] text-slate-400 block">
                      Expires: {formatDate(item.expiryDate)}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {formatCurrency(item.price)}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectReceipt(item)}
                        title="View Details & QR Code"
                        className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteReceipt(item._id)}
                        title="Delete Receipt"
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
