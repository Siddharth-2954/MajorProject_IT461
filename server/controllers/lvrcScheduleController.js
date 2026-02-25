const lvrcScheduleModel = require("../models/lvrcScheduleModel");

// Create LVRC Schedule
exports.createSchedule = async (req, res) => {
  try {
    const { subjectId, title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity, relatedLvcScheduleId } = req.body;
    
    if (!subjectId || !title || !scheduledDate || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: "subjectId, title, scheduledDate, startTime, and endTime are required" 
      });
    }

    if (endTime <= startTime) {
      return res.status(400).json({ 
        success: false, 
        error: "End time must be after start time" 
      });
    }

    const scheduleId = await lvrcScheduleModel.createSchedule({
      subjectId,
      title,
      description,
      scheduledDate,
      startTime,
      endTime,
      instructorName,
      meetingLink,
      capacity,
      relatedLvcScheduleId
    });

    return res.json({
      success: true,
      id: scheduleId,
      message: "LVRC Schedule created successfully"
    });
  } catch (err) {
    console.error("Create LVRC schedule error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get Schedules by Subject
exports.getSchedulesBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    if (!subjectId) {
      return res.status(400).json({ success: false, error: "subjectId is required" });
    }

    const schedules = await lvrcScheduleModel.getSchedulesBySubject(subjectId);

    return res.json({
      success: true,
      schedules
    });
  } catch (err) {
    console.error("Get LVRC schedules error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get All Schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const schedules = await lvrcScheduleModel.getAllSchedules(Number(limit));
    console.log('getAllSchedules called (LVRC), returned:', schedules);

    return res.json({
      success: true,
      schedules,
      count: schedules.length
    });
  } catch (err) {
    console.error("Get all LVRC schedules error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to fetch schedules from database" 
    });
  }
};

// Get Schedule by ID
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" });
    }

    const schedule = await lvrcScheduleModel.getScheduleById(id);

    if (!schedule) {
      return res.status(404).json({ success: false, error: "Schedule not found" });
    }

    return res.json({
      success: true,
      schedule
    });
  } catch (err) {
    console.error("Get LVRC schedule error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Update Schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" });
    }

    if (startTime && endTime && endTime <= startTime) {
      return res.status(400).json({ 
        success: false, 
        error: "End time must be after start time" 
      });
    }

    const updated = await lvrcScheduleModel.updateSchedule(id, {
      title,
      description,
      scheduledDate,
      startTime,
      endTime,
      instructorName,
      meetingLink,
      capacity
    });

    if (updated === 0) {
      return res.status(404).json({ success: false, error: "Schedule not found" });
    }

    return res.json({
      success: true,
      message: "LVRC Schedule updated successfully"
    });
  } catch (err) {
    console.error("Update LVRC schedule error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Delete Schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" });
    }

    const deleted = await lvrcScheduleModel.deleteSchedule(id);

    if (deleted === 0) {
      return res.status(404).json({ success: false, error: "Schedule not found" });
    }

    return res.json({
      success: true,
      message: "LVRC Schedule deleted successfully"
    });
  } catch (err) {
    console.error("Delete LVRC schedule error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Auto-create LVRC schedules 36 hours after LVC
exports.autoCreateLVRCFromLVC = async (req, res) => {
  try {
    const { lvcScheduleId, subjectId, title, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity } = req.body;
    
    if (!lvcScheduleId || !subjectId || !title || !scheduledDate || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: "Required fields missing" 
      });
    }

    // Calculate LVRC date: 36 hours after LVC
    const lvcDateTime = new Date(`${scheduledDate}T${startTime}`);
    const lvrcDateTime = new Date(lvcDateTime.getTime() + 36 * 60 * 60 * 1000);
    
    const lvrcDate = lvrcDateTime.toISOString().split('T')[0];
    const lvrcTime = lvrcDateTime.toTimeString().split(' ')[0];
    const lvrcEndTime = new Date(lvrcDateTime.getTime() + (new Date(`${scheduledDate}T${endTime}`) - new Date(`${scheduledDate}T${startTime}`))).toTimeString().split(' ')[0];

    const scheduleId = await lvrcScheduleModel.createSchedule({
      subjectId,
      title: `${title} (Revision)`,
      description: `Revision session for ${title}`,
      scheduledDate: lvrcDate,
      startTime: lvrcTime,
      endTime: lvrcEndTime,
      instructorName,
      meetingLink,
      capacity,
      relatedLvcScheduleId: lvcScheduleId
    });

    return res.json({
      success: true,
      id: scheduleId,
      message: "LVRC Schedule auto-created 36 hours after LVC",
      lvrcDateTime: { date: lvrcDate, time: lvrcTime }
    });
  } catch (err) {
    console.error("Auto-create LVRC error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};
