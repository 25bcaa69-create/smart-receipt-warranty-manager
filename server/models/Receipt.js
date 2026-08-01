const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: [true, 'Product Name is required'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Unknown Brand',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Electronics', 'Appliances', 'Furniture', 'Automotive', 'Clothing', 'Tools', 'Other'],
      default: 'Electronics',
    },
    invoiceNumber: {
      type: String,
      default: 'N/A',
      trim: true,
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase Date is required'],
    },
    warrantyMonths: {
      type: Number,
      required: [true, 'Warranty Period (months) is required'],
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    receiptImageUrl: {
      type: String,
      default: '',
    },
    rawOcrText: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    reminderSent30Days: {
      type: Boolean,
      default: false,
    },
    reminderSent7Days: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual property to calculate warranty status:
 * - 'Expired' (Red) if expiryDate < today
 * - 'Expiring Soon' (Yellow) if remaining days <= 30 days and > 0
 * - 'Active' (Green) if remaining days > 30 days
 */
receiptSchema.virtual('status').get(function () {
  if (!this.expiryDate) return 'Expired';
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays <= 30) return 'Expiring Soon';
  return 'Active';
});

// Calculate remaining days virtual
receiptSchema.virtual('daysRemaining').get(function () {
  if (!this.expiryDate) return 0;
  const now = new Date();
  const diffTime = this.expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Receipt', receiptSchema);
