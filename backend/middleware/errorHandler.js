// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
