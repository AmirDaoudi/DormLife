import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { UserModel } from '../models/User';
import logger from '../utils/logger';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          roomNumber: user.roomNumber,
          profilePhotoUrl: user.profilePhotoUrl,
          year: user.year,
          emergencyContact: user.emergencyContact,
          schoolId: user.schoolId,
          role: user.role,
          preferences: user.preferences,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const updatedUser = await UserModel.update(req.user.id, req.body);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

export default router;