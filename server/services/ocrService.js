const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Extract structured information from raw OCR text using pattern matching algorithms.
 * @param {string} text 
 * @returns {Object} Extracted fields
 */
const parseOcrText = (text) => {
  if (!text) {
    return {
      productName: '',
      brand: '',
      purchaseDate: '',
      warrantyMonths: 12,
      invoiceNumber: '',
      price: 0,
      rawOcrText: '',
    };
  }

  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  // 1. Extract Invoice / Receipt Number
  let invoiceNumber = '';
  const invRegex = /(?:invoice|inv|receipt|ref|bill|doc|#|no\.?)\s*[:#\-]?\s*([A-Z0-9\-]{4,20})/i;
  for (const line of lines) {
    const match = line.match(invRegex);
    if (match && match[1]) {
      invoiceNumber = match[1];
      break;
    }
  }

  // 2. Extract Purchase Date (YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, Month DD, YYYY)
  let purchaseDate = new Date().toISOString().split('T')[0];
  const dateRegexes = [
    /\b(20\d{2}[-\/.](?:0[1-9]|1[0-2])[-\/.](?:0[1-9]|[12]\d|3[01]))\b/, // 2024-05-15
    /\b((?:0[1-9]|1[0-2])[-\/.](?:0[1-9]|[12]\d|3[01])[-\/.](?:20)?\d{2})\b/, // 05/15/2024
    /\b((?:0[1-9]|[12]\d|3[01])[-\/.](?:0[1-9]|1[0-2])[-\/.](?:20)?\d{2})\b/, // 15-05-2024
    /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+20\d{2})\b/i, // May 15, 2024
  ];

  for (const line of lines) {
    let dateFound = false;
    for (const regex of dateRegexes) {
      const match = line.match(regex);
      if (match && match[1]) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          purchaseDate = parsed.toISOString().split('T')[0];
          dateFound = true;
          break;
        }
      }
    }
    if (dateFound) break;
  }

  // 3. Extract Warranty Period (months or years)
  let warrantyMonths = 12; // Default 1 year
  const warrantyRegexMonth = /(\d{1,2})\s*(?:month|mths|mon|mth)/i;
  const warrantyRegexYear = /(\d{1,2})\s*(?:year|yr|yrs)/i;

  for (const line of lines) {
    const monthMatch = line.match(warrantyRegexMonth);
    if (monthMatch && monthMatch[1]) {
      warrantyMonths = parseInt(monthMatch[1], 10);
      break;
    }
    const yearMatch = line.match(warrantyRegexYear);
    if (yearMatch && yearMatch[1]) {
      warrantyMonths = parseInt(yearMatch[1], 10) * 12;
      break;
    }
  }

  // 4. Extract Total Price / Amount
  let price = 0;
  const priceRegex = /(?:total|amount|paid|sum|due|\$|€|£)\s*[:$€£]?\s*(\d+[\.,]\d{2})/i;
  for (const line of lines) {
    const match = line.match(priceRegex);
    if (match && match[1]) {
      const cleaned = match[1].replace(',', '.');
      const val = parseFloat(cleaned);
      if (!isNaN(val) && val > 0) {
        price = val;
        break;
      }
    }
  }

  // Fallback price search if no keyword match
  if (price === 0) {
    const standalonePrice = /\b(\d{2,5}\.\d{2})\b/;
    for (const line of lines) {
      const match = line.match(standalonePrice);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val > 0) {
          price = val;
          break;
        }
      }
    }
  }

  // 5. Extract Brand & Product Name from prominent lines
  const knownBrands = [
    'Apple', 'Samsung', 'Sony', 'LG', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer',
    'Bose', 'Logitech', 'Philips', 'Whirlpool', 'Bosch', 'Panasonic', 'Dyson',
    'Microsoft', 'Canon', 'Nikon', 'Xiaomi', 'OnePlus', 'Anker', 'JBL', 'Nike', 'Adidas'
  ];

  let brand = '';
  for (const line of lines) {
    for (const b of knownBrands) {
      if (line.toLowerCase().includes(b.toLowerCase())) {
        brand = b;
        break;
      }
    }
    if (brand) break;
  }

  // Determine Product Name from header lines
  let productName = lines[0] || 'Scanned Product';
  // Skip generic store header words if present
  const skipWords = ['receipt', 'invoice', 'thank you', 'welcome', 'store', 'official', 'bill', 'tax', 'cashier'];
  for (const line of lines) {
    const lower = line.toLowerCase();
    const isSkip = skipWords.some((w) => lower.includes(w));
    if (!isSkip && line.length > 3 && !line.match(/^\d+$/)) {
      productName = line;
      break;
    }
  }

  // Clean up productName if it includes brand prefix duplicate
  if (brand && productName.toLowerCase().startsWith(brand.toLowerCase())) {
    productName = productName.substring(brand.length).trim();
    if (!productName) productName = brand;
  }

  return {
    productName,
    brand: brand || 'Generic Brand',
    purchaseDate,
    warrantyMonths,
    invoiceNumber: invoiceNumber || 'INV-' + Math.floor(100000 + Math.random() * 900000),
    price,
    rawOcrText: text,
  };
};

/**
 * Perform OCR on a given image file using Tesseract.js
 * @param {string} filePath 
 * @returns {Promise<Object>} Extracted and parsed receipt details
 */
const processImageOcr = async (filePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng',
      {
        logger: (m) => console.log(`[OCR Progress] ${m.status}: ${Math.round((m.progress || 0) * 100)}%`),
      }
    );

    const parsedData = parseOcrText(text);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    return {
      success: false,
      error: error.message,
      data: parseOcrText(''),
    };
  }
};

module.exports = { processImageOcr, parseOcrText };
