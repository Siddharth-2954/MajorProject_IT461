const express = require('express');
const router = express.Router();
const lvcScheduleModel = require('../models/lvcScheduleModel');
const lvrcScheduleModel = require('../models/lvrcScheduleModel');

// Public endpoint to get all LVC schedules (no authentication required)
router.get('/lvc', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const schedules = await lvcScheduleModel.getAllSchedules(Number(limit));
    
    return res.json({
      success: true,
      schedules,
      count: schedules.length
    });
  } catch (err) {
    console.error('Error fetching LVC schedules:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to fetch LVC schedules" 
    });
  }
});

// Public endpoint to get LVC by subject
router.get('/lvc/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const schedules = await lvcScheduleModel.getSchedulesBySubject(subjectId);
    
    return res.json({
      success: true,
      schedules
    });
  } catch (err) {
    console.error('Error fetching LVC schedules:', err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch LVC schedules" 
    });
  }
});

// Public endpoint to get all LVRC schedules (no authentication required)
router.get('/lvrc', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const schedules = await lvrcScheduleModel.getAllSchedules(Number(limit));
    
    return res.json({
      success: true,
      schedules,
      count: schedules.length
    });
  } catch (err) {
    console.error('Error fetching LVRC schedules:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to fetch LVRC schedules" 
    });
  }
});

// Public endpoint to get LVRC by subject
router.get('/lvrc/subject/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const schedules = await lvrcScheduleModel.getSchedulesBySubject(subjectId);
    
    return res.json({
      success: true,
      schedules
    });
  } catch (err) {
    console.error('Error fetching LVRC schedules:', err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch LVRC schedules" 
    });
  }
});

module.exports = router;
