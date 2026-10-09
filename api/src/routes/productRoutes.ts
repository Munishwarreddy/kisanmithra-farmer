import { Router } from 'express';
import { verifyToken } from '../utils/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get all products endpoint - to be implemented'
  });
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product
 * @access  Public
 */
router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get product endpoint - to be implemented'
  });
});

/**
 * @route   POST /api/products
 * @desc    Create new product (Farmer only)
 * @access  Private/Farmer
 */
router.post('/', verifyToken, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create product endpoint - to be implemented (Farmer only)'
  });
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (Farmer only)
 * @access  Private/Farmer
 */
router.put('/:id', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update product endpoint - to be implemented (Farmer only)'
  });
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (Farmer only)
 * @access  Private/Farmer
 */
router.delete('/:id', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete product endpoint - to be implemented (Farmer only)'
  });
});

export default router;
