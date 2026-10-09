import { Response, NextFunction } from 'express';
import User, { IUser } from '../models/UserModel';
import { AuthRequest } from '../utils/authMiddleware';

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        farmName: user.farmName,
        farmLocation: user.farmLocation,
        farmSize: user.farmSize,
        farmingType: user.farmingType,
        certifications: user.certifications,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      name,
      phone,
      address,
      farmName,
      farmLocation,
      farmSize,
      farmingType,
      certifications,
      bio
    } = req.body;

    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (farmName) user.farmName = farmName;
    if (farmLocation) user.farmLocation = farmLocation;
    if (farmSize) user.farmSize = farmSize;
    if (farmingType) user.farmingType = farmingType;
    if (certifications) user.certifications = certifications;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        farmName: user.farmName,
        farmLocation: user.farmLocation,
        farmSize: user.farmSize,
        farmingType: user.farmingType,
        certifications: user.certifications,
        bio: user.bio,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};
