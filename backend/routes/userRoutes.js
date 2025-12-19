const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  registerUser,
  loginUser,
  getUsers,
} = require("../controllers/userControllers");

const { uploadUserImage } = require("../controllers/uploadControllers");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUsers);

router.post("/upload/:id", upload.single("image"), uploadUserImage);

module.exports = router;
