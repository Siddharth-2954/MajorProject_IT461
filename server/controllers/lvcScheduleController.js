const lvcScheduleModel = require("../models/lvcScheduleModel");
const lvrcScheduleModel = require("../models/lvrcScheduleModel");
const studyMaterialModel = require("../models/studyMaterialModel");

const normalizeSchedule = (schedule) => {
  if (!schedule) return schedule;
  const rawDate = schedule.scheduledDate;
  let normalizedDate = rawDate;

  if (rawDate instanceof Date) {
    normalizedDate = rawDate.toISOString().slice(0, 10);
  } else if (typeof rawDate === "string") {
    normalizedDate = rawDate.split("T")[0];
  }

  return {
    ...schedule,
    scheduledDate: normalizedDate,
  };
};

// Create LVC Schedule
exports.createSchedule = async (req, res) => {
  try {
    const { subjectId, title, description, scheduledDate, startTime, endTime, instructorName, meetingLink, capacity } = req.body;
    
    if (!subjectId || !title || !scheduledDate || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        error: "subjectId, title, scheduledDate, startTime, and endTime are required" 
      });
    }

    // Validate time format and ensure endTime > startTime
    if (endTime <= startTime) {
      return res.status(400).json({ 
        success: false, 
        error: "End time must be after start time" 
      });
    }

    const scheduleId = await lvcScheduleModel.createSchedule({
      subjectId,
      title,
      description,
      scheduledDate,
      startTime,
      endTime,
      instructorName,
      meetingLink,
      capacity
    });

    // Auto-create LVRC schedules for all subjects 36 hours after LVC
    try {
      // Parse LVC date and time
      const lvcDateTime = new Date(`${scheduledDate}T${startTime}`);
      
      // Add 36 hours (36 * 60 * 60 * 1000 milliseconds)
      const lvrcTotalMs = lvcDateTime.getTime() + (36 * 60 * 60 * 1000);
      const lvrcDateTime = new Date(lvrcTotalMs);
      
      // Calculate LVRC date in YYYY-MM-DD format
      const lvrcYear = lvrcDateTime.getFullYear();
      const lvrcMonth = String(lvrcDateTime.getMonth() + 1).padStart(2, '0');
      const lvrcDay = String(lvrcDateTime.getDate()).padStart(2, '0');
      const lvrcDate = `${lvrcYear}-${lvrcMonth}-${lvrcDay}`;
      
      // Calculate LVRC start time in HH:MM:SS format
      const lvrcHour = String(lvrcDateTime.getHours()).padStart(2, '0');
      const lvrcMinute = String(lvrcDateTime.getMinutes()).padStart(2, '0');
      const lvrcSecond = String(lvrcDateTime.getSeconds()).padStart(2, '0');
      const lvrcTime = `${lvrcHour}:${lvrcMinute}:${lvrcSecond}`;
      
      // Calculate duration in milliseconds
      const startMs = new Date(`${scheduledDate}T${startTime}`).getTime();
      const endMs = new Date(`${scheduledDate}T${endTime}`).getTime();
      const durationMs = endMs - startMs;
      
      // Calculate LVRC end time
      const lvrcEndTotalMs = lvrcTotalMs + durationMs;
      const lvrcEndDateTime = new Date(lvrcEndTotalMs);
      const lvrcEndHour = String(lvrcEndDateTime.getHours()).padStart(2, '0');
      const lvrcEndMinute = String(lvrcEndDateTime.getMinutes()).padStart(2, '0');
      const lvrcEndSecond = String(lvrcEndDateTime.getSeconds()).padStart(2, '0');
      const lvrcEndTime = `${lvrcEndHour}:${lvrcEndMinute}:${lvrcEndSecond}`;

      // Get all subjects to create LVRC for each
      const allSubjects = await studyMaterialModel.getAllSubjects();
      
      console.log(`Creating LVRC for ${allSubjects.length} subjects. LVRC Date: ${lvrcDate}, Time: ${lvrcTime} - ${lvrcEndTime}`);
      
      for (const subject of allSubjects) {
        try {
          await lvrcScheduleModel.createSchedule({
            subjectId: subject.id,
            title: `${title} - Revision`,
            description: `Revision session for ${title}`,
            scheduledDate: lvrcDate,
            startTime: lvrcTime,
            endTime: lvrcEndTime,
            instructorName: instructorName || 'TBD',
            meetingLink: meetingLink || '',
            capacity: capacity || 0,
            relatedLvcScheduleId: scheduleId
          });
          console.log(`✓ LVRC created for subject ${subject.id}`);
        } catch (subjectError) {
          console.error(`Failed to create LVRC for subject ${subject.id}:`, subjectError);
          // Continue creating for other subjects even if one fails
        }
      }
    } catch (lvrcError) {
      console.error("Auto-create LVRC error (non-blocking):", lvrcError);
      // Don't fail the LVC creation if LVRC auto-creation fails
    }

    return res.json({
      success: true,
      id: scheduleId,
      message: "Schedule created successfully and LVRC auto-created for all subjects after 36 hours"
    });
  } catch (err) {
    console.error("Create schedule error:", err);
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

    const schedules = await lvcScheduleModel.getSchedulesBySubject(subjectId);

    return res.json({
      success: true,
      schedules: schedules.map(normalizeSchedule)
    });
  } catch (err) {
    console.error("Get schedules error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

// Get All Schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const { limit = 100 } = req.query;

    const schedules = await lvcScheduleModel.getAllSchedules(Number(limit));
    console.log('getAllSchedules called, returned:', schedules);

    return res.json({
      success: true,
      schedules: schedules.map(normalizeSchedule),
      count: schedules.length
    });
  } catch (err) {
    console.error("Get all schedules error:", err);
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

    const schedule = await lvcScheduleModel.getScheduleById(id);

    if (!schedule) {
      return res.status(404).json({ success: false, error: "Schedule not found" });
    }

    return res.json({
      success: true,
      schedule: normalizeSchedule(schedule)
    });
  } catch (err) {
    console.error("Get schedule error:", err);
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

    const updated = await lvcScheduleModel.updateSchedule(id, {
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
      message: "Schedule updated successfully"
    });
  } catch (err) {
    console.error("Update schedule error:", err);
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

    const deleted = await lvcScheduleModel.deleteSchedule(id);

    if (deleted === 0) {
      return res.status(404).json({ success: false, error: "Schedule not found" });
    }

    return res.json({
      success: true,
      message: "Schedule deleted successfully"
    });
  } catch (err) {
    console.error("Delete schedule error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};
