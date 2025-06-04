const cloudinary = require('cloudinary').v2;

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary deletion error:", err);
  }
};

module.exports = { deleteFromCloudinary };
