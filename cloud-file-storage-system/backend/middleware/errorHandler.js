function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "The selected file is too large" });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "That email is already registered" });
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
    return res.status(400).json({ message });
  }

  res.status(error.status || 500).json({
    message: error.message || "Internal server error"
  });
}

module.exports = { notFound, errorHandler };
