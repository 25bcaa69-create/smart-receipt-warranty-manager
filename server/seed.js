const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Receipt = require('./models/Receipt');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_receipt_warranty_db';
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    // Clear existing collections
    await User.deleteMany({});
    await Receipt.deleteMany({});

    // Create Demo User
    const demoUser = await User.create({
      name: 'Alex Morgan',
      email: 'demo@smartreceipt.app',
      password: 'password123',
    });

    console.log(`Created Demo User: ${demoUser.email} (Password: password123)`);

    const now = new Date();

    // 1. Active Warranty Item (> 30 days away)
    const activePurchase = new Date();
    activePurchase.setMonth(activePurchase.getMonth() - 2); // 2 months ago
    const activeExpiry = new Date(activePurchase);
    activeExpiry.setMonth(activeExpiry.getMonth() + 24); // 24 month warranty

    // 2. Expiring Soon Item (Within 30 days)
    const expiringPurchase = new Date();
    expiringPurchase.setMonth(expiringPurchase.getMonth() - 11); // 11 months ago
    const expiringExpiry = new Date();
    expiringExpiry.setDate(expiringExpiry.getDate() + 14); // 14 days from today

    // 3. Expired Item
    const expiredPurchase = new Date();
    expiredPurchase.setFullYear(expiredPurchase.getFullYear() - 2); // 2 years ago
    const expiredExpiry = new Date();
    expiredExpiry.setMonth(expiredExpiry.getMonth() - 3); // Expired 3 months ago

    // Seed Receipts
    await Receipt.create([
      {
        user: demoUser._id,
        productName: 'MacBook Pro M3 Max 16-inch',
        brand: 'Apple',
        category: 'Electronics',
        invoiceNumber: 'INV-APP-98241',
        purchaseDate: activePurchase,
        warrantyMonths: 24,
        expiryDate: activeExpiry,
        price: 3499.00,
        notes: 'Serial Number: C02G90XXMD6M. Purchased with AppleCare+ extended warranty coverage.',
      },
      {
        user: demoUser._id,
        productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
        brand: 'Sony',
        category: 'Electronics',
        invoiceNumber: 'INV-SNY-44102',
        purchaseDate: expiringPurchase,
        warrantyMonths: 12,
        expiryDate: expiringExpiry,
        price: 398.00,
        notes: 'Expiring soon! Needs right earcup pad replacement check.',
      },
      {
        user: demoUser._id,
        productName: 'Dyson V15 Detect Cordless Vacuum',
        brand: 'Dyson',
        category: 'Appliances',
        invoiceNumber: 'INV-DYS-11029',
        purchaseDate: expiredPurchase,
        warrantyMonths: 12,
        expiryDate: expiredExpiry,
        price: 749.99,
        notes: 'Battery replaced under warranty in 2025.',
      },
      {
        user: demoUser._id,
        productName: 'Samsung Odyssey G9 Gaming Monitor',
        brand: 'Samsung',
        category: 'Electronics',
        invoiceNumber: 'INV-SAM-66710',
        purchaseDate: new Date(2025, 5, 10),
        warrantyMonths: 36,
        expiryDate: new Date(2028, 5, 10),
        price: 1299.50,
        notes: '49-inch curved QD-OLED display panel.',
      },
    ]);

    console.log('Successfully seeded sample receipts and warranties!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
