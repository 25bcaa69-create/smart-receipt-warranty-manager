const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initialize Nodemailer Transporter.
 * Falls back to an Ethereal test account if no custom SMTP host is provided.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate Ethereal test account for out-of-the-box zero config testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Service] Ethereal Test Mailbox created: ${testAccount.user}`);
  }

  return transporter;
};

/**
 * Send Warranty Expiry Reminder Email
 * @param {Object} params
 * @param {string} params.userEmail
 * @param {string} params.userName
 * @param {string} params.productName
 * @param {string} params.brand
 * @param {Date} params.expiryDate
 * @param {number} params.daysRemaining
 */
const sendWarrantyReminder = async ({ userEmail, userName, productName, brand, expiryDate, daysRemaining }) => {
  try {
    const mailTransporter = await getTransporter();
    const formattedExpiry = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const isUrgent = daysRemaining <= 7;
    const urgencyBadge = isUrgent
      ? `<span style="background-color: #fef2f2; color: #dc2626; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px;">URGENT: ${daysRemaining} DAYS LEFT</span>`
      : `<span style="background-color: #fffbe6; color: #d97706; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px;">${daysRemaining} DAYS REMAINING</span>`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Smart Receipt & Warranty Manager</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Warranty Expiry Alert</p>
          </div>
          
          <!-- Content Body -->
          <div style="padding: 28px;">
            <p style="font-size: 16px; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6;">
              This is a friendly reminder that the warranty for your product is expiring soon. Below are your product details:
            </p>

            <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 18px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 140px;">Product:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${productName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Brand:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${brand || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Expiration Date:</td>
                  <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${formattedExpiry}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Status:</td>
                  <td style="padding: 6px 0;">${urgencyBadge}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
              If you need to file a warranty claim or extend coverage, please locate your original receipt in your Smart Receipt Dashboard.
            </p>

            <div style="text-align: center; margin-top: 28px;">
              <a href="http://localhost:5173" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                View Receipt Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Smart Receipt & Warranty Manager. All rights reserved.
          </div>
        </div>
      </div>
    `;

    const info = await mailTransporter.sendMail({
      from: process.env.FROM_EMAIL || '"Smart Receipt Manager" <no-reply@smartreceipt.app>',
      to: userEmail,
      subject: `⚠️ Warranty Expiry Alert: ${productName} (${daysRemaining} days left)`,
      html: htmlContent,
    });

    console.log(`[Email Service] Notification sent for "${productName}" to ${userEmail}. Message ID: ${info.messageId}`);
    
    // Log test URL if using Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Service] Ethereal Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('[Email Service] Error sending reminder email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWarrantyReminder };
