import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { requestSchemas } from '../middleware/validation';
import logger from '../utils/logger';
import RequestModel from '../models/Request';

const router = Router();

// All request routes require authentication
router.use(authenticate);

// Get all requests
router.get('/', async (req, res) => {
  try {
    logger.info('📋 Fetching requests from database');
    
    const requests = await RequestModel.findAll();
    
    // Transform the data to match frontend expectations
    const transformedRequests = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      category: 'maintenance', // Default for now since we're not using category_id yet
      priority: request.priority,
      status: request.status,
      isAnonymous: request.is_anonymous,
      userId: request.user_id,
      roomNumber: request.room_number || 'Unknown',
      upvotes: [], // Will implement upvote tracking later
      timestamp: new Date(request.created_at).toLocaleDateString(),
      adminNotes: request.status === 'resolved' ? 'Request has been resolved' : undefined,
    }));
    
    res.json({
      success: true,
      data: transformedRequests,
    });
  } catch (error) {
    logger.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests',
    });
  }
});

// Create request
router.post('/', validate(requestSchemas.create), async (req, res) => {
  try {
    logger.info('📝 Creating request in database:', { 
      body: req.body, 
      user: req.user?.id
    });
    
    const requestData = {
      user_id: req.user.id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      is_anonymous: req.body.isAnonymous || false,
      photos: req.body.photos || [],
    };
    
    const newRequest = await RequestModel.create(requestData);
    
    // Transform response to match frontend expectations
    const transformedRequest = {
      id: newRequest.id,
      title: newRequest.title,
      description: newRequest.description,
      category: req.body.category, // Keep the original category from request
      priority: newRequest.priority,
      isAnonymous: newRequest.is_anonymous,
      status: newRequest.status,
      userId: newRequest.user_id,
      upvotes: [],
      timestamp: new Date(newRequest.created_at).toLocaleDateString(),
    };
    
    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: transformedRequest,
    });
  } catch (error) {
    logger.error('❌ Error creating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request',
    });
  }
});

// Upvote request
router.post('/:id/upvote', async (req, res) => {
  try {
    logger.info(`👍 Upvoting request ${req.params.id} in database`);
    
    const updatedRequest = await RequestModel.incrementUpvotes(req.params.id);
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        upvotes: updatedRequest.upvotes
      }
    });
  } catch (error) {
    logger.error('❌ Error upvoting request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upvote request',
    });
  }
});

// Update request
router.put('/:id', async (req, res) => {
  try {
    logger.info(`Updating request ${req.params.id} (mock response for now)`);
    
    res.json({
      success: true,
      message: 'Request updated successfully',
    });
  } catch (error) {
    logger.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update request',
    });
  }
});

export default router;