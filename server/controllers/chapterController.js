const chapterModel = require("../models/chapterModel");

exports.createChapter = async (req, res) => {
  try {
    const { subjectId, name, description } = req.body;

    if (!subjectId || !name) {
      return res.status(400).json({
        success: false,
        error: "subjectId and name are required",
      });
    }

    const chapterId = await chapterModel.createChapter({
      subjectId,
      name,
      description,
    });

    return res.json({
      success: true,
      message: "Chapter created successfully",
      id: chapterId,
    });
  } catch (err) {
    console.error("Create chapter error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        error: "Chapter with this name already exists for this subject",
      });
    }
    return res.status(500).json({ success: false, error: "server error" });
  }
};

exports.getChaptersBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        error: "subjectId is required",
      });
    }

    const chapters = await chapterModel.getChaptersBySubject(subjectId);

    return res.json({
      success: true,
      chapters,
    });
  } catch (err) {
    console.error("Get chapters error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "id is required",
      });
    }

    const chapter = await chapterModel.getChapterById(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: "Chapter not found",
      });
    }

    return res.json({
      success: true,
      chapter,
    });
  } catch (err) {
    console.error("Get chapter error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "id is required",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "name is required",
      });
    }

    const updated = await chapterModel.updateChapter(id, { name, description });

    if (updated === 0) {
      return res.status(404).json({
        success: false,
        error: "Chapter not found",
      });
    }

    return res.json({
      success: true,
      message: "Chapter updated successfully",
    });
  } catch (err) {
    console.error("Update chapter error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        error: "Chapter with this name already exists for this subject",
      });
    }
    return res.status(500).json({ success: false, error: "server error" });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "id is required",
      });
    }

    const deleted = await chapterModel.deleteChapter(id);

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: "Chapter not found",
      });
    }

    return res.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (err) {
    console.error("Delete chapter error:", err);
    return res.status(500).json({ success: false, error: "server error" });
  }
};
