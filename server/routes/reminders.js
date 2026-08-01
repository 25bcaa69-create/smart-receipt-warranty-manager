const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendWarrantyReminder } = require('../services/emailService');

/**
 * Core function to scan database for warranties expiring within 30 days and 7 days
 * and dispatch email reminders via Nodemailer.
 */
const checkAndSendExpiringReminders = async () => {
  try {
    const now = new Date();
    const receipts = await Receipt.find({}).populate('user', 'name email');

    let sentCount = 0;
    let logs = [];

    for (const receipt of receipts) {
      if (!receipt.user || !receipt.user.email) continue;

      const diffTime = receipt.expiryDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 30-day reminder logic
      if (diffDays <= 30 && diffDays > 7 && !receipt.reminderSent30Days) {
        const result = await sendWarrantyReminder({
          userEmail: receipt.user.email,
          userName: receipt.user.name,
          productName: receipt.productName,
          brand: receipt.brand,
          expiryDate: receipt.expiryDate,
          daysRemaining: diffDays,
        });

        if (result.success) {
          receipt.reminderSent30Days = true;
          await receipt.save();
          sentCount++;
          logs.push(`Sent 30-day alert for "${receipt.productName}" to ${receipt.user.email}`);
        }
      }

      // 7-day reminder logic
      if (diffDays <= 7 && diffDays >= 0 && !receipt.reminderSent7Days) {
        const result = await sendWarrantyReminder({
          userEmail: receipt.user.email,
          userName: receipt.user.name,
          productName: receipt.productName,
          brand: receipt.brand,
          expiryDate: receipt.expiryDate,
          daysRemaining: diffDays,
        });

        if (result.success) {
          receipt.reminderSent7Days = true;
          await receipt.save();
          sentCount++;
          logs.push(`Sent 7-day urgent alert for "${receipt.productName}" to ${receipt.user.email}`);
        }
      }
    }

    return { sentCount, logs };
  } catch (error) {
    console.error('Error in checkAndSendExpiringReminders:', error);
    throw error;
  }
};

/**
 * @route   POST /api/reminders/check-all
 * @desc    Automated or manual check for all expiring warranties across the database
 * @access  Private
 */
router.post('/check-all', protect, async (req, res) => {
  try {
    const summary = await checkAndSendExpiringReminders();
    return res.json({
      message: `Warranty scanner check completed. ${summary.sentCount} email notifications processed.`,
      details: summary.logs,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error running warranty reminder scanner' });
  }
});

/**
 * @route   POST /api/reminders/send-test/:receiptId
 * @desc    Send an immediate test email reminder for a specific receipt to the logged-in user
 * @access  Private
 */
router.post('/send-test/:receiptId', protect, async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.receiptId, user: req.user._id });
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const daysRemaining = receipt.daysRemaining;

    const result = await sendWarrantyReminder({
      userEmail: req.user.email,
      userName: req.user.name,
      productName: receipt.productName,
      brand: receipt.brand,
      expiryDate: receipt.expiryDate,
      daysRemaining: daysRemaining,
    });

    if (result.success) {
      return res.json({
        message: `Email reminder sent successfully to ${req.user.email}`,
        previewUrl: result.previewUrl || null,
      });
    } else {
      return res.status(500).json({ message: `Failed to send email: ${result.error}` });
    }
  } catch (error) {
    console.error('Error sending test reminder email:', error);
    return res.status(500).json({ message: error.message || 'Error processing email reminder request' });
  }
});

module.exports = { router, checkAndSendExpiringReminders };
