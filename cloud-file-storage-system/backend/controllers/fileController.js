const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const File = require("../models/File");

function getBucket() {
  if (!mongoose.connection.db) {
    throw new Error("Database is not ready");
  }

  return new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });
}

function safeDownloadName(name) {
  return String(name).replace(/[\r\n"]/g, "_");
}

// =====================
// Upload File
// =====================
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file."
      });
    }

    const bucket = getBucket();

    const storedName =
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2) +
      "-" +
      req.file.originalname;

    const uploadStream = bucket.openUploadStream(storedName, {
      contentType: req.file.mimetype,
      metadata: {
        owner: req.user._id.toString(),
        originalName: req.file.originalname
      }
    });

    uploadStream.end(req.file.buffer);

    await new Promise((resolve, reject) => {
      uploadStream.on("finish", resolve);
      uploadStream.on("error", reject);
    });

    const file = await File.create({
      originalName: req.file.originalname,
      storedName,
      gridFsId: uploadStream.id,
      mimeType: req.file.mimetype,
      size: req.file.size,
      owner: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully.",
      file
    });

  } catch (error) {
    next(error);
  }
}

// =====================
// List Files
// =====================
async function listFiles(req, res, next) {
  try {
    const search = String(req.query.search || "").trim();

    const query = {
      owner: req.user._id,
    };

    if (search) {
      query.originalName = {
        $regex: search,
        $options: "i",
      };
    }

    const files = await File.find(query).sort({ createdAt: -1 });

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    res.json({
      count: files.length,
      totalSize,
      files,
    });
  } catch (error) {
    next(error);
  }
}

// =====================
// Download File
// =====================
async function downloadFile(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid file ID",
      });
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeDownloadName(file.originalName)}"`
    );

    const downloadStream = getBucket().openDownloadStream(file.gridFsId);

    downloadStream.on("error", next);

    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
}

// =====================
// Delete File
// =====================
async function deleteFile(req, res, next) {
  try {

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    const bucket = getBucket();

    try {
      await bucket.delete(file.gridFsId);
    } catch (err) {
      console.log("GridFS file already deleted.");
    }

    await file.deleteOne();

    res.json({
      success: true,
      message: "File deleted successfully."
    });

  } catch (err) {
    next(err);
  }
}

async function renameFile(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "File name is required."
      });
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found."
      });
    }

    file.originalName = name.trim();
    await file.save();

    res.json({
      success: true,
      message: "File renamed successfully.",
      file
    });

  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
  renameFile
};