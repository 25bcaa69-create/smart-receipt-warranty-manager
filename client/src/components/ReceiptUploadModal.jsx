import React, { useState } from 'react';
import { api } from '../services/api';
import { X, UploadCloud, Sparkles, CheckCircle2, AlertCircle, FileText, Calendar, Shield, DollarSign, Tag, Hash } from 'lucide-react';

export default function ReceiptUploadModal({ isOpen, onClose, onReceiptCreated }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Step 1: Upload, Step 2: Edit & Review Data

  // Receipt Form Fields
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: 'Electronics',
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyMonths: 12,
    price: '',
    notes: '',
    receiptImageUrl: '',
    rawOcrText: '',
  });

  const categories = ['Electronics', 'Appliances', 'Furniture', 'Automotive', 'Clothing', 'Tools', 'Other'];

  if (!isOpen) return null;

  // Handle file drop or selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setError('');
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(''); // PDF document placeholder
    }
  };

  // Run Tesseract OCR scan pipeline
  const handleRunOcr = async () => {
    if (!file) {
      setError('Please select a receipt file first.');
      return;
    }

    setIsScanning(true);
    setError('');
    setScanProgress(25);
    setScanStatusText('Uploading document to secure server...');

    try {
      setTimeout(() => {
        setScanProgress(60);
        setScanStatusText('Executing Tesseract OCR pattern recognition...');
      }, 800);

      const response = await api.scanReceiptOcr(file);

      setScanProgress(100);
      setScanStatusText('OCR Extraction completed successfully!');

      if (response.extractedData) {
        setFormData({
          productName: response.extractedData.productName || 'Scanned Receipt Product',
          brand: response.extractedData.brand || 'Generic Brand',
          category: 'Electronics',
          invoiceNumber: response.extractedData.invoiceNumber || '',
          purchaseDate: response.extractedData.purchaseDate || new Date().toISOString().split('T')[0],
          warrantyMonths: response.extractedData.warrantyMonths || 12,
          price: response.extractedData.price || '',
          notes: '',
          receiptImageUrl: response.receiptImageUrl || '',
          rawOcrText: response.extractedData.rawOcrText || '',
        });
      }

      setTimeout(() => {
        setIsScanning(false);
        setStep(2); // Proceed to Edit & Save form
      }, 500);
    } catch (err) {
      console.error('OCR Error:', err);
      setIsScanning(false);
      setError(err.message || 'Failed to extract text via OCR. You can enter details manually.');
      // Fallback to step 2 with empty defaults
      setFormData((prev) => ({
        ...prev,
        receiptImageUrl: previewUrl || '',
      }));
      setStep(2);
    }
  };

  // Calculate live warranty expiration date
  const computeExpiryDate = () => {
    if (!formData.purchaseDate || !formData.warrantyMonths) return 'N/A';
    const purchase = new Date(formData.purchaseDate);
    if (isNaN(purchase.getTime())) return 'Invalid Date';
    const expiry = new Date(purchase);
    expiry.setMonth(expiry.getMonth() + parseInt(formData.warrantyMonths, 10));
    return expiry.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle final save
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.productName.trim()) {
      setError('Product Name is required.');
      return;
    }

    try {
      await api.createReceipt(formData);
      onReceiptCreated();
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to save receipt details.');
    }
  };

  const handleCloseModal = () => {
    setFile(null);
    setPreviewUrl('');
    setStep(1);
    setIsScanning(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                {step === 1 ? 'Upload Receipt & OCR Scan' : 'Review & Save Receipt Details'}
              </h2>
              <p className="text-xs text-brand-200">
                {step === 1 ? 'Supported formats: JPG, PNG, PDF (Max 10MB)' : 'Verify & edit OCR extracted warranty fields'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 text-brand-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: File Drop & OCR Trigger */
            <div className="space-y-6">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  file ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 hover:border-brand-400 bg-slate-50/60'
                }`}
              >
                <input
                  type="file"
                  id="receipt-file-input"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      className="max-h-52 mx-auto rounded-lg shadow-sm border border-slate-200 object-contain"
                    />
                    <div className="flex items-center justify-center space-x-2 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  </div>
                ) : file ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl mx-auto flex items-center justify-center">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                      <p className="text-xs text-slate-500">PDF Document ready for text extraction</p>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="receipt-file-input" className="cursor-pointer space-y-3 block">
                    <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-2xl mx-auto flex items-center justify-center transition-transform hover:scale-105">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click to upload or drag & drop receipt image/PDF
                      </p>
                      <p className="text-xs text-slate-400 mt-1">High clarity receipts yield best OCR results</p>
                    </div>
                  </label>
                )}
              </div>

              {/* Progress Indicator when scanning */}
              {isScanning && (
                <div className="space-y-2 bg-brand-50/80 border border-brand-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-800">
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 animate-spin text-brand-600" />
                      <span>{scanStatusText}</span>
                    </span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                >
                  Skip OCR & Enter Manually
                </button>

                <button
                  type="button"
                  disabled={!file || isScanning}
                  onClick={handleRunOcr}
                  className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${
                    !file || isScanning
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan with Tesseract OCR</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Review & Edit Extracted Fields Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-brand-600" />
                    <span>Product Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. MacBook Pro M3 16-inch"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Brand */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    <span>Brand</span>
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Apple"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Tag className="w-3.5 h-3.5 text-brand-600" />
                    <span>Category</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Invoice Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Hash className="w-3.5 h-3.5 text-brand-600" />
                    <span>Invoice / Order #</span>
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="e.g. INV-984214"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Purchase Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    <span>Purchase Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Warranty Period (Months) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-brand-600" />
                    <span>Warranty Duration (Months) *</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    required
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                    placeholder="e.g. 12 or 24"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Price / Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-brand-600" />
                    <span>Price Paid ($)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 1299.99"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Live Computed Expiry Preview Box */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Calculated Expiry Date</span>
                  </label>
                  <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800">
                    {computeExpiryDate()}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes / Serial Number</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Serial # C02G90XXMD6M, Purchased from official store"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ← Back to Upload
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-brand-600/30 transition-all"
                >
                  Save Receipt to Vault
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
