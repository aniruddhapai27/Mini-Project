const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const cloudinary = require("./cloudinaryConfig");

const folderSelector = (req, file) => {
  if (file.fieldname === "resume") {
    return "mini-project/resumes";
  } else if (file.fieldname === "profilePic") {
    return "mini-project/profile-pics";
  }
  return "mini-project/other";
};

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed for resumes"), false);
    }
  } else if (file.fieldname === "profilePic") {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"), false);
    }
  } else {
    cb(null, false); // Skip unsupported fields, don't throw error
  }
};

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (!file) return null; // If no file, don't upload anything
    return {
      folder: folderSelector(req, file),
      resource_type: "auto",
      public_id: `${file.fieldname}-${Date.now()}`,
    };
  },
});

const upload = multer({
  storage: cloudinaryStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
