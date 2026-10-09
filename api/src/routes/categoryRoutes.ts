import { Router } from 'express';
import { verifyToken, authorizeRoles } from '../utils/authMiddleware.js';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get categories endpoint - to be implemented'
  });
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get single category
 * @access  Public
 */
router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get category endpoint - to be implemented'
  });
});

/**
 * @route   POST /api/categories
 * @desc    Create new category (Admin only)
 * @access  Private/Admin
 */
router.post('/', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create category endpoint - to be implemented (Admin only)'
  });
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (Admin only)
 * @access  Private/Admin
 */
router.put('/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Update category endpoint - to be implemented (Admin only)'
  });
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delete category endpoint - to be implemented (Admin only)'
  });
});

export default router;
