const express = require("express");
const multer = require("multer");
const protect = require("../middleware/auth");
const {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
  renameFile
} = require("../controllers/fileController");

const router = express.Router();

const maxFileSize =
  Number(process.env.MAX_FILE_SIZE_MB || 25) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
    files: 1
  }
});

router.use(protect);

router.get("/", listFiles);
router.post("/upload", upload.single("file"), uploadFile);
router.get("/:id/download", downloadFile);
router.patch("/:id", renameFile);
router.delete("/:id", deleteFile);

module.exports = router;
