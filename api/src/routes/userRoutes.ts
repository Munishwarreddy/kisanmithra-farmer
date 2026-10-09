import { Router, Request, Response, NextFunction } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { verifyToken, authorizeRoles } from '../utils/authMiddleware';

const router = Router();

// All user routes will be protected
router.use(verifyToken);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', updateProfile);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authorizeRoles('admin'), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Get all users endpoint - to be implemented (Admin only)'
  });
});

export default router;
