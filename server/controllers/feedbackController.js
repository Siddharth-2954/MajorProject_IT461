const feedbackModel = require('../models/feedbackModel');

async function addFeedback(req, res) {
  try {
    const feedbackData = req.body;
    
    if (!feedbackData.scheduleId || !feedbackData.scheduleType || !feedbackData.studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: scheduleId, scheduleType, studentId'
      });
    }

    const feedbackId = await feedbackModel.addFeedback(feedbackData);
    
    res.status(201).json({
      success: true,
      message: 'Feedback added successfully',
      feedbackId
    });
  } catch (err) {
    console.error('addFeedback error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add feedback',
      error: err.message
    });
  }
}

async function getFeedbacks(req, res) {
  try {
    const { scheduleType = 'lvc', limit = 100, offset = 0 } = req.query;
    
    const feedbacks = await feedbackModel.getFeedbacksByScheduleType(
      scheduleType,
      parseInt(limit, 10),
      parseInt(offset, 10)
    );
    
    const count = await feedbackModel.getFeedbackCount(scheduleType);
    
    res.status(200).json({
      success: true,
      feedbacks,
      count,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (err) {
    console.error('getFeedbacks error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: err.message
    });
  }
}

async function getFeedbacksBySchedule(req, res) {
  try {
    const { scheduleId } = req.params;
    const { scheduleType = 'lvc' } = req.query;
    
    if (!scheduleId) {
      return res.status(400).json({
        success: false,
        message: 'scheduleId is required'
      });
    }

    const feedbacks = await feedbackModel.getFeedbacksBySchedule(
      parseInt(scheduleId, 10),
      scheduleType
    );
    
    res.status(200).json({
      success: true,
      feedbacks,
      count: feedbacks.length
    });
  } catch (err) {
    console.error('getFeedbacksBySchedule error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: err.message
    });
  }
}

async function getFeedbackById(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Feedback ID is required'
      });
    }

    const feedback = await feedbackModel.getFeedbackById(parseInt(id, 10));
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      feedback
    });
  } catch (err) {
    console.error('getFeedbackById error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: err.message
    });
  }
}

async function deleteFeedback(req, res) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Feedback ID is required'
      });
    }

    const deleted = await feedbackModel.deleteFeedback(parseInt(id, 10));
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (err) {
    console.error('deleteFeedback error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: err.message
    });
  }
}

module.exports = {
  addFeedback,
  getFeedbacks,
  getFeedbacksBySchedule,
  getFeedbackById,
  deleteFeedback
};
