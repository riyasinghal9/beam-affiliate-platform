const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products - Get all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.isActive) {
      return res.status(404).json({ message: 'Product not available' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Error fetching product',
      error: error.message 
    });
  }
});

// GET /api/products/beam/:beamWalletProductId - Get product by Beam Wallet ID
router.get('/beam/:beamWalletProductId', async (req, res) => {
  try {
    const product = await Product.findOne({ 
      beamWalletProductId: req.params.beamWalletProductId,
      isActive: true 
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by Beam Wallet ID:', error);
    res.status(500).json({ 
      message: 'Error fetching product',
      error: error.message 
    });
  }
});

// GET /api/products/category/:category - Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ 
      category: req.params.category,
      isActive: true 
    }).sort({ sortOrder: 1, createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ 
      message: 'Error fetching products',
      error: error.message 
    });
  }
});

module.exports = router; 