# 🛡️ Smart Receipt & Warranty Manager

A full-stack MERN application built with **React**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB**. Designed to digitize receipts, automate product warranty tracking, perform Tesseract.js OCR text extraction, generate verification QR codes, send email notifications, and render spending analytics.

---

## 🌟 Key Features

1. **User Authentication & Authorization**:
   - Secure Registration & Login using JWT tokens and bcrypt password hashing.
   - User-isolated receipt vault ensuring data privacy.

2. **Smart OCR Receipt Scanner (Tesseract.js)**:
   - Upload receipt images (`JPG`, `PNG`) or PDF documents.
   - Automated text scanning extracts Product Name, Brand, Invoice Number, Purchase Date, Warranty Period, and Price.
   - Interactive Form allows users to review and refine extracted details before saving.

3. **Automated Expiry & Color-Coded Status Badges**:
   - Automatically computes warranty expiration date (`purchaseDate` + `warrantyMonths`).
   - Color-coded badges:
     - 🟢 **Green (Active)**: Expiry > 30 days.
     - 🟡 **Yellow (Expiring Soon)**: Expiry within 30 days.
     - 🔴 **Red (Expired)**: Warranty date passed.

4. **Searchable & Filterable Receipt Directory**:
   - Instant search across product name, brand, or invoice number.
   - Filter by warranty lifecycle status or product category (Electronics, Appliances, Furniture, etc.).
   - Sorting by purchase date, expiry date, or price.

5. **Automated Email Reminders (Nodemailer)**:
   - Scans active assets for 30-day and 7-day expiration windows.
   - Dispatches formatted HTML alert emails.
   - Out-of-the-box **Ethereal Test Mailbox** support with instant preview links.

6. **Financial & Warranty Analytics (Chart.js)**:
   - Monthly expenditure bar chart.
   - Category spending breakdown doughnut chart.
   - Warranty health distribution pie chart.

7. **Receipt QR Code Generation**:
   - Generates unique QR codes for every receipt item.
   - View modal with quick image download button for verification scanning.

8. **Modern Blue & White Aesthetics**:
   - Glassmorphic navigation header, crisp cards, subtle micro-animations, and responsive layout for desktop and mobile devices.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **MongoDB**: Local MongoDB instance or MongoDB Atlas connection string. If omitted, the app automatically initializes an **In-Memory MongoDB Server** for zero-setup execution!

### Installation

1. **Navigate to project directory**:
   ```powershell
   cd C:\Users\Lenovo\.gemini\antigravity-ide\scratch\smart-receipt-warranty-manager
   ```

2. **Install Server & Client Dependencies**:
   ```powershell
   npm run install:all
   ```

3. **(Optional) Seed Sample Data**:
   To populate demo receipts and warranties:
   ```powershell
   npm run seed
   ```
   *Default Demo Login Credentials:*
   - **Email**: `demo@smartreceipt.app`
   - **Password**: `password123`

---

## 🏃 Running the Application

### Option A: Run Server & Client Simultaneously (Two Terminals)

**Terminal 1 (Backend API Server)**:
```powershell
cd server
npm run dev
```
*Backend API will run at `http://localhost:5000`*

**Terminal 2 (Frontend React Vite Client)**:
```powershell
cd client
npm run dev
```
*Frontend UI will open at `http://localhost:5173`*

---

## 📂 Project Structure

```
smart-receipt-warranty-manager/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection + Memory Server fallback
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── upload.js             # Multer receipt upload handling
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Receipt.js            # Receipt & computed warranty status schema
│   ├── routes/
│   │   ├── auth.js               # Auth REST endpoints
│   │   ├── receipts.js           # Receipt CRUD & Tesseract OCR endpoints
│   │   ├── analytics.js          # Spending & status metrics endpoints
│   │   └── reminders.js          # Nodemailer email alert triggers
│   ├── services/
│   │   ├── emailService.js       # Nodemailer HTML template renderer
│   │   └── ocrService.js         # Tesseract.js pattern matching logic
│   ├── seed.js                   # Sample demo data script
│   └── server.js                 # Express server entry point
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Top header & mobile navigation
    │   │   ├── DashboardStats.jsx# Metric cards & spending total
    │   │   ├── ReceiptUploadModal.jsx # OCR scanner & edit form
    │   │   ├── ReceiptTable.jsx  # Searchable, color-coded table
    │   │   ├── ReceiptDetailModal.jsx # Detail viewer & QR code generator
    │   │   ├── AnalyticsCharts.jsx # Chart.js charts
    │   │   └── EmailReminderNotification.jsx # Email alert test widget
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── DashboardPage.jsx
    │   │   ├── ReceiptsPage.jsx
    │   │   ├── AnalyticsPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── services/
    │   │   └── api.js            # Fetch API client wrapper
    │   ├── App.jsx
    │   ├── index.css             # Tailwind v3 CSS & glassmorphic utilities
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes |
| `GET` | `/api/receipts` | List all receipts (supports search & filter) | Yes |
| `POST` | `/api/receipts/ocr-scan` | Upload file & extract text via Tesseract.js | Yes |
| `POST` | `/api/receipts` | Create new receipt entry | Yes |
| `PUT` | `/api/receipts/:id` | Update existing receipt details | Yes |
| `DELETE` | `/api/receipts/:id` | Delete receipt & remove file asset | Yes |
| `GET` | `/api/analytics/summary` | Get metric card totals | Yes |
| `GET` | `/api/analytics/spending` | Get monthly & category breakdown for Chart.js | Yes |
| `POST` | `/api/reminders/send-test/:id` | Send instant test email reminder | Yes |
| `POST` | `/api/reminders/check-all` | Scan database for 30d & 7d expiring assets | Yes |

---

## 📄 License
MIT License. Created for Smart Receipt & Warranty Management.
