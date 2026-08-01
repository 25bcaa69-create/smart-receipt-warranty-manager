const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/analytics/summary
 * @desc    Get dashboard summary statistics (total products, active, expiring soon, expired, total spent)
 * @access  Private
 */
router.get('/summary', protect, async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user._id });

    let totalProducts = receipts.length;
    let activeWarranties = 0;
    let expiringSoonWarranties = 0;
    let expiredWarranties = 0;
    let totalSpent = 0;

    receipts.forEach((r) => {
      totalSpent += r.price || 0;
      const status = r.status;
      if (status === 'Active') activeWarranties++;
      else if (status === 'Expiring Soon') expiringSoonWarranties++;
      else if (status === 'Expired') expiredWarranties++;
    });

    return res.json({
      totalProducts,
      activeWarranties,
      expiringSoonWarranties,
      expiredWarranties,
      totalSpent,
    });
  } catch (error) {
    console.error('Analytics Summary Error:', error);
    return res.status(500).json({ message: 'Error retrieving summary metrics' });
  }
});

/**
 * @route   GET /api/analytics/spending
 * @desc    Get chart data for spending by month, category breakdown, and status distribution
 * @access  Private
 */
router.get('/spending', protect, async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user._id }).sort({ purchaseDate: 1 });

    // 1. Spending breakdown by category
    const categoryTotals = {};
    // 2. Spending breakdown by month
    const monthlyTotals = {};
    // 3. Status distribution
    const statusCounts = { Active: 0, 'Expiring Soon': 0, Expired: 0 };

    receipts.forEach((r) => {
      // Category aggregation
      const cat = r.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (r.price || 0);

      // Status aggregation
      const status = r.status;
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }

      // Monthly aggregation (YYYY-MM format)
      if (r.purchaseDate) {
        const d = new Date(r.purchaseDate);
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[yearMonth] = (monthlyTotals[yearMonth] || 0) + (r.price || 0);
      }
    });

    return res.json({
      categoryBreakdown: categoryTotals,
      monthlyBreakdown: monthlyTotals,
      statusDistribution: statusCounts,
    });
  } catch (error) {
    console.error('Analytics Spending Error:', error);
    return res.status(500).json({ message: 'Error retrieving spending analytics' });
  }
});

module.exports = router;
