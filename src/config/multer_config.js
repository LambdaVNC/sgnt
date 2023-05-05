const multer = require("multer");
const path = require("path");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/activity_image"));
  },
  filename: (req, file, cb) => {
    cb(null, req.user.email + path.extname(file.originalname));
  },
});

const getFileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: getFileFilter,
});

module.exports = uploadImage;
