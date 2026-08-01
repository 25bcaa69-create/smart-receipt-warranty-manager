/**
 * API Service Wrapper for backend REST API communication
 */
const BASE_URL = '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('smart_receipt_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth API
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name, email, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Session expired');
    return data;
  },

  // Receipts API
  async getReceipts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/receipts${queryString}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch receipts');
    return data;
  },

  async getReceiptById(id) {
    const res = await fetch(`${BASE_URL}/receipts/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch receipt');
    return data;
  },

  async scanReceiptOcr(file) {
    const formData = new FormData();
    formData.append('receiptImage', file);

    const res = await fetch(`${BASE_URL}/receipts/ocr-scan`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OCR extraction failed');
    return data;
  },

  async createReceipt(receiptData) {
    const res = await fetch(`${BASE_URL}/receipts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(receiptData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create receipt');
    return data;
  },

  async updateReceipt(id, receiptData) {
    const res = await fetch(`${BASE_URL}/receipts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(receiptData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update receipt');
    return data;
  },

  async deleteReceipt(id) {
    const res = await fetch(`${BASE_URL}/receipts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete receipt');
    return data;
  },

  // Analytics API
  async getAnalyticsSummary() {
    const res = await fetch(`${BASE_URL}/analytics/summary`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch summary metrics');
    return data;
  },

  async getSpendingAnalytics() {
    const res = await fetch(`${BASE_URL}/analytics/spending`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch spending analytics');
    return data;
  },

  // Reminders API
  async sendTestReminder(receiptId) {
    const res = await fetch(`${BASE_URL}/reminders/send-test/${receiptId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send test email reminder');
    return data;
  },

  async checkAllReminders() {
    const res = await fetch(`${BASE_URL}/reminders/check-all`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to trigger reminder check');
    return data;
  },
};
