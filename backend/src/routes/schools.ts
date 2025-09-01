import { Router } from 'express';
import { SchoolModel } from '../models/School';
import { authenticate, requireRole } from '../middleware/auth';
import logger from '../utils/logger';

const router = Router();

// Get all schools (public route for registration)
router.get('/', async (req, res) => {
  try {
    const schools = await SchoolModel.findAll();
    
    res.json({
      success: true,
      data: schools.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        logoUrl: school.logoUrl,
      })),
    });
  } catch (error) {
    logger.error('Error fetching schools:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schools',
    });
  }
});

// Get school by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const school = await SchoolModel.findById(id);
    
    if (!school) {
      res.status(404).json({
        success: false,
        error: 'School not found',
      });
      return;
    }

    res.json({
      success: true,
      data: school,
    });
  } catch (error) {
    logger.error('Error fetching school:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school',
    });
  }
});

// Get school statistics (admin only)
router.get('/:id/stats', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user belongs to this school
    if (req.user.schoolId !== id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    const stats = await SchoolModel.getSchoolStats(id);
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching school stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch school statistics',
    });
  }
});

export default router;