const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Receipt = require('../models/Receipt');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { processImageOcr, parseOcrText } = require('../services/ocrService');

/**
 * Helper to compute expiry date from purchase date and warranty months
 */
const calculateExpiryDate = (purchaseDateStr, warrantyMonths) => {
  const purchaseDate = new Date(purchaseDateStr);
  const expiryDate = new Date(purchaseDate);
  expiryDate.setMonth(expiryDate.getMonth() + parseInt(warrantyMonths, 10));
  return expiryDate;
};

/**
 * @route   GET /api/receipts
 * @desc    Get all user receipts with filtering & searching
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, category, sortBy } = req.query;

    let query = { user: req.user._id };

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search filter (Product Name, Brand, Invoice Number)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { productName: searchRegex },
        { brand: searchRegex },
        { invoiceNumber: searchRegex },
        { notes: searchRegex },
      ];
    }

    // Determine sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'purchaseDate_desc') sortOptions = { purchaseDate: -1 };
    if (sortBy === 'purchaseDate_asc') sortOptions = { purchaseDate: 1 };
    if (sortBy === 'expiryDate_asc') sortOptions = { expiryDate: 1 };
    if (sortBy === 'price_desc') sortOptions = { price: -1 };

    let receipts = await Receipt.find(query).sort(sortOptions);

    // Filter by computed status (Active, Expiring Soon, Expired)
    if (status && status !== 'All') {
      receipts = receipts.filter((item) => item.status === status);
    }

    return res.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return res.status(500).json({ message: 'Server error fetching receipts' });
  }
});

/**
 * @route   POST /api/receipts/ocr-scan
 * @desc    Upload image/PDF receipt & extract data using Tesseract.js OCR
 * @access  Private
 */
router.post('/ocr-scan', protect, upload.single('receiptImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No receipt file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const filePath = req.file.path;

    console.log(`Processing OCR for file: ${filePath}`);
    const ocrResult = await processImageOcr(filePath);

    return res.json({
      success: true,
      receiptImageUrl: fileUrl,
      extractedData: {
        productName: ocrResult.data.productName,
        brand: ocrResult.data.brand,
        purchaseDate: ocrResult.data.purchaseDate,
        warrantyMonths: ocrResult.data.warrantyMonths,
        invoiceNumber: ocrResult.data.invoiceNumber,
        price: ocrResult.data.price,
        rawOcrText: ocrResult.data.rawOcrText,
      },
    });
  } catch (error) {
    console.error('OCR Endpoint Error:', error);
    return res.status(500).json({ message: error.message || 'Error processing OCR for receipt' });
  }
});

/**
 * @route   POST /api/receipts
 * @desc    Create new receipt entry
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  try {
    const {
      productName,
      brand,
      category,
      invoiceNumber,
      purchaseDate,
      warrantyMonths,
      price,
      receiptImageUrl,
      rawOcrText,
      notes,
    } = req.body;

    if (!productName || !purchaseDate || warrantyMonths === undefined) {
      return res.status(400).json({ message: 'Product name, purchase date, and warranty period are required' });
    }

    const computedExpiryDate = calculateExpiryDate(purchaseDate, warrantyMonths);

    const receipt = await Receipt.create({
      user: req.user._id,
      productName,
      brand: brand || 'Generic Brand',
      category: category || 'Electronics',
      invoiceNumber: invoiceNumber || 'N/A',
      purchaseDate,
      warrantyMonths: parseInt(warrantyMonths, 10),
      expiryDate: computedExpiryDate,
      price: parseFloat(price) || 0,
      receiptImageUrl: receiptImageUrl || '',
      rawOcrText: rawOcrText || '',
      notes: notes || '',
    });

    return res.status(201).json(receipt);
  } catch (error) {
    console.error('Error creating receipt:', error);
    return res.status(500).json({ message: error.message || 'Error saving receipt' });
  }
});

/**
 * @route   GET /api/receipts/:id
 * @desc    Get single receipt details
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, user: req.user._id });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    return res.json(receipt);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving receipt details' });
  }
});

/**
 * @route   PUT /api/receipts/:id
 * @desc    Update receipt details
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, user: req.user._id });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const {
      productName,
      brand,
      category,
      invoiceNumber,
      purchaseDate,
      warrantyMonths,
      price,
      receiptImageUrl,
      notes,
    } = req.body;

    receipt.productName = productName !== undefined ? productName : receipt.productName;
    receipt.brand = brand !== undefined ? brand : receipt.brand;
    receipt.category = category !== undefined ? category : receipt.category;
    receipt.invoiceNumber = invoiceNumber !== undefined ? invoiceNumber : receipt.invoiceNumber;
    receipt.price = price !== undefined ? parseFloat(price) : receipt.price;
    receipt.receiptImageUrl = receiptImageUrl !== undefined ? receiptImageUrl : receipt.receiptImageUrl;
    receipt.notes = notes !== undefined ? notes : receipt.notes;

    if (purchaseDate || warrantyMonths !== undefined) {
      receipt.purchaseDate = purchaseDate || receipt.purchaseDate;
      receipt.warrantyMonths = warrantyMonths !== undefined ? parseInt(warrantyMonths, 10) : receipt.warrantyMonths;
      receipt.expiryDate = calculateExpiryDate(receipt.purchaseDate, receipt.warrantyMonths);
    }

    const updatedReceipt = await receipt.save();
    return res.json(updatedReceipt);
  } catch (error) {
    console.error('Error updating receipt:', error);
    return res.status(500).json({ message: 'Error updating receipt' });
  }
});

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete receipt entry and image file
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, user: req.user._id });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Remove uploaded file if exists
    if (receipt.receiptImageUrl) {
      const fileName = path.basename(receipt.receiptImageUrl);
      const filePath = path.join(__dirname, '../uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await receipt.deleteOne();
    return res.json({ message: 'Receipt deleted successfully' });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return res.status(500).json({ message: 'Error deleting receipt' });
  }
});

module.exports = router;
