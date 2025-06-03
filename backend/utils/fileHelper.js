const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fsSync.existsSync(uploadDir)) {
    fsSync.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

/**
 * Helper function to delete a file from the filesystem
 * @param {string} filePath - Path to the file to be deleted
 */
const deleteFile = async (filePath) => {
  try {
    // Check if file exists before attempting to delete
    if (filePath && fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};

// Create uploads directory on module load
ensureUploadsDir();

module.exports = {
  deleteFile,
  ensureUploadsDir
}; 