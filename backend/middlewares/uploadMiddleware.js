import multer from "multer";

// Set multer to store files in memory as Buffer (to send to Cloudinary)
const storage = multer.memoryStorage();

// Set file filter to only accept image types (optional but good practice)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    // Check if file is an image
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
